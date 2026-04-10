from supabase import create_client
import os
from dotenv import load_dotenv
load_dotenv()
c = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))
try:
    r = c.auth.sign_up({'email': 'test123@gmail.com', 'password': 'test123456'})
    print('success:', r)
except Exception as e:
    print('error:', e)