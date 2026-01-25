-- Create company_settings table to store company information
CREATE TABLE public.company_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL DEFAULT 'شركة المراقب',
  phone text,
  email text,
  tax_number text,
  address text,
  auto_tax boolean DEFAULT true,
  tax_rate numeric DEFAULT 15,
  auto_print boolean DEFAULT false,
  invoice_prefix text DEFAULT 'INV-',
  low_stock_alert boolean DEFAULT true,
  late_invoice_alert boolean DEFAULT true,
  daily_summary_email boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage settings
CREATE POLICY "Admins can manage company settings"
ON public.company_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow all authenticated users to read settings
CREATE POLICY "Authenticated users can read settings"
ON public.company_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings row
INSERT INTO public.company_settings (company_name, phone, email, address)
VALUES ('شركة المراقب لكاميرات المراقبة', '0911234567', 'info@almuraqib.ly', 'طرابلس، ليبيا');