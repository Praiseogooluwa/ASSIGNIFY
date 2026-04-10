import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center p-8 ${className}`}>
    <Loader2 className="h-8 w-8 animate-spin text-accent" />
  </div>
);

export default LoadingSpinner;
