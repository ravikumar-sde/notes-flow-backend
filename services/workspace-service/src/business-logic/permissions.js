/**
 * Role-based permissions for workspace members
 * 
 * Roles:
 * - owner: Full control over workspace (cannot be assigned via invitation)
 * - admin: Can manage workspace, members, and content
 * - member: Can edit and collaborate on content
 * - guest: Read-only access with commenting ability
 */

const PERMISSIONS = {
  owner: {
    can_view: true,
    can_comment: true,
    can_edit: true,
    can_delete: true,
    can_invite: true,
    can_manage_members: true,
    can_edit_settings: true,
    can_delete_workspace: true,
    can_transfer_ownership: true,
  },
  admin: {
    can_view: true,
    can_comment: true,
    can_edit: true,
    can_delete: true,
    can_invite: true,
    can_manage_members: true,
    can_edit_settings: true,
    can_delete_workspace: false,
    can_transfer_ownership: false,
  },
  member: {
    can_view: true,
    can_comment: true,
    can_edit: true,
    can_delete: false,
    can_invite: false,
    can_manage_members: false,
    can_edit_settings: false,
    can_delete_workspace: false,
    can_transfer_ownership: false,
  },
  guest: {
    can_view: true,
    can_comment: true,
    can_edit: false,
    can_delete: false,
    can_invite: false,
    can_manage_members: false,
    can_edit_settings: false,
    can_delete_workspace: false,
    can_transfer_ownership: false,
  },
};

/**
 * Get permissions for a role
 * @param {string} role - Role name (owner, admin, member, guest)
 * @returns {Object} - Permissions object
 */
function getPermissions(role) {
  return PERMISSIONS[role] || PERMISSIONS.guest;
}

/**
 * Check if a role has a specific permission
 * @param {string} role - Role name
 * @param {string} permission - Permission name
 * @returns {boolean} - Whether the role has the permission
 */
function hasPermission(role, permission) {
  const permissions = getPermissions(role);
  return permissions[permission] === true;
}

/**
 * Check if a role can manage invitations
 * @param {string} role - Role name
 * @returns {boolean}
 */
function canManageInvitations(role) {
  return hasPermission(role, 'can_invite');
}

/**
 * Check if a role can manage members
 * @param {string} role - Role name
 * @returns {boolean}
 */
function canManageMembers(role) {
  return hasPermission(role, 'can_manage_members');
}

/**
 * Check if a role can edit workspace settings
 * @param {string} role - Role name
 * @returns {boolean}
 */
function canEditSettings(role) {
  return hasPermission(role, 'can_edit_settings');
}

/**
 * Check if a role can delete workspace
 * @param {string} role - Role name
 * @returns {boolean}
 */
function canDeleteWorkspace(role) {
  return hasPermission(role, 'can_delete_workspace');
}

/**
 * Check if a role can edit content
 * @param {string} role - Role name
 * @returns {boolean}
 */
function canEdit(role) {
  return hasPermission(role, 'can_edit');
}

/**
 * Check if a role can delete content
 * @param {string} role - Role name
 * @returns {boolean}
 */
function canDelete(role) {
  return hasPermission(role, 'can_delete');
}

/**
 * Get all valid roles that can be assigned via invitation
 * @returns {string[]} - Array of role names
 */
function getInvitableRoles() {
  return ['admin', 'member', 'guest'];
}

/**
 * Check if a role is valid
 * @param {string} role - Role name
 * @returns {boolean}
 */
function isValidRole(role) {
  return Object.keys(PERMISSIONS).includes(role);
}

module.exports = {
  PERMISSIONS,
  getPermissions,
  hasPermission,
  canManageInvitations,
  canManageMembers,
  canEditSettings,
  canDeleteWorkspace,
  canEdit,
  canDelete,
  getInvitableRoles,
  isValidRole,
};

