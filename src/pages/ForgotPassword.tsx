import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { t, dir } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: dir === 'rtl' ? 'تم الإرسال' : 'Email Sent',
        description: dir === 'rtl' 
          ? 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني'
          : 'Password reset link has been sent to your email',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo.png" 
            alt="NASAYIM CLEAN" 
            className="w-24 h-24 object-contain mb-4"
          />
          <h1 className="text-2xl font-bold text-primary">{t('appName')}</h1>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {isSuccess ? (
                <CheckCircle className="w-6 h-6 text-primary" />
              ) : (
                <Mail className="w-6 h-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {dir === 'rtl' ? 'نسيت كلمة المرور' : 'Forgot Password'}
            </CardTitle>
            <CardDescription className="text-base">
              {isSuccess 
                ? (dir === 'rtl' 
                    ? 'تحقق من بريدك الإلكتروني للحصول على رابط الاستعادة' 
                    : 'Check your email for the reset link')
                : (dir === 'rtl' 
                    ? 'أدخل بريدك الإلكتروني لاستعادة كلمة المرور' 
                    : 'Enter your email to reset your password')}
            </CardDescription>
          </CardHeader>

          {!isSuccess ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    {dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all"
                    dir="ltr"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-2 pb-8">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="me-2 h-5 w-5 animate-spin" />
                      {dir === 'rtl' ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : (
                    dir === 'rtl' ? 'إرسال رابط الاستعادة' : 'Send Reset Link'
                  )}
                </Button>

                <Link 
                  to="/login" 
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                  {dir === 'rtl' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardFooter className="flex flex-col gap-4 pt-6 pb-8">
              <div className="text-center text-muted-foreground text-sm">
                <p>{dir === 'rtl' ? 'لم تستلم البريد؟' : "Didn't receive the email?"}</p>
                <Button 
                  variant="link" 
                  onClick={() => setIsSuccess(false)}
                  className="text-primary"
                >
                  {dir === 'rtl' ? 'إعادة المحاولة' : 'Try again'}
                </Button>
              </div>
              
              <Link 
                to="/login" 
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                {dir === 'rtl' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
