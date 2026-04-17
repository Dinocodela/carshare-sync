// src/components/push/PushNavHandler.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { attachNotificationNavigation } from "@/lib/push";

export default function PushNavHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    attachNotificationNavigation((url) => navigate(url));
  }, [navigate]);
  return <></>;
}
