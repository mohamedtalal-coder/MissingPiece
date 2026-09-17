import { redis } from "./redis.js";

const JWT_MAX_LIFETIME_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Revokes all previously issued tokens for a user.
 * @param userId The ID of the user whose tokens should be revoked.
 */
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  try {
    const key = `revoke:user:${userId}`;
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    
    // Set the revocation timestamp and ensure it auto-expires when the current
    // max possible token lifetime has passed, so Redis doesn't fill up with stale keys.
    await redis.set(key, timestamp.toString(), "EX", JWT_MAX_LIFETIME_SECONDS);
  } catch (error) {
    console.error(`Failed to set revocation timestamp for user ${userId}:`, error);
    // We log the error but don't throw, to prevent a Redis outage from breaking operations
    // that just happen to trigger a revocation (e.g. logging out or demoting).
  }
};

/**
 * Gets the timestamp when a user's tokens were last revoked.
 * Tokens issued before this timestamp should be considered invalid.
 * @param userId The ID of the user to check.
 * @returns The revocation timestamp in seconds, or null if no active revocation exists.
 */
export const getRevocationTimestamp = async (userId: string): Promise<number | null> => {
  try {
    const key = `revoke:user:${userId}`;
    const val = await redis.get(key);
    
    if (val) {
      return parseInt(val, 10);
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to get revocation timestamp for user ${userId}:`, error);
    // If Redis is down, fail open: assume no revocation timestamp is set,
    // so that signature-verified JWTs can still be used.
    return null;
  }
};
