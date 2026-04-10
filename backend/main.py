from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv
import os, io, zipfile, re, secrets, hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional
from collections import defaultdict
import httpx
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import jwt

load_dotenv()

app = FastAPI(title="Assignify API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "iloveassignify_admin_secret_key_09029507107"  # use same one as your login
ALGORITHM = "HS256"

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# ─── ADMIN CREDENTIALS (set these in your Render environment variables) ────────
# Add ADMIN_EMAIL and ADMIN_PASSWORD to your Render env vars
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@assignify.app")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "changeme_set_in_render")
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "admin_super_secret_key_change_this")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

security = HTTPBearer()


# ─── Departments ──────────────────────────────────────────────────────────────

DEPARTMENTS = [
    "Biology Education",
    "Chemistry Education",
    "Computer Science Education",
    "Educational Technology",
    "Mathematics Education",
    "Physics Education",
    "English Education",
    "Yoruba Education",
    "Social Studies Education",
    "Christian Religious Studies Education",
    "Islamic Studies Education",
    "History Education",
    "Political Science Education",
    "Educational Management",
    "Guidance & Counselling",
    "Educational Psychology",
    "Early Childhood Education",
    "Physical & Health Education",
    "Sports Science",
]


# ─── Auth helpers ─────────────────────────────────────────────────────────────

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Supabase JWT by calling Supabase auth.get_user()"""
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    


def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=12)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify our custom admin token (simple HMAC-signed string)."""
    token = credentials.credentials
    # Admin token format: "admin:<timestamp>:<signature>"
    try:
        parts = token.split(":")
        if len(parts) != 3 or parts[0] != "admin":
            raise HTTPException(status_code=403, detail="Not an admin token")
        timestamp = int(parts[1])
        signature = parts[2]
        # Check token is not older than 8 hours
        now_ts = int(datetime.now(timezone.utc).timestamp())
        if now_ts - timestamp > 28800:  # 8 hours
            raise HTTPException(status_code=401, detail="Admin session expired. Please log in again.")
        # Verify signature
        expected = hashlib.sha256(f"admin:{timestamp}:{ADMIN_SECRET}".encode()).hexdigest()[:32]
        if not secrets.compare_digest(signature, expected):
            raise HTTPException(status_code=403, detail="Invalid admin token")
        return True
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid admin token")


# ─── Auth endpoints ───────────────────────────────────────────────────────────

@app.post("/auth/register")
async def register(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
):
    """
    Register a new lecturer.
    - Returns 409 if email already exists (frontend shows proper error)
    - Supabase sends OTP email automatically
    NOTE: OTP digit count is controlled in Supabase Dashboard →
          Authentication → Email Templates → OTP length setting.
          Make sure it is set to 6 in your Supabase project settings.
    """
    try:
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {"full_name": full_name},
                "email_redirect_to": None,
            }
        })
        if response.user is None:
            raise HTTPException(status_code=400, detail="Registration failed. Please try again.")
        return {"message": "Verification code sent to your email"}
    except HTTPException:
        raise
    except Exception as e:
        detail = str(e).lower()
        if "already registered" in detail or "already been registered" in detail or "user already registered" in detail:
            # Return 409 so frontend can show "this email is already registered, please sign in"
            raise HTTPException(
                status_code=409,
                detail="An account with this email already exists. Please sign in instead."
            )
        raise HTTPException(status_code=400, detail="Registration failed. Please try again.")


@app.post("/auth/verify")
async def verify_otp(
    email: str = Form(...),
    code: str = Form(...),
):
    """Verify the 6-digit OTP sent to lecturer's email after registration."""
    try:
        response = supabase.auth.verify_otp({
            "email": email,
            "token": code,
            "type": "signup",
        })
        if not response.session:
            raise HTTPException(status_code=400, detail="Invalid or expired code. Please try again.")
        return {
            "token": response.session.access_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "full_name": response.user.user_metadata.get("full_name", ""),
            }
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired code. Please try again.")


@app.post("/auth/resend-code")
async def resend_code(email: str = Form(...)):
    """Resend OTP verification code."""
    try:
        supabase.auth.resend({"type": "signup", "email": email})
        return {"message": "New code sent"}
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to resend code")


