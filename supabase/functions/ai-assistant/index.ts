import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `أنت مساعد ذكي لنظام المراقب لإدارة المبيعات وكاميرات المراقبة. 
مهمتك مساعدة المسؤولين والمديرين والمشرفين في:

1. **إدارة المخزون**: شرح كيفية إضافة المنتجات، تتبع المخزون، وتنبيهات نقص المخزون
2. **الفواتير والمبيعات**: كيفية إنشاء فواتير جديدة، متابعة حالة الفواتير، وإدارة المدفوعات
3. **عروض الأسعار**: إنشاء عروض أسعار للعملاء وتحويلها إلى فواتير
4. **إدارة العملاء**: إضافة عملاء جدد، متابعة أرصدتهم، وتحديث بياناتهم
5. **الأجهزة والضمانات**: تسجيل الأجهزة المباعة، متابعة فترات الضمان، وجدولة الصيانة
6. **التقارير**: شرح كيفية الوصول للتقارير وفهم الإحصائيات
7. **إدارة المستخدمين**: شرح صلاحيات الأدوار المختلفة (مسؤول، مشرف، مبيعات، تقني، صيانة)
8. **إعدادات النظام**: مساعدة في ضبط إعدادات الشركة والنسخ الاحتياطي

قواعد مهمة:
- أجب باللغة العربية دائماً
- كن مختصراً ومفيداً
- قدم خطوات واضحة ومرقمة عند الحاجة
- إذا كان السؤال خارج نطاق النظام، اعتذر بلطف ووجه المستخدم للمساعدة المناسبة`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Sending request to AI gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقاً" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد لحساب Lovable AI" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI gateway response received, streaming...");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "حدث خطأ غير متوقع" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
