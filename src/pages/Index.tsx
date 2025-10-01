import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "@/lib/api";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (getAuthToken()) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
