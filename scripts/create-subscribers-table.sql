CREATE TABLE IF NOT EXISTS shop_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  source TEXT DEFAULT 'shop',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shop_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage subscribers"
  ON shop_subscribers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM academy_staff
      WHERE id = auth.uid() AND is_admin = true
    )
  );
