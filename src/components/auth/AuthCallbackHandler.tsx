import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallbackHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!location.hash) return;

    const params = new URLSearchParams(location.hash.slice(1));
    const error = params.get("error");

    if (error) {
      const errorCode = params.get("error_code") || "";
      const errorDesc = params.get("error_description") || "";

      let description = decodeURIComponent(errorDesc || error);
      if (errorCode === "otp_expired") {
        description = "Email link is invalid or has expired. Please request a new confirmation email.";
      }

      toast({
        title: "Authentication error",
        description,
        variant: "destructive",
      });

      // Clear the hash to avoid re-triggering on navigation
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );

      // Send users to the login page after showing the error
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    }
  }, [location.hash, location.pathname, navigate, toast]);

  return null;
}
