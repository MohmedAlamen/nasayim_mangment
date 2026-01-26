-- Create storage bucket for customer files and service photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for attachments bucket
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Anyone can view attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can update their attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'attachments');

CREATE POLICY "Admins can delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'));

-- Add attachments column to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Add photos column to appointments for completed service photos
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]'::jsonb;