-- Database schema for page-service (pages)
-- Recommended database name: notesflow (shared with workspace-service)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_page_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled',
  content jsonb NOT NULL DEFAULT '{"blocks": []}'::jsonb,
  icon text,
  cover_image text,
  is_archived boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  last_edited_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_workspace ON pages (workspace_id);
CREATE INDEX IF NOT EXISTS idx_pages_parent ON pages (parent_page_id);
CREATE INDEX IF NOT EXISTS idx_pages_created_by ON pages (created_by);
CREATE INDEX IF NOT EXISTS idx_pages_position ON pages (workspace_id, parent_page_id, position);

