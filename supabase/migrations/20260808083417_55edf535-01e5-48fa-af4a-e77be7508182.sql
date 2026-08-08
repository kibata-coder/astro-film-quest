CREATE TABLE public.site_settings (
  id text PRIMARY KEY DEFAULT 'global',
  maintenance_mode boolean NOT NULL DEFAULT false,
  maintenance_message text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
ON public.site_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admin can update site settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'kibata988@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'kibata988@gmail.com');

INSERT INTO public.site_settings (id, maintenance_mode) VALUES ('global', false);

ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;