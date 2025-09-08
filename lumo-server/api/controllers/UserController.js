const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/**
 * Controller class for managing User resources.
 */
class UserController extends GlobalController {
  constructor() {
    super(UserDAO);
  }

  async create(req, res) {
    let {
      firstName,
      lastName,
      age,
      email,
      password,
      confirmPassword,
    } = req.body;

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
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden." });
    }
    try {
      // Validar si el email ya existe
      const existingUser = await this.dao.model.findOne({ email });
      if (existingUser) {
        console.log(`Registration rejected 409 Conflict: email already registered (${email})`);
        return res.status(409).json({ message: "Este correo ya está registrado" });
      }
      const user = await this.dao.create({
        firstName,
        lastName,
        age,
        email,
        password,
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos." });
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

      // Genera token JWT
      const payload = { id: user._id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h", // duración del token
      });

      // Retorna el token
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

/**
 * Export a singleton instance of UserController.
 */
module.exports = new UserController();
