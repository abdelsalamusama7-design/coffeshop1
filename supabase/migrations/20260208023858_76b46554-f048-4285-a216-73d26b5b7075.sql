-- جدول العمال
CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{"can_sell": true, "can_view_reports": false, "can_view_cost": false, "can_edit_products": false, "can_edit_inventory": false, "can_manage_workers": false}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول الحضور والانصراف
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIME WITHOUT TIME ZONE,
  check_out_time TIME WITHOUT TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(worker_id, date)
);

-- جدول المبيعات السريعة
CREATE TABLE public.quick_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id),
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  profit NUMERIC GENERATED ALWAYS AS (total - (cost_price * quantity)) STORED,
  sale_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول إعدادات تكلفة المشروبات الساخنة
CREATE TABLE public.drink_cost_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  coffee_cost NUMERIC DEFAULT 0,
  tea_cost NUMERIC DEFAULT 0,
  sugar_cost NUMERIC DEFAULT 0,
  cup_cost NUMERIC DEFAULT 0,
  milk_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (coffee_cost + tea_cost + sugar_cost + cup_cost + milk_cost) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drink_cost_settings ENABLE ROW LEVEL SECURITY;

-- سياسات العمال
CREATE POLICY "Workers are viewable by authenticated users"
ON public.workers FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage workers"
ON public.workers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- سياسات الحضور
CREATE POLICY "Attendance is viewable by authenticated users"
ON public.attendance FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert attendance"
ON public.attendance FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update attendance"
ON public.attendance FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- سياسات المبيعات السريعة
CREATE POLICY "Quick sales are viewable by authenticated users"
ON public.quick_sales FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert quick sales"
ON public.quick_sales FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete quick sales"
ON public.quick_sales FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- سياسات إعدادات المشروبات
CREATE POLICY "Drink settings are viewable by authenticated users"
ON public.drink_cost_settings FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage drink settings"
ON public.drink_cost_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- تحديث منتجات الأقسام الجديدة
UPDATE public.products SET category = 'قهوة' WHERE category = 'عام';

-- إدراج إعدادات المشروبات الافتراضية
INSERT INTO public.drink_cost_settings (name, coffee_cost, tea_cost, sugar_cost, cup_cost, milk_cost)
VALUES 
  ('قهوة عربي', 0.5, 0, 0.1, 0.2, 0),
  ('قهوة تركي', 0.8, 0, 0.1, 0.2, 0),
  ('شاي', 0, 0.3, 0.1, 0.2, 0),
  ('نسكافيه', 1.0, 0, 0.1, 0.2, 0.3),
  ('كابتشينو', 1.2, 0, 0.1, 0.3, 0.5);

-- إدراج عامل أدمن افتراضي
INSERT INTO public.workers (name, pin, is_admin, permissions)
VALUES ('الأدمن', '1234', true, '{"can_sell": true, "can_view_reports": true, "can_view_cost": true, "can_edit_products": true, "can_edit_inventory": true, "can_manage_workers": true}'::jsonb);