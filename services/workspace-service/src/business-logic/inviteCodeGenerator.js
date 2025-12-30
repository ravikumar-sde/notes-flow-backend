const crypto = require('crypto');

/**
 * Generate a random invite code
 * Format: XXXX-XXXX-XXXX (12 characters including dashes)
 * Uses alphanumeric characters (uppercase) excluding ambiguous ones (0, O, I, 1)
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude 0, O, I, 1
  const segments = 3;
  const segmentLength = 4;
  
  const code = [];
  for (let i = 0; i < segments; i++) {
    let segment = '';
    for (let j = 0; j < segmentLength; j++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      segment += chars[randomIndex];
    }
    code.push(segment);
  }
  
  return code.join('-');
}

/**
 * Validate invite code format
 */
function isValidInviteCodeFormat(code) {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Format: XXXX-XXXX-XXXX
  const pattern = /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
  return pattern.test(code);
}

/**
 * Normalize invite code (remove spaces, convert to uppercase)
 */
function normalizeInviteCode(code) {
  if (!code || typeof code !== 'string') {
    return null;
  }
  
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Check if invitation is expired
 */
function isInvitationExpired(expiresAt) {
  if (!expiresAt) {
    return false; // No expiry set
  }
  
  return new Date(expiresAt) < new Date();
}

/**
 * Check if invitation has reached max uses
 */
function hasReachedMaxUses(usesCount, maxUses) {
  if (!maxUses) {
    return false; // No limit set
  }
  
  return usesCount >= maxUses;
}

/**
 * Validate if invitation can be used
 */
function canUseInvitation(invitation) {
  if (!invitation) {
    return { valid: false, reason: 'Invitation not found' };
  }
  
  if (!invitation.is_active) {
    return { valid: false, reason: 'Invitation is no longer active' };
  }
  
  if (isInvitationExpired(invitation.expires_at)) {
    return { valid: false, reason: 'Invitation has expired' };
  }
  
  if (hasReachedMaxUses(invitation.uses_count, invitation.max_uses)) {
    return { valid: false, reason: 'Invitation has reached maximum uses' };
  }
  
  return { valid: true };
}

module.exports = {
  generateInviteCode,
  isValidInviteCodeFormat,
  normalizeInviteCode,
  isInvitationExpired,
  hasReachedMaxUses,
  canUseInvitation,
};

