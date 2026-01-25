-- Fix the invoice number generation function
-- The SUBSTRING position was incorrect (12 instead of 13)
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  new_number TEXT;
  year_month TEXT;
  seq_num INTEGER;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Get the max sequence number for the current month
  -- Fixed: SUBSTRING position should be 13 to extract the sequence number correctly
  -- INV-YYYY-MM-XXXX format: positions 1-4=INV-, 5-8=YYYY, 9=-, 10-11=MM, 12=-, 13-16=XXXX
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 13) AS INTEGER)), -1) + 1
  INTO seq_num
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '-%';
  
  new_number := 'INV-' || year_month || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_number;
END;
$function$;