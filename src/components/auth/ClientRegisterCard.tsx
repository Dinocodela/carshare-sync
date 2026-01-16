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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { validatePassword } from "@/lib/passwordValidation";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { Link } from "react-router-dom";

type Props = { onDone?: () => void; onBackToLogin: () => void };

export default function ClientRegisterCard({ onDone, onBackToLogin }: Props) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [smsConsent, setSmsConsent] = useState(false);
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
    if (!formData.firstName.trim()) e.firstName = "First name is required";
    if (!formData.lastName.trim()) e.lastName = "Last name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    if (!formData.phone.trim()) e.phone = "Phone number is required";
    if (!smsConsent) e.smsConsent = "SMS consent is required";
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
        "client",
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
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
        onDone?.(); // optional: e.g. switch to login automatically
        onBackToLogin(); // go back to login panel
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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

          {/* SMS Consent Checkbox */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="smsConsent"
              checked={smsConsent}
              onCheckedChange={(checked) => {
                setSmsConsent(checked === true);
                if (fieldErrors.smsConsent) setFieldErrors((p) => ({ ...p, smsConsent: "" }));
              }}
              className={fieldErrors.smsConsent ? "border-red-500" : ""}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="smsConsent"
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                I agree to receive SMS messages from Teslys for booking confirmations, reminders, and support.
                Message frequency varies. Message and data rates may apply. Reply STOP to cancel.{" "}
                <Link to="/sms-consent" className="text-primary underline underline-offset-2" target="_blank">
                  View SMS Terms
                </Link>
              </label>
              {fieldErrors.smsConsent && (
                <p className="text-sm text-red-600">{fieldErrors.smsConsent}</p>
              )}
            </div>
          </div>

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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Client Account"}
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
