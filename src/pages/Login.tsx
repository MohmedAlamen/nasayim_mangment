import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    setIsLoading(false);

    if (!error) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="absolute -inset-1"></div>
            <img 
              src="/logo.png" 
              alt="NASAYIM CLEAN" 
              className="
                relative
                w-40 
                h-40
                sm:w-52 
                sm:h-52 
                md:w-64
                md:h-64
                object-contain
                transition-all
                duration-500
                hover:scale-105
              "
            />
          </div>
          
          <h1 className="
            text-4xl 
            sm:text-5xl 
            font-black 
            text-center
            tracking-tight
            mb-3
          "
          style={{ color: '#2d8a5f' }}
          >
            {t('appName')}
          </h1>
          
          <div className="h-1 w-20 bg-primary rounded-full mb-4"></div>

          <p className="text-lg sm:text-xl text-muted-foreground font-medium text-center max-w-[300px]">
            {t('companyDescription')}
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">
              {dir === 'rtl' ? 'تسجيل الدخول' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-base">
              {dir === 'rtl' 
                ? 'مرحباً بك مجدداً في نظام الإدارة' 
                : 'Welcome back to the management system'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  {dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={dir === 'rtl' ? 'example@company.com' : 'example@company.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">{dir === 'rtl' ? 'كلمة المرور' : 'Password'}</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 pe-12 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2 pb-8">
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                disabled={isLoading}
                style={{ backgroundColor: '#2d8a5f' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="me-2 h-5 w-5 animate-spin" />
                    {dir === 'rtl' ? 'جاري التحقق...' : 'Verifying...'}
                  </>
                ) : (
                  dir === 'rtl' ? 'دخول للنظام' : 'Access System'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center mt-8 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {t('appName')}. {dir === 'rtl' ? 'جميع الحقوق محفوظة' : 'All rights reserved.'}
        </p>
      </div>
    </div>
  );
};

export default Login;
