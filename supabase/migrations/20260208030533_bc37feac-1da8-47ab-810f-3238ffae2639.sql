-- Update company settings default company name
ALTER TABLE public.company_settings 
ALTER COLUMN company_name SET DEFAULT 'شركة العميد الاردني';

-- Update existing company settings if exists
UPDATE public.company_settings 
SET company_name = 'شركة العميد الاردني'
WHERE company_name = 'شركة المراقب';