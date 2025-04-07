-- Create extension for text search if not already present
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create materialized view for latest conversations
CREATE MATERIALIZED VIEW IF NOT EXISTS latest_conversations AS
SELECT 
  m.id, 
  m.contact_id, 
  m.content, 
  m.created_at,
  c.name,
  c.phone_number
FROM messages m
JOIN contacts c ON c.id = m.contact_id
JOIN (
  SELECT contact_id, MAX(created_at) as latest_time
  FROM messages
  GROUP BY contact_id
) latest ON m.contact_id = latest.contact_id AND m.created_at = latest.latest_time
ORDER BY m.created_at DESC;

-- Create indexes on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_latest_conversations_id ON latest_conversations(id);
CREATE INDEX IF NOT EXISTS idx_latest_conversations_created_at ON latest_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_latest_conversations_name ON latest_conversations(name);
CREATE INDEX IF NOT EXISTS idx_latest_conversations_phone ON latest_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_latest_conversations_content ON latest_conversations USING gin(content gin_trgm_ops);