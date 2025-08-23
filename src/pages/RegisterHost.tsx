import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { validatePassword } from '@/lib/passwordValidation';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';

const RegisterHost = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    adminName: '',
    email: '',
    phone: '',
    services: '',
    coverageArea: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (!formData.adminName.trim()) errors.adminName = 'Admin name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.services.trim()) errors.services = 'Services description is required';
    if (!formData.coverageArea.trim()) errors.coverageArea = 'Coverage area is required';
    
    if (!passwordValidation.isValid) {
      errors.password = 'Password does not meet requirements';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Please fix the errors below",
        description: "All fields must be completed correctly.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        'host',
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
          description: "Please check your email to verify your account.",
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Real-time password validation
    if (name === 'password') {
      setPasswordValidation(validatePassword(value));
    }
  };
  
  useEffect(() => {
    // Auto-validate confirm password
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }));
    } else {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  }, [formData.password, formData.confirmPassword]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Join TESLYS</CardTitle>
          <CardDescription>Create your host account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name</Label>
                <Input
                  id="adminName"
                  name="adminName"
                  type="text"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
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
                  placeholder="company@example.com"
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
                  placeholder="Business phone"
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
                placeholder="Describe the services you offer (e.g., maintenance, repairs, detailing)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageArea">Coverage Area</Label>
              <Input
                id="coverageArea"
                name="coverageArea"
                type="text"
                value={formData.coverageArea}
                onChange={handleChange}
                required
                placeholder="Cities/regions you serve"
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
                  placeholder="Create a password"
                  className={fieldErrors.password ? 'border-red-500' : ''}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-red-600">{fieldErrors.password}</p>
                )}
                <PasswordStrengthIndicator 
                  validation={passwordValidation} 
                  show={showPasswordHint || formData.password.length > 0} 
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
                  placeholder="Confirm password"
                  className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Host Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterHost;