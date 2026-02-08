-- Add image_url column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add unit column to track product units (piece, cup, bottle, etc.)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'قطعة';

-- Add is_prepared column to distinguish between prepared drinks and packaged items
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_prepared BOOLEAN DEFAULT false;

-- Create product_ingredients table for tracking ingredients of prepared drinks
CREATE TABLE IF NOT EXISTS public.product_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ingredient_name TEXT NOT NULL,
  quantity_per_unit NUMERIC NOT NULL DEFAULT 1,
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on product_ingredients
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_ingredients
CREATE POLICY "Allow all operations on product_ingredients" 
ON public.product_ingredients 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_product_ingredients_updated_at
BEFORE UPDATE ON public.product_ingredients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();