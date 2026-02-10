import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  customerEmail: string;
  customerName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  type: 'created' | 'updated' | 'cancelled';
  language: 'ar' | 'en';
}

const getEmailContent = (data: NotificationRequest) => {
  const { customerName, serviceName, appointmentDate, appointmentTime, type, language } = data;
  
  const isArabic = language === 'ar';
  
  const subjects = {
    created: isArabic ? 'تأكيد حجز موعد جديد' : 'New Appointment Confirmation',
    updated: isArabic ? 'تم تعديل موعدك' : 'Your Appointment Has Been Updated',
    cancelled: isArabic ? 'تم إلغاء موعدك' : 'Your Appointment Has Been Cancelled',
  };

  const headers = {
    created: isArabic ? 'تم حجز موعدك بنجاح!' : 'Your Appointment is Confirmed!',
    updated: isArabic ? 'تم تعديل تفاصيل موعدك' : 'Your Appointment Details Have Changed',
    cancelled: isArabic ? 'تم إلغاء موعدك' : 'Your Appointment Has Been Cancelled',
  };

  const messages = {
    created: isArabic 
      ? 'شكراً لك على الحجز معنا. تفاصيل موعدك كالتالي:'
      : 'Thank you for booking with us. Here are your appointment details:',
    updated: isArabic
      ? 'تم تحديث تفاصيل موعدك. يرجى مراجعة المعلومات الجديدة:'
      : 'Your appointment has been updated. Please review the new details:',
    cancelled: isArabic
      ? 'نأسف لإبلاغك بأنه تم إلغاء موعدك. يمكنك حجز موعد جديد في أي وقت.'
      : 'We regret to inform you that your appointment has been cancelled. You can book a new appointment anytime.',
  };

  const labels = {
    service: isArabic ? 'الخدمة' : 'Service',
    date: isArabic ? 'التاريخ' : 'Date',
    time: isArabic ? 'الوقت' : 'Time',
  };

  const footer = isArabic
    ? 'إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.'
    : 'If you have any questions, please don\'t hesitate to contact us.';

  const direction = isArabic ? 'rtl' : 'ltr';

  const html = `
    <!DOCTYPE html>
    <html dir="${direction}" lang="${language}">
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #2d8a5f 0%, #1e6b4a 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 12px 12px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border-radius: 0 0 12px 12px;
        }
        .details {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #e5e7eb;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .label {
          color: #6b7280;
          font-weight: 500;
        }
        .value {
          color: #111827;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">${headers[type]}</h1>
      </div>
      <div class="content">
        <p style="margin-bottom: 20px;">${isArabic ? `مرحباً ${customerName}،` : `Hello ${customerName},`}</p>
        <p>${messages[type]}</p>
        
        ${type !== 'cancelled' ? `
        <div class="details">
          <div class="detail-row">
            <span class="label">${labels.service}</span>
            <span class="value">${serviceName}</span>
          </div>
          <div class="detail-row">
            <span class="label">${labels.date}</span>
            <span class="value">${appointmentDate}</span>
          </div>
          <div class="detail-row">
            <span class="label">${labels.time}</span>
            <span class="value">${appointmentTime}</span>
          </div>
        </div>
        ` : ''}
        
        <p class="footer">${footer}</p>
      </div>
    </body>
    </html>
  `;

  return { subject: subjects[type], html };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();

    // Validate required fields
    if (!data.customerEmail || !data.customerName || !data.serviceName) {
      throw new Error("Missing required fields");
    }

    // Skip if no email provided
    if (!data.customerEmail.includes('@')) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "Invalid email" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { subject, html } = getEmailContent(data);

    const emailResponse = await resend.emails.send({
      from: "Appointments <noreply@resend.dev>",
      to: [data.customerEmail],
      subject,
      html,
    });

    console.log("Appointment notification sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending appointment notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
