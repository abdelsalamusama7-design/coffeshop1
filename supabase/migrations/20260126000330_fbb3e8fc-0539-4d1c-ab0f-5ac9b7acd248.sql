-- Fix generate_receipt_number function to handle sequence correctly
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  seq_num INTEGER;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Get the max sequence number for current month
  SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(receipt_number, '^RCP-' || year_month || '-', '') AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.receipts
  WHERE receipt_number LIKE 'RCP-' || year_month || '-%';
  
  new_number := 'RCP-' || year_month || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;