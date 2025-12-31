/**
 * Role-based permissions for page operations
 * Roles: owner, admin, member, guest
 */

const PERMISSIONS = {
  owner: {
    can_view: true,
    can_comment: true,
    can_edit: true,
    can_delete: true,
    can_archive: true,
    can_move: true,
  },
  admin: {
    can_view: true,
    can_comment: true,
    can_edit: true,
    can_delete: true,
    can_archive: true,
    can_move: true,
  },
  member: {
    can_view: true,
    can_comment: true,
    can_edit: true,
    can_delete: false,
    can_archive: false,
    can_move: true,
  },
  guest: {
    can_view: true,
    can_comment: true,
    can_edit: false,
    can_delete: false,
    can_archive: false,
    can_move: false,
  },
};

/**
 * Get all permissions for a role
 * @param {string} role - The role to get permissions for
 * @returns {object} Object with permission flags
 */
function getPermissions(role) {
  return PERMISSIONS[role] || PERMISSIONS.guest;
}

/**
 * Check if a role has a specific permission
 * @param {string} role - The role to check
 * @param {string} permission - The permission to check
 * @returns {boolean} True if the role has the permission
 */
function hasPermission(role, permission) {
  const permissions = getPermissions(role);
  return permissions[permission] === true;
}

/**
 * Check if user can edit pages
 * @param {string} role - User's role in the workspace
 * @returns {boolean} True if user can edit
 */
function canEdit(role) {
  return hasPermission(role, 'can_edit');
}

/**
 * Check if user can delete pages
 * @param {string} role - User's role in the workspace
 * @returns {boolean} True if user can delete
 */
function canDelete(role) {
  return hasPermission(role, 'can_delete');
}

/**
 * Check if user can archive pages
 * @param {string} role - User's role in the workspace
 * @returns {boolean} True if user can archive
 */
function canArchive(role) {
  return hasPermission(role, 'can_archive');
}

/**
 * Check if user can move pages
 * @param {string} role - User's role in the workspace
 * @returns {boolean} True if user can move
 */
function canMove(role) {
  return hasPermission(role, 'can_move');
}

/**
 * Check if a role is valid
 * @param {string} role - The role to validate
 * @returns {boolean} True if the role is valid
 */
function isValidRole(role) {
  return Object.keys(PERMISSIONS).includes(role);
}

module.exports = {
  PERMISSIONS,
  getPermissions,
  hasPermission,
  canEdit,
  canDelete,
  canArchive,
  canMove,
  isValidRole,
};

