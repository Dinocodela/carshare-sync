import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";
import { validatePassword } from "@/lib/passwordValidation";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { ArrowRight, ChevronLeft, User, Mail, Phone, Lock } from "lucide-react";
import { RentATeslaLink } from "@/components/RentATeslaLink";

const RegisterClient = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(""));
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!passwordValidation.isValid) errors.password = "Password does not meet requirements";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords don't match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ variant: "destructive", title: "Please fix the errors below" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, "client", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });
      if (error) {
        toast({ variant: "destructive", title: "Registration failed", description: error.message });
      } else {
        toast({ title: "Registration successful!", description: "Please check your email to verify your account." });
        navigate("/");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Registration failed", description: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "password") setPasswordValidation(validatePassword(value));
  };

  useEffect(() => {
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "Passwords don't match" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  }, [formData.password, formData.confirmPassword]);

  const inputClass = "h-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-lg pl-9 transition-colors";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-hero p-4 relative">
      <RentATeslaLink />
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-5">
          <Logo size="lg" linked />
        </div>

        <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <button
              onClick={() => history.back()}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition mb-3"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <h2 className="text-lg font-bold text-foreground">
              Create your{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Client</span>{" "}
              account
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Join thousands of Tesla owners earning passive income</p>
          </div>

          <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" className={inputClass} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-medium">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" className={inputClass} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className={inputClass} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+1 (555) 000-0000" className={inputClass} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} onFocus={() => setShowPasswordHint(true)} onBlur={() => setShowPasswordHint(false)} required placeholder="Create a strong password" className={`${inputClass} ${fieldErrors.password ? "border-destructive" : ""}`} />
              </div>
              {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
              <PasswordStrengthIndicator validation={passwordValidation} show={showPasswordHint || formData.password.length > 0} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm your password" className={`${inputClass} ${fieldErrors.confirmPassword ? "border-destructive" : ""}`} />
              </div>
              {fieldErrors.confirmPassword && <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? "Creating account..." : (
                <span className="inline-flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterClient;
