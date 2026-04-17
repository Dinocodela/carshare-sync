import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { validatePassword } from "@/lib/passwordValidation";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, Building2, Mail, Phone, Lock, MapPin, Wrench, User } from "lucide-react";

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
    if (!formData.companyName.trim()) e.companyName = "Company name is required";
    if (!formData.adminName.trim()) e.adminName = "Admin name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    if (!formData.phone.trim()) e.phone = "Phone number is required";
    if (!formData.services.trim()) e.services = "Services description is required";
    if (!formData.coverageArea.trim()) e.coverageArea = "Coverage area is required";
    if (!smsConsent) e.smsConsent = "SMS consent is required";
    if (!passwordValidation.isValid) e.password = "Password does not meet requirements";
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords don't match";
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
      setFieldErrors((p) => ({ ...p, confirmPassword: "Passwords don't match" }));
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
            Host
          </span>{" "}
          account
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Start managing vehicles and earning with Teslys
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="companyName" className="text-xs font-medium text-foreground">Company Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Your company"
                className={`${inputClass} pl-9 ${fieldErrors.companyName ? "border-destructive" : ""}`}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adminName" className="text-xs font-medium text-foreground">Admin Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                id="adminName"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                required
                placeholder="Your name"
                className={`${inputClass} pl-9 ${fieldErrors.adminName ? "border-destructive" : ""}`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
                placeholder="you@company.com"
                className={`${inputClass} pl-9 ${fieldErrors.email ? "border-destructive" : ""}`}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-medium text-foreground">Phone</Label>
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
          <Label htmlFor="services" className="text-xs font-medium text-foreground">Services Offered</Label>
          <div className="relative">
            <Wrench className="absolute left-3 top-3 w-3.5 h-3.5 text-muted-foreground" />
            <Textarea
              id="services"
              name="services"
              value={formData.services}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Maintenance, detailing, fleet management..."
              className="bg-background/50 border-border/60 focus:border-primary/50 rounded-lg pl-9 transition-colors text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="coverageArea" className="text-xs font-medium text-foreground">Coverage Area</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              id="coverageArea"
              name="coverageArea"
              value={formData.coverageArea}
              onChange={handleChange}
              required
              placeholder="Cities or regions you serve"
              className={`${inputClass} pl-9 ${fieldErrors.coverageArea ? "border-destructive" : ""}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
                placeholder="Password"
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
            <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">Confirm</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm"
                className={`${inputClass} pl-9 ${fieldErrors.confirmPassword ? "border-destructive" : ""}`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
            )}
          </div>
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
              Create Host Account <ArrowRight className="w-4 h-4" />
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
