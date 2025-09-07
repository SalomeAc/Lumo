const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");

/**
 * Controller class for managing User resources.
 */
class UserController extends GlobalController {
    constructor() {
        super(UserDAO);
    }

    async create(req, res) {
        console.log("BODY RECIBIDO:", req.body);
        let { firstName, lastName, age, email, username, password, confirmPassword } = req.body;

        // Convierte age a número
        age = Number(age);

        if (
            !firstName ||
            !lastName ||
            age === undefined || age === null || isNaN(age) || age < 0 ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Las contraseñas no coinciden." });
        }
        try {
            const user = await this.dao.create({ firstName, lastName, age, email, password });
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

/**
 * Export a singleton instance of UserController.
 */
module.exports = new UserController();