import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowRight, CheckCircle } from "lucide-react";
import logo from "@/assets/logo.png";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "البريد الإلكتروني غير صالح" }),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = emailSchema.safeParse({ email });
      if (!result.success) {
        setError(result.error.errors[0].message);
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: "خطأ",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "تم إرسال البريد",
          description: "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور",
        });
      }
    } catch (err) {
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء إرسال البريد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
        <Card className="w-full max-w-md shadow-card border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">تحقق من بريدك</CardTitle>
              <CardDescription className="mt-2">
                تم إرسال رابط استعادة كلمة المرور إلى {email}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              إذا لم تجد البريد، تحقق من مجلد الرسائل غير المرغوب فيها
            </p>
            <Link to="/auth">
              <Button variant="outline" className="w-full gap-2">
                <ArrowRight className="h-4 w-4" />
                العودة لتسجيل الدخول
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <Card className="w-full max-w-md shadow-card border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <img src={logo} alt="Logo" className="w-14 h-14 object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">استعادة كلمة المرور</CardTitle>
            <CardDescription className="mt-2">
              أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="pr-10"
                  dir="ltr"
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  إرسال رابط الاستعادة
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/auth"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <ArrowRight className="h-3 w-3" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
