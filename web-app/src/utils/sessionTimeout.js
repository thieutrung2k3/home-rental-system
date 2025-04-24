/** @format */

// Constants for OTP session
export const OTP_SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
export const OTP_SESSION_KEY = "otpSession";

/**
 * Creates an OTP session with email and expiration timestamp
 * @param {string} email - User's email
 * @returns {void}
 */
export const createOtpSession = (email) => {
  const session = {
    email,
    timestamp: Date.now(),
    expiresAt: Date.now() + OTP_SESSION_TIMEOUT,
  };

  localStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
};

/**
 * Validates if the OTP session is valid for the given email
 * @param {string} email - User's email to validate against
 * @returns {boolean} - True if session is valid, false otherwise
 */
export const isValidOtpSession = (email) => {
  try {
    const sessionData = localStorage.getItem(OTP_SESSION_KEY);
    if (!sessionData) return false;

    const session = JSON.parse(sessionData);

    // Check if session is for the same email
    if (session.email !== email) return false;

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      clearOtpSession();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating OTP session:", error);
    return false;
  }
};

/**
 * Get time remaining in OTP session in seconds
 * @returns {number} - Seconds remaining, or 0 if no session/expired
 */
export const getOtpSessionTimeRemaining = () => {
  try {
    const sessionData = localStorage.getItem(OTP_SESSION_KEY);
    if (!sessionData) return 0;

    const session = JSON.parse(sessionData);
    const remaining = Math.max(
      0,
      Math.floor((session.expiresAt - Date.now()) / 1000)
    );

    return remaining;
  } catch (error) {
    console.error("Error calculating OTP session time remaining:", error);
    return 0;
  }
};

/**
 * Clears the OTP session
 */
export const clearOtpSession = () => {
  localStorage.removeItem(OTP_SESSION_KEY);
};

/**
 * Gets the email from OTP session if exists
 * @returns {string|null} - Email or null if no session
 */
export const getOtpSessionEmail = () => {
  try {
    const sessionData = localStorage.getItem(OTP_SESSION_KEY);
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);
    return session.email;
  } catch (error) {
    console.error("Error getting OTP session email:", error);
    return null;
  }
};
