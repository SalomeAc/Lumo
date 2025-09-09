const GlobalController = require("./GlobalController");
const List = require("../models/List");
const ListDAO = require("../dao/ListDAO");

class ListController extends GlobalController {
  constructor() {
    super(ListDAO);
  }

  // Create a new list
  async create(req, res) {
    console.log("Request body received:", req.body);
    console.log("Request headers:", req.headers);
    
    const { title, user } = req.body;
    console.log("Extracted values - title:", title, "user:", user);

    if (!title || !user) {
        console.log("Validation failed - missing title or user");
        return res.status(400).json({ 
            message: "Title and user are required.",
            receivedData: req.body  // Esto te mostrará exactamente qué recibió el servidor
        });
    }

    try {
      // Check if list with same name exists for this user
      const exists = await List.findOne({ title, user });
      if (exists) {
        return res.status(409).json({ 
          message: "List name already exists for this user." 
        });
      }

      const list = await List.create({ title, user });
      res.status(201).json(list);
    } catch (error) {
      console.error("Error creating list:", error);
      res.status(500).json({ 
        message: "Internal server error, try again later" 
      });
    }
  }

  // Get all lists for a user
  async getAll(req, res) {
    const { user } = req.query;
    if (!user) {
      return res.status(400).json({ message: "User is required." });
    }
    try {
      const lists = await List.find({ user });
      res.status(200).json(lists);
    } catch (error) {
      console.error("Error getting lists:", error);
      res.status(500).json({ 
        message: "Internal server error, try again later" 
      });
    }
  }
}

module.exports = new ListController();