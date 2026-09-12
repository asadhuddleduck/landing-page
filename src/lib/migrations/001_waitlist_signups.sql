CREATE TABLE IF NOT EXISTS waitlist_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notion_page_id TEXT,
  person_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  business_name TEXT NOT NULL,
  instagram TEXT,
  tiktok TEXT,
  city TEXT,
  brief_info TEXT,
  stage TEXT NOT NULL DEFAULT 'Joined',
  source TEXT NOT NULL DEFAULT 'start.huddleduck.co.uk',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  posting_regularly TEXT,
  uses_copyrighted_music TEXT,
  monthly_content_spend_gbp REAL,
  hours_per_week_on_content REAL,
  team_size_on_content INTEGER,
  content_already_working TEXT,
  anything_else TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  priority_submitted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_signups(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_stage ON waitlist_signups(stage);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist_signups(created_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_notion_page_id ON waitlist_signups(notion_page_id);
