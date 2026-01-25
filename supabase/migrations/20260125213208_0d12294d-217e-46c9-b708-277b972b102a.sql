-- Add status column to customers table
ALTER TABLE public.customers 
ADD COLUMN status text NOT NULL DEFAULT 'جديد';

-- Create index for better filtering performance
CREATE INDEX idx_customers_status ON public.customers(status);