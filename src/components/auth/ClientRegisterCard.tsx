import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { validatePassword } from "@/lib/passwordValidation";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, User, Mail, Phone, Lock } from "lucide-react";

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

        try {
          await supabase.functions.invoke('notify-admin-new-client', {
            body: {
              clientName: `${formData.firstName} ${formData.lastName}`,
              clientEmail: formData.email,
              clientPhone: formData.phone,
            },
          });
        } catch (e) {
          console.warn("Admin notification failed:", e);
        }

        onDone?.();
        onBackToLogin();
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

  const inputClass = "h-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-lg transition-colors";

  return (
    <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition mb-3"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to sign in
        </button>
        <h2 className="text-lg font-bold text-foreground">
          Create your{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Client
          </span>{" "}
          account
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Join thousands of Tesla owners earning passive income
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-xs font-medium text-foreground">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
                className={`${inputClass} pl-9 ${fieldErrors.firstName ? "border-destructive" : ""}`}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-xs font-medium text-foreground">Last Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Doe"
                className={`${inputClass} pl-9 ${fieldErrors.lastName ? "border-destructive" : ""}`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className={`${inputClass} pl-9 ${fieldErrors.email ? "border-destructive" : ""}`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-medium text-foreground">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 000-0000"
              className={`${inputClass} pl-9 ${fieldErrors.phone ? "border-destructive" : ""}`}
            />
          </div>
        </div>

        {/* SMS Consent */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
          <Checkbox
            id="smsConsent"
            checked={smsConsent}
            onCheckedChange={(checked) => {
              setSmsConsent(checked === true);
              if (fieldErrors.smsConsent) setFieldErrors((p) => ({ ...p, smsConsent: "" }));
            }}
            className={`mt-0.5 ${fieldErrors.smsConsent ? "border-destructive" : ""}`}
          />
          <div className="grid gap-1 leading-none">
            <label
              htmlFor="smsConsent"
              className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer"
            >
              I agree to receive SMS messages from Teslys for booking confirmations, reminders, and support.
              Message frequency varies. Message and data rates may apply. Reply STOP to cancel.{" "}
              <Link to="/sms-consent" className="text-primary underline underline-offset-2" target="_blank">
                View SMS Terms
              </Link>
            </label>
            {fieldErrors.smsConsent && (
              <p className="text-xs text-destructive">{fieldErrors.smsConsent}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-medium text-foreground">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setShowPasswordHint(true)}
              onBlur={() => setShowPasswordHint(false)}
              required
              placeholder="Create a strong password"
              className={`${inputClass} pl-9 ${fieldErrors.password ? "border-destructive" : ""}`}
            />
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-destructive">{fieldErrors.password}</p>
          )}
          <PasswordStrengthIndicator
            validation={passwordValidation}
            show={showPasswordHint || !!formData.password}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              className={`${inputClass} pl-9 ${fieldErrors.confirmPassword ? "border-destructive" : ""}`}
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          disabled={loading}
        >
          {loading ? (
            "Creating account..."
          ) : (
            <span className="inline-flex items-center gap-2">
              Create Account <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-1">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}
