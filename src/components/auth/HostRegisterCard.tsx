import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { validatePassword } from "@/lib/passwordValidation";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

type Props = { onDone?: () => void; onBackToLogin: () => void };

export default function HostRegisterCard({ onDone, onBackToLogin }: Props) {
  const [formData, setFormData] = useState({
    companyName: "",
    adminName: "",
    email: "",
    phone: "",
    services: "",
    coverageArea: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(
    validatePassword("")
  );
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { signUp } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.companyName.trim())
      e.companyName = "Company name is required";
    if (!formData.adminName.trim()) e.adminName = "Admin name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    if (!formData.phone.trim()) e.phone = "Phone number is required";
    if (!formData.services.trim())
      e.services = "Services description is required";
    if (!formData.coverageArea.trim())
      e.coverageArea = "Coverage area is required";
    if (!passwordValidation.isValid)
      e.password = "Password does not meet requirements";
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords don't match";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateForm()) {
      toast({ variant: "destructive", title: "Please fix the errors below" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        "host",
        {
          company_name: formData.companyName,
          admin_name: formData.adminName,
          phone: formData.phone,
          services: formData.services,
          coverage_area: formData.coverageArea,
        }
      );
      if (error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Registration successful!",
          description: "Please verify your email.",
        });
        onDone?.();
        onBackToLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: "" }));
    if (name === "password") setPasswordValidation(validatePassword(value));
  };

  useEffect(() => {
    if (
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setFieldErrors((p) => ({
        ...p,
        confirmPassword: "Passwords don't match",
      }));
    } else {
      setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
    }
  }, [formData.password, formData.confirmPassword]);

  return (
    <Card className="bg-white/80 border-primary/10 backdrop-blur p-4">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          Join TESLYS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name</Label>
              <Input
                id="adminName"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="services">Services Offered</Label>
            <Textarea
              id="services"
              name="services"
              value={formData.services}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverageArea">Coverage Area</Label>
            <Input
              id="coverageArea"
              name="coverageArea"
              value={formData.coverageArea}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setShowPasswordHint(true)}
                onBlur={() => setShowPasswordHint(false)}
                required
                className={fieldErrors.password ? "border-red-500" : ""}
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-600">{fieldErrors.password}</p>
              )}
              <PasswordStrengthIndicator
                validation={passwordValidation}
                show={showPasswordHint || !!formData.password}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={fieldErrors.confirmPassword ? "border-red-500" : ""}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Host Account"}
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-primary underline"
            >
              Sign in
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
