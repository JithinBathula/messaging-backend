-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index on contact_id for faster joins
CREATE INDEX IF NOT EXISTS idx_messages_contact_id ON messages(contact_id);

-- Add index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Add index on contact name for faster searching
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);

-- Add index on phone_number for faster searching
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone_number);

-- A trigram index on message content for full-text search capability
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_messages_content_trgm ON messages USING GIN (content gin_trgm_ops);