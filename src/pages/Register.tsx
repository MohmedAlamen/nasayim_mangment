import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(dir === 'rtl' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(dir === 'rtl' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName);

    setIsLoading(false);

    if (!signUpError) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo.png" 
            alt="NASAYIM CLEAN" 
            className="w-24 h-24 object-contain mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">{t('appName')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('companyDescription')}</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {dir === 'rtl' ? 'إنشاء حساب جديد' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {dir === 'rtl' 
                ? 'أدخل بياناتك لإنشاء حساب جديد' 
                : 'Enter your details to create a new account'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  {dir === 'rtl' ? 'الاسم الكامل' : 'Full Name'}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={dir === 'rtl' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={dir === 'rtl' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {dir === 'rtl' ? 'كلمة المرور' : 'Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={dir === 'rtl' ? 'أدخل كلمة المرور' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 pe-10"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {dir === 'rtl' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={dir === 'rtl' ? 'أعد إدخال كلمة المرور' : 'Confirm your password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                  dir="ltr"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full h-11 gradient-primary text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {dir === 'rtl' ? 'جاري الإنشاء...' : 'Creating account...'}
                  </>
                ) : (
                  dir === 'rtl' ? 'إنشاء حساب' : 'Create Account'
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                {dir === 'rtl' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {dir === 'rtl' ? 'تسجيل الدخول' : 'Sign in'}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;