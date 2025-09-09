const express = require("express");
const router = express.Router();

const UserController = require("../controllers/UserController");

/**
 * @route GET /users
 * @description Retrieve all users.
 * @access Public
 */
router.get("/", (req, res) => UserController.getAll(req, res));

/**
 * @route GET /users/:id
 * @description Retrieve a user by ID.
 * @param {string} id - The unique identifier of the user.
 * @access Public
 */
router.get("/:id", (req, res) => UserController.read(req, res));

/**
 * @route POST /users
 * @description Create a new user.
 * @body {string} username - The username of the user.
 * @body {string} password - The password of the user.
 * @access Public
 */
router.post("/", (req, res) => UserController.create(req, res));

/**
 * @route PUT /users/:id
 * @description Update an existing user by ID.
 * @param {string} id - The unique identifier of the user.
 * @body {string} [username] - Updated username (optional).
 * @body {string} [password] - Updated password (optional).
 * @access Public
 */
router.put("/:id", (req, res) => UserController.update(req, res));

/**
 * @route DELETE /users/:id
 * @description Delete a user by ID.
 * @param {string} id - The unique identifier of the user.
 * @access Public
 */
router.delete("/:id", (req, res) => UserController.delete(req, res));

/**
 * @route POST /users/login
 * @description Login a user and return a JWT token.
 * @body {string} email - The user's email.
 * @body {string} password - The user's password.
 * @access Public
 */
router.post("/login", (req, res) => UserController.login(req, res));

/**
 * @route POST /users/forgot-password
 * @description Send a password reset link to user's email.
 * @body {string} email - The user's email.
 * @access Public
 */
router.post("/forgot-password", (req, res) =>
  UserController.forgotPassword(req, res)
);

/**
 * @route POST /users/reset-password/:token
 * @description Reset password using token from email.
 * @param {string} token - The reset token sent by email.
 * @body {string} newPassword - The new password.
 * @body {string} confirmPassword - Confirmation of the new password.
 * @access Public
 */
router.post("/reset-password/:token", (req, res) =>
  UserController.resetPassword(req, res)
);



/**
 * Export the router instance to be mounted in the main routes file.
 */
module.exports = router;
