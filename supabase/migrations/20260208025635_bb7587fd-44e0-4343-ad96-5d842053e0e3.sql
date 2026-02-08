
-- إضافة عمود البريد الإلكتروني لجدول العمال
ALTER TABLE public.workers 
ADD COLUMN IF NOT EXISTS email text;

-- إضافة فهرس فريد للبريد الإلكتروني
CREATE UNIQUE INDEX IF NOT EXISTS workers_email_unique ON public.workers(email) WHERE email IS NOT NULL;
