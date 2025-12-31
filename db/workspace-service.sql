-- Database schema for workspace-service (workspaces + memberships)
-- Recommended database name: notesflow_workspace

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_memberships (
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_memberships_user ON workspace_memberships (user_id);

-- Workspace invitations table
CREATE TABLE IF NOT EXISTS workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  invite_code varchar(12) NOT NULL UNIQUE,
  role varchar(20) NOT NULL DEFAULT 'member',
  created_by uuid NOT NULL,
  expires_at timestamptz,
  max_uses integer,
  uses_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace ON workspace_invitations (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_code ON workspace_invitations (invite_code);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_creator ON workspace_invitations (created_by);

-- Workspace invitation acceptances table (tracks who accepted which invitation)
CREATE TABLE IF NOT EXISTS workspace_invitation_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES workspace_invitations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invitation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_invitation_acceptances_invitation ON workspace_invitation_acceptances (invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_acceptances_user ON workspace_invitation_acceptances (user_id);

