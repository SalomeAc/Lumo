const GlobalController = require("./GlobalController");
const List = require("../models/List");

/**
 * Controller for List resources, extending GlobalController.
 * Implements custom logic for creating lists (unique per user).
 */
class ListController extends GlobalController {
  constructor() {
    super(List); // Si luego tienes un DAO, reemplaza List por ListDAO
  }

  /**
   * Create a new list ensuring the name is unique for the user.
   */
  async create(req, res) {
    const { name, description, user } = req.body;

    if (!name || !user) {
      return res.status(400).json({ message: "Name and user are required." });
    }

    try {
      // Check if list with same name exists for this user
      const exists = await this.dao.findOne({ name, user });
      if (exists) {
        return res
          .status(409)
          .json({ message: "List name already exists for this user." });
      }

      const list = await this.dao.create({ name, description, user });
      res.status(201).json(list);
    } catch (error) {
      res.status(500).json({ message: "Error creating list", error });
    }
  }

  /**
   * Get lists filtered by user.
   */
  async getAll(req, res) {
    const { user } = req.query;
    if (!user) {
      return res.status(400).json({ message: "User is required." });
    }
    try {
      const lists = await this.dao.find({ user });
      res.status(200).json(lists);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lists", error });
    }
  }
}

module.exports = new ListController();
