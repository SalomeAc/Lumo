const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { sendMail } = require("../utils/mailer");


/**
 * Controller class for managing User resources.
 */
class UserController extends GlobalController {
  constructor() {
    super(UserDAO);
  }

  async create(req, res) {
    let { firstName, lastName, age, email, password, confirmPassword } =
      req.body;

    // Convierte age a número
    age = Number(age);

    if (
      !firstName ||
      !lastName ||
      age === undefined ||
      age === null ||
      isNaN(age) ||
      age < 0 ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await this.dao.findOne({ email });
      if (existingUser) {
        console.log(
          `Registration rejected 409 Conflict: email already registered (${email})`,
        );
        return res.status(409).json({ message: "Email already registered" });
      }

      const user = await this.dao.create({
        firstName,
        lastName,
        age,
        email,
        password: hashedPassword,
      });

      const listDefault = await List.create({
        title: "Tasks",
        user: user._id,
        // isDefault can be added to List schema if needed
      });

      res.status(201).json({ id: user._id });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log(`Internal server error: ${error.message}`);
      }
      res
        .status(500)
        .json({ message: "Internal server error, try again later" });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    try {
      // Busca el usuario por email
      const user = await this.dao.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Email or password are incorrect" });
      }

      // Compara la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Email or password are incorrect" });
      }

      const payload = { id: user._id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token, userId: user._id });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log(`Internal server error: ${error.message}`);
      }
      res
        .status(500)
        .json({ message: "Internal server error, try again later" });
    }
  }
    async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      const user = await this.dao.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "No account with that email" });
      }

      // Generar JWT token válido por 1 hora
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Guardar token y expiración en la DB
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await user.save();

      const resetLink = `http://localhost:5173/reset-password?token=${token}`;

      // Mandar correo 
      await sendMail(
        user.email,
        "Password Reset Instructions",
        `
          <h2>Hello ${user.firstName},</h2>
          <p>You requested to reset your password for your <b>Lumo</b> account.</p>
          <p>Follow these steps:</p>
          <ol>
            <li>Click the link below to open the reset page.</li>
            <li>Enter your new password and confirm it.</li>
            <li>Submit the form to update your password securely.</li>
          </ol>
          <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
          <p><b>Important:</b> This link will expire in 1 hour and can be used only once.</p>
          <p>If you did not request this, please ignore the email.</p>
          <p>Best regards,<br/>Lumo Support Team</p>
        `
      );

      res.status(200).json({ message: "Reset link sent to your email" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await this.dao.findOne({
        _id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Guardar nueva contraseña
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Opcional: mandar correo de confirmación
      await sendMail(
        user.email,
        "Password Successfully Reset",
        `
          <h2>Hello ${user.firstName},</h2>
          <p>Your password has been successfully changed.</p>
          <p>If you did not perform this action, contact support immediately.</p>
          <p>Best regards,<br/>Lumo Support Team</p>
        `
      );

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }


  
}

/**
 * Export a singleton instance of UserController.
 */
module.exports = new UserController();
