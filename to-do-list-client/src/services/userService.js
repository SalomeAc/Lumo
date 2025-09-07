import { http } from '../api/http.js';

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
  //username,
  password,
  confirmPassword
}) {
  return http.post('/api/v1/users', {
    firstName,
    lastName,
    age,
    email,
    //username,
    password,
    confirmPassword
  });
}