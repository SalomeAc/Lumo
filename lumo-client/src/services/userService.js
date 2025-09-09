import { http } from "../api/http.js";

/**
 * Register a new user in the system.
 *
 * Sends a POST request to the backend API (`/api/v1/users`)
 * with the provided user data.
 *
 * @async
 * @function registerUser
 * @param {Object} params - User registration data.
 * @param {string} params.firstName - The user's first name.
 * @param {string} params.lastName - The user's last name.
 * @param {number} params.age - The user's age.
 * @param {string} params.email - The user's email.
 * @param {string} params.username - The username of the new user.
 * @param {string} params.password - The password of the new user.
 * @param {string} params.confirmPassword - The password confirmation.
 * @returns {Promise<Object>} The created user object returned by the API.
 * @throws {Error} If the API responds with an error status or message.
 */
export async function registerUser({
  firstName,
  lastName,
  age,
  email,
  password,
  confirmPassword,
}) {
  return http.post("/api/v1/users", {
    firstName,
    lastName,
    age,
    email,
    password,
    confirmPassword,
  });
}

export async function loginUser({ email, password }) {
  return http.post("/api/v1/users/login", {
    email,
    password,
  });
}

export async function getUserProfileInfo({ email }) {
  return http.get("no sé", {
    email,
  });
}

/**
 * Send a password recovery email.
 * 
 * This will trigger the backend to send a recovery email
 * with a token/link to the user.
 * 
 * @param {string} email - The email of the user requesting password recovery.
 * @returns {Promise<Object>} API response with confirmation.
 */
export async function sendRecoveryEmail(email) {
  return http.post("/api/v1/users/forgot-password", { email });
}

/**
 * Reset the password using the recovery token.
 * 
 * The backend validates the token and updates the password.
 * 
 * @param {string} token - The recovery token sent to the user's email.
 * @param {string} newPassword - The new password chosen by the user.
 * @returns {Promise<Object>} API response with confirmation.
 */
export async function resetPassword(token, newPassword, confirmPassword) {
  return http.post(`/api/v1/users/reset-password/${token}`, {
    newPassword,
    confirmPassword
  });
}