@app.post("/auth/login")
async def login(
    email: str = Form(...),
    password: str = Form(...),
):
    """
    Login and return JWT token.
    - Returns specific error if email not confirmed yet
    - Returns generic error for wrong password (security best practice)
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password,
        })
        if not response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        full_name = response.user.user_metadata.get("full_name", "") if response.user.user_metadata else ""
        return {
            "token": response.session.access_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "full_name": full_name,
                "display_name": full_name,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        detail = str(e).lower()
        if "email not confirmed" in detail:
            raise HTTPException(
                status_code=401,
                detail="Please verify your email first. Check your inbox for a 6-digit code."
            )
        raise HTTPException(status_code=401, detail="Invalid email or password")


@app.post("/auth/forgot-password")
async def forgot_password(email: str = Form(...)):
    try:
        # Send reset email directly (no need to check users)
        supabase.auth.reset_password_for_email(email)

        return {"message": "If this email exists, a reset link has been sent"}

    except Exception as e:
        print("ERROR:", str(e))  # so you can see the real issue
        raise HTTPException(
            status_code=500,
            detail="Something went wrong. Please try again."
        )


# ─── Departments ──────────────────────────────────────────────────────────────

@app.get("/departments")
async def get_departments():
    return DEPARTMENTS


# ─── Assignments ─────────────────────────────────────────────────────────────

@app.get("/assignments")
async def get_assignments(user=Depends(get_current_user)):
    """
    BUG FIX: Now filters by lecturer_id = current user's ID.
    Previously fetched ALL assignments from ALL lecturers which caused
    the wrong dashboard showing for different users.
    """
    result = supabase.table("assignments")\
        .select("*")\
        .eq("lecturer_id", str(user.id))\
        .order("created_at", desc=True)\
        .execute()
    assignments = result.data

    # Add submission count for each assignment
    for a in assignments:
        count_result = supabase.table("submissions")\
            .select("id", count="exact")\
            .eq("assignment_id", a["id"])\
            .execute()
        a["submission_count"] = count_result.count or 0

    return assignments


@app.post("/assignments")
async def create_assignment(
    course_name: str = Form(...),
    title: str = Form(...),
    submission_type: str = Form(...),
    deadline: str = Form(...),
    number_of_groups: Optional[int] = Form(None),
    instructions: Optional[str] = Form(None),
    user=Depends(get_current_user)
):
    data = {
        "course_name": course_name,
        "title": title,
        "submission_type": submission_type,
        "deadline": deadline,
        "number_of_groups": number_of_groups,
        "instructions": instructions,
        "is_closed": False,
        "lecturer_id": str(user.id),
    }
    result = supabase.table("assignments").insert(data).execute()
    return result.data[0]


@app.patch("/assignments/{assignment_id}/close")
async def close_assignment(
    assignment_id: str,
    user=Depends(get_current_user)
):
    """Only the lecturer who owns this assignment can close it."""
    # Verify ownership
    existing = supabase.table("assignments")\
        .select("lecturer_id")\
        .eq("id", assignment_id)\
        .single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if existing.data["lecturer_id"] != str(user.id):
        raise HTTPException(status_code=403, detail="You don't have permission to close this assignment")

    result = supabase.table("assignments")\
        .update({"is_closed": True})\
        .eq("id", assignment_id)\
        .execute()
    return result.data[0]


@app.get("/assignments/{assignment_id}")
async def get_assignment(assignment_id: str):
    """PUBLIC endpoint — students need this to load assignment details."""
    result = supabase.table("assignments").select("*").eq("id", assignment_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return result.data


@app.delete("/assignments/{assignment_id}")
async def delete_assignment(assignment_id: str, user=Depends(get_current_user)):
    """Only the owner can delete their assignment."""
    existing = supabase.table("assignments")\
        .select("lecturer_id")\
        .eq("id", assignment_id)\
        .single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if existing.data["lecturer_id"] != str(user.id):
        raise HTTPException(status_code=403, detail="You don't have permission to delete this assignment")

    supabase.table("submissions").delete().eq("assignment_id", assignment_id).execute()
    supabase.table("assignments").delete().eq("id", assignment_id).execute()
    return {"message": "Assignment deleted"}


# ─── Submissions ─────────────────────────────────────────────────────────────

@app.post("/submissions/{assignment_id}")
async def submit_assignment(
    assignment_id: str,
    full_name: str = Form(...),
    matric_number: str = Form(...),
    department: str = Form(...),
    group_number: Optional[int] = Form(None),
    file: UploadFile = File(...)
):
    # 1. Load assignment
    assignment = supabase.table("assignments").select("*").eq("id", assignment_id).single().execute()
    if not assignment.data:
        raise HTTPException(status_code=404, detail="Assignment not found")
    a = assignment.data

    # 2. Check if manually closed
    if a.get("is_closed"):
        raise HTTPException(status_code=400, detail="This assignment has been closed by the lecturer")

    # 3. Check deadline
    deadline = datetime.fromisoformat(a["deadline"].replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    is_late = now > deadline
    if is_late:
        raise HTTPException(status_code=400, detail="Submission deadline has passed")

    # 4. Check duplicate matric
    existing = supabase.table("submissions")\
        .select("id")\
        .eq("assignment_id", assignment_id)\
        .eq("matric_number", matric_number.upper())\
        .execute()
    if existing.data:
        raise HTTPException(
            status_code=400,
            detail="This matric number has already submitted for this assignment"
        )

    # 5. Validate file type
    allowed_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF, DOC, and DOCX files are allowed")

    # 6. Rename file
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "pdf"
    safe = lambda s: re.sub(r'[^a-zA-Z0-9]', '_', s)
    new_filename = f"{safe(a['course_name'])}_{safe(a['title'])}_{safe(matric_number.upper())}_{safe(full_name)}.{ext}"

    # 7. Build storage path
    if a["submission_type"] == "group" and group_number:
        folder = f"{assignment_id}/Group_{group_number}"
    else:
        folder = f"{assignment_id}/Individual"
    storage_path = f"{folder}/{new_filename}"

    # 8. Upload to Supabase Storage
    file_bytes = await file.read()
    try:
        supabase.storage.from_("submissions").upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": file.content_type, "upsert": "false"}
        )
    except Exception:
        raise HTTPException(status_code=500, detail="File upload failed. Please try again.")

    file_url = supabase.storage.from_("submissions").get_public_url(storage_path)

    # 9. Save to database
    submission_data = {
        "assignment_id": assignment_id,
        "full_name": full_name,
        "matric_number": matric_number.upper(),
        "department": department,
        "group_number": group_number,
        "file_url": file_url,
        "storage_path": storage_path,
        "original_filename": file.filename,
        "renamed_filename": new_filename,
        "is_late": False,
        "submitted_at": now.isoformat(),
    }
    result = supabase.table("submissions").insert(submission_data).execute()
    return {"message": "Submission successful", "submission": result.data[0]}


@app.get("/submissions/{assignment_id}")
async def get_submissions(
    assignment_id: str,
    department: Optional[str] = None,
    group_number: Optional[int] = None,
    user=Depends(get_current_user)
):
    query = supabase.table("submissions").select("*").eq("assignment_id", assignment_id)
    if department:
        query = query.eq("department", department)
    if group_number:
        query = query.eq("group_number", group_number)
    result = query.order("submitted_at", desc=False).execute()
    subs = result.data

    for s in subs:
        s["file_url"] = f"/files/{s['id']}"

    return subs


@app.get("/files/{submission_id}")
async def proxy_file(
    submission_id: str,
    token: Optional[str] = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
):
    """Streams file from Supabase through backend. Supabase URLs never appear in browser."""
    auth_token = token
    if not auth_token and credentials:
        auth_token = credentials.credentials
    if not auth_token:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        user = supabase.auth.get_user(auth_token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = supabase.table("submissions")\
        .select("storage_path, renamed_filename, original_filename")\
        .eq("id", submission_id)\
        .single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="File not found")

    storage_path = result.data["storage_path"]
    filename = result.data.get("renamed_filename") or result.data.get("original_filename") or "file"
    real_url = supabase.storage.from_("submissions").get_public_url(storage_path)

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.get(real_url)
        if resp.status_code != 200:
            raise HTTPException(status_code=404, detail="File not found in storage")

    ext = filename.split(".")[-1].lower() if "." in filename else "pdf"
    content_types = {
        "pdf": "application/pdf",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    content_type = content_types.get(ext, "application/octet-stream")

    return StreamingResponse(
        io.BytesIO(resp.content),
        media_type=content_type,
        headers={"Content-Disposition": f'inline; filename="{filename}"'}
    )


@app.patch("/submissions/{submission_id}/score")
async def update_score(
    submission_id: str,
    score: float = Form(...),
    user=Depends(get_current_user)
):
    result = supabase.table("submissions")\
        .update({"score": score})\
        .eq("id", submission_id)\
        .execute()
    return result.data[0]


# ─── Class List ───────────────────────────────────────────────────────────────

@app.post("/assignments/{assignment_id}/classlist")
async def upload_class_list(
    assignment_id: str,
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    """
    Upload CSV with columns: full_name, matric_number, department
    Returns: { total, submitted, missing: [{full_name, matric_number, department}] }
    """
    import csv
    content = await file.read()
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    class_list = []
    for row in reader:
        matric = (row.get("matric_number") or row.get("Matric Number") or "").strip().upper()
        name = (row.get("full_name") or row.get("Full Name") or "").strip()
        dept = (row.get("department") or row.get("Department") or "").strip()
        if matric:
            class_list.append({"matric_number": matric, "full_name": name, "department": dept})

    subs = supabase.table("submissions")\
        .select("matric_number")\
        .eq("assignment_id", assignment_id)\
        .execute().data
    submitted_matrics = {s["matric_number"] for s in subs}

    missing = [s for s in class_list if s["matric_number"] not in submitted_matrics]
    submitted_count = sum(1 for s in class_list if s["matric_number"] in submitted_matrics)

    return {
        "total": len(class_list),
        "submitted": submitted_count,
        "missing_count": len(missing),
        "missing": missing,
    }


# ─── ZIP Download ─────────────────────────────────────────────────────────────

@app.get("/download/{assignment_id}/zip")
async def download_zip(
    assignment_id: str,
    mode: str = "all",
    filter_value: Optional[str] = None,
    user=Depends(get_current_user)
):
    query = supabase.table("submissions").select("*").eq("assignment_id", assignment_id)
    if mode == "group" and filter_value:
        query = query.eq("group_number", int(filter_value))
    elif mode == "department" and filter_value:
        query = query.eq("department", filter_value)
    subs = query.execute().data

    if not subs:
        raise HTTPException(status_code=404, detail="No submissions found")

    zip_buf = io.BytesIO()
    async with httpx.AsyncClient(timeout=30) as client:
        with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for sub in subs:
                try:
                    resp = await client.get(sub["file_url"])
                    if resp.status_code != 200:
                        continue
                    file_bytes = resp.content
                    filename = sub.get("renamed_filename") or sub.get("original_filename") or "file"

                    if sub.get("group_number"):
                        group_path = f"By_Group/Group_{sub['group_number']}/{filename}"
                    else:
                        group_path = f"By_Group/Individual/{filename}"
                    zf.writestr(group_path, file_bytes)

                    safe_dept = re.sub(r'[^a-zA-Z0-9]', '_', sub.get("department", "Unknown"))
                    dept_path = f"By_Department/{safe_dept}/{filename}"
                    zf.writestr(dept_path, file_bytes)
                except Exception:
                    continue

    zip_buf.seek(0)
    assignment = supabase.table("assignments")\
        .select("title, course_name")\
        .eq("id", assignment_id)\
        .single().execute()
    safe_title = re.sub(r'[^a-zA-Z0-9]', '_', assignment.data.get("title", "Assignment"))
    return StreamingResponse(
        zip_buf,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={safe_title}_Submissions.zip"}
    )


# ─── Excel Export ─────────────────────────────────────────────────────────────

@app.get("/export/{assignment_id}/excel")
async def export_excel(
    assignment_id: str,
    department: Optional[str] = None,
    user=Depends(get_current_user)
):
    assignment = supabase.table("assignments").select("*").eq("id", assignment_id).single().execute()
    if not assignment.data:
        raise HTTPException(status_code=404, detail="Assignment not found")
    a = assignment.data

    query = supabase.table("submissions").select("*").eq("assignment_id", assignment_id)
    if department:
        query = query.eq("department", department)
    subs = query.order("department").order("group_number").order("full_name").execute().data

    if not subs:
        raise HTTPException(status_code=404, detail="No submissions found")

    def make_excel_sheet(rows, dept_name):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = dept_name[:31]

        ws.merge_cells("A1:I1")
        ws["A1"] = f"{a['course_name']} — {a['title']}"
        ws["A1"].font = Font(bold=True, size=13)
        ws.merge_cells("A2:I2")
        ws["A2"] = f"Department: {dept_name}  |  Deadline: {a['deadline'][:16].replace('T', ' ')}"
        ws["A2"].font = Font(size=9, italic=True)

        headers = ["S/N", "Full Name", "Matric Number", "Department", "Group", "Submitted At", "Late?", "Score", "File Link"]
        hrow = 4
        hfill = PatternFill("solid", fgColor="1A3A5C")
        hfont = Font(bold=True, color="FFFFFF")
        thin = Side(style="thin", color="DDDDDD")
        bdr = Border(left=thin, right=thin, top=thin, bottom=thin)

        for col, h in enumerate(headers, 1):
            cell = ws.cell(row=hrow, column=col, value=h)
            cell.fill = hfill
            cell.font = hfont
            cell.alignment = Alignment(horizontal="center")
            cell.border = bdr

        alt = PatternFill("solid", fgColor="EBF2FA")
        for i, row in enumerate(rows, 1):
            r = hrow + i
            fill = alt if i % 2 == 0 else PatternFill()
            vals = [
                i,
                row.get("full_name", ""),
                row.get("matric_number", ""),
                row.get("department", ""),
                f"Group {row['group_number']}" if row.get("group_number") else "Individual",
                str(row.get("submitted_at", ""))[:16].replace("T", " "),
                "YES" if row.get("is_late") else "No",
                row.get("score", ""),
                row.get("file_url", ""),
            ]
            for col, val in enumerate(vals, 1):
                cell = ws.cell(row=r, column=col, value=val)
                cell.fill = fill
                cell.border = bdr
                if col == 9:
                    cell.font = Font(color="0563C1", underline="single")

        widths = [5, 26, 18, 30, 12, 20, 7, 8, 55]
        for i, w in enumerate(widths, 1):
            ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width = w

        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        return buf

    if department:
        buf = make_excel_sheet(subs, department)
        safe_dept = re.sub(r'[^a-zA-Z0-9]', '_', department)
        filename = f"{safe_dept}_{a['course_name']}.xlsx"
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    else:
        by_dept = defaultdict(list)
        for s in subs:
            by_dept[s["department"]].append(s)

        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for dept, rows in by_dept.items():
                excel_buf = make_excel_sheet(rows, dept)
                safe_dept = re.sub(r'[^a-zA-Z0-9]', '_', dept)
                zf.writestr(f"{safe_dept}.xlsx", excel_buf.read())

        zip_buf.seek(0)
        safe_title = re.sub(r'[^a-zA-Z0-9]', '_', a["title"])
        return StreamingResponse(
            zip_buf,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={safe_title}_Excel_Export.zip"}
        )


# ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

@app.post("/admin/login")
async def admin_login(
    email: str = Form(...),
    password: str = Form(...),
):
    """
    Super admin login. Credentials set in Render environment variables:
    ADMIN_EMAIL and ADMIN_PASSWORD.
    Returns a custom signed token (not a Supabase token).
    """
    if email != ADMIN_EMAIL or password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    # Create a simple signed token: "admin:<timestamp>:<signature>"
    timestamp = int(datetime.now(timezone.utc).timestamp())
    signature = hashlib.sha256(f"admin:{timestamp}:{ADMIN_SECRET}".encode()).hexdigest()[:32]
    token = f"admin:{timestamp}:{signature}"

    return {"token": token, "message": "Admin login successful"}


@app.get("/admin/lecturers")
async def admin_get_lecturers(is_admin=Depends(verify_admin_token)):
    """
    Returns all registered lecturers with their assignment and submission counts.
    Only accessible with a valid admin token.
    """
    try:
        # Get all users from Supabase Auth (service key has access)
        users_response = supabase.auth.admin.list_users()
        lecturers = []

        for u in users_response:
            if not u.email:
                continue

            # Get assignment count for this lecturer
            assignment_result = supabase.table("assignments")\
                .select("id", count="exact")\
                .eq("lecturer_id", str(u.id))\
                .execute()
            assignment_count = assignment_result.count or 0

            # Get submission count across all their assignments
            submission_count = 0
            if assignment_count > 0:
                assignments = supabase.table("assignments")\
                    .select("id")\
                    .eq("lecturer_id", str(u.id))\
                    .execute().data
                assignment_ids = [a["id"] for a in assignments]
                for aid in assignment_ids:
                    sub_result = supabase.table("submissions")\
                        .select("id", count="exact")\
                        .eq("assignment_id", aid)\
                        .execute()
                    submission_count += sub_result.count or 0

            full_name = u.user_metadata.get("full_name", "Unknown") if u.user_metadata else "Unknown"
            lecturers.append({
                "id": str(u.id),
                "email": u.email,
                "full_name": full_name,
                "display_name": full_name,
                "is_verified": u.email_confirmed_at is not None,
                "created_at": u.created_at.isoformat() if u.created_at else "",
                "assignment_count": assignment_count,
                "submission_count": submission_count,
            })

        # Sort by newest first
        lecturers.sort(key=lambda x: x["created_at"], reverse=True)
        return lecturers

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lecturers: {str(e)}")


@app.post("/admin/impersonate/{lecturer_id}")
async def admin_impersonate(
    lecturer_id: str,
    is_admin=Depends(verify_admin_token)
):
    try:
        # 🔍 get user from Supabase (DB only)
        user_response = supabase.auth.admin.get_user_by_id(lecturer_id)

        if not user_response or not user_response.user:
            raise HTTPException(status_code=404, detail="Lecturer not found")

        user = user_response.user

        # 🔥 create YOUR OWN token (NOT supabase)
        token = create_access_token({
            "sub": user.id,
            "email": user.email,
            "role": "lecturer",
            "impersonated": True
        })

        return {"token": token}

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=500, detail="Impersonation failed")


# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "app": "Assignify API"}