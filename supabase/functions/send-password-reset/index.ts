import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
  lang?: 'ar' | 'en';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);
    const { email, resetUrl, lang = 'ar' }: PasswordResetRequest = await req.json();

    if (!email || !resetUrl) {
      throw new Error("Missing required fields: email and resetUrl");
    }

    const isArabic = lang === 'ar';
    
    const subject = isArabic 
      ? 'إعادة تعيين كلمة المرور' 
      : 'Reset Your Password';
    
    const htmlContent = isArabic ? `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          h1 { color: #18181b; font-size: 24px; margin-bottom: 16px; }
          p { color: #52525b; line-height: 1.6; margin-bottom: 24px; }
          .button { display: inline-block; background: #2d8a5f; color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; }
          .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7; color: #a1a1aa; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>إعادة تعيين كلمة المرور</h1>
          <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بحسابك. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
          <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
          <div class="footer">
            <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد بأمان.</p>
            <p>ستنتهي صلاحية هذا الرابط خلال ساعة واحدة.</p>
          </div>
        </div>
      </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          h1 { color: #18181b; font-size: 24px; margin-bottom: 16px; }
          p { color: #52525b; line-height: 1.6; margin-bottom: 24px; }
          .button { display: inline-block; background: #2d8a5f; color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; }
          .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7; color: #a1a1aa; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reset Your Password</h1>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <div class="footer">
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "noreply@resend.dev",
      to: [email],
      subject,
      html: htmlContent,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
