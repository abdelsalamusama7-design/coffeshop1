-- Add backup schedule settings to company_settings
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS backup_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS backup_schedule text DEFAULT 'daily' CHECK (backup_schedule IN ('daily', 'weekly')),
ADD COLUMN IF NOT EXISTS backup_day integer DEFAULT 0 CHECK (backup_day >= 0 AND backup_day <= 6),
ADD COLUMN IF NOT EXISTS backup_time time DEFAULT '02:00:00',
ADD COLUMN IF NOT EXISTS last_backup_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS backup_email text;

-- Create backup_logs table to track backup history
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'in_progress')),
  file_size bigint,
  records_count jsonb,
  error_message text,
  triggered_by text DEFAULT 'manual' CHECK (triggered_by IN ('manual', 'scheduled'))
);

-- Enable RLS on backup_logs
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view backup logs
CREATE POLICY "Admins can manage backup logs"
ON public.backup_logs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON public.backup_logs(created_at DESC);