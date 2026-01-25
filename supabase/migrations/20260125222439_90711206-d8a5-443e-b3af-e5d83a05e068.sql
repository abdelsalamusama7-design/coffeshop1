-- Create devices table for tracking sold equipment
CREATE TABLE public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  device_type text NOT NULL,
  device_model text,
  serial_number text NOT NULL,
  warranty_start_date date NOT NULL DEFAULT CURRENT_DATE,
  warranty_months integer NOT NULL DEFAULT 12,
  warranty_end_date date,
  installation_date date,
  location_details text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'under_repair', 'replaced')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create maintenance logs table
CREATE TABLE public.maintenance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  maintenance_type text NOT NULL CHECK (maintenance_type IN ('repair', 'inspection', 'replacement', 'upgrade', 'complaint')),
  description text NOT NULL,
  technician_name text,
  cost numeric DEFAULT 0,
  is_warranty_claim boolean DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  scheduled_date date,
  completed_date date,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for devices
CREATE POLICY "Authenticated users can view devices"
ON public.devices FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert devices"
ON public.devices FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update devices"
ON public.devices FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete devices"
ON public.devices FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for maintenance logs
CREATE POLICY "Authenticated users can view maintenance logs"
ON public.maintenance_logs FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert maintenance logs"
ON public.maintenance_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update maintenance logs"
ON public.maintenance_logs FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete maintenance logs"
ON public.maintenance_logs FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to calculate warranty end date
CREATE OR REPLACE FUNCTION public.calculate_warranty_end_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.warranty_end_date := NEW.warranty_start_date + (NEW.warranty_months || ' months')::interval;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-calculate warranty end date
CREATE TRIGGER calculate_device_warranty_end_date
BEFORE INSERT OR UPDATE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION public.calculate_warranty_end_date();

-- Create indexes for better performance
CREATE INDEX idx_devices_customer_id ON public.devices(customer_id);
CREATE INDEX idx_devices_serial_number ON public.devices(serial_number);
CREATE INDEX idx_devices_warranty_end_date ON public.devices(warranty_end_date);
CREATE INDEX idx_devices_status ON public.devices(status);
CREATE INDEX idx_maintenance_logs_device_id ON public.maintenance_logs(device_id);
CREATE INDEX idx_maintenance_logs_customer_id ON public.maintenance_logs(customer_id);

-- Create trigger for updated_at
CREATE TRIGGER update_devices_updated_at
BEFORE UPDATE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();