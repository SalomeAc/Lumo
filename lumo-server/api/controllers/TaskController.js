const GlobalController = require("./GlobalController");
const Task = require("../models/Tasks");
const List = require("../models/List");

class TaskController extends GlobalController {
  // Create a new task
  async createTask(req, res) {
    try {
      const { title, description, status = "Unassigned", dueDate, user, list } = req.body;

      if (!title || !user) {
        return res.status(400).json({
          message: "Title and user are required.",
        });
      }

      // Validate list exists and belongs to user
      const listExists = await List.findOne({ _id: list, user });
      if (!listExists) {
        return res.status(400).json({
          message: "List not found or does not belong to user.",
        });
      }

      const task = await Task.create({
        title,
        description,
        status,
        dueDate,
        user,
        list,
      });

      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({
        message: "Internal server error, try again later",
      });
    }
  }

  // Get all tasks (optionally filtered by list)
  async getAllTasks(req, res) {
    try {
      const { user, list, status } = req.query;
      const filter = { user };

      if (list) filter.list = list;
      if (status) filter.status = status;

      const tasks = await Task.find(filter)
        .sort({ dueDate: 1, createdAt: -1 })
        .populate("list", "title");

      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error getting tasks:", error);
      res.status(500).json({
        message: "Internal server error, try again later",
      });
    }
  }

  // Update a task
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const { title, status, dueDate, list } = req.body;
      const userId = req.body.user; // Assuming user ID is passed in the request

      const task = await Task.findOne({ _id: id, user: userId });
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // If changing lists, verify the new list exists and belongs to the user
      if (list && list !== task.list.toString()) {
        const listExists = await List.findOne({ _id: list, user: userId });
        if (!listExists) {
          return res.status(400).json({
            message: "List not found or does not belong to user.",
          });
        }
        task.list = list;
      }

      if (title) task.title = title;
      if (status) task.status = status;
      if (dueDate) task.dueDate = dueDate;

      await task.save();
      res.status(200).json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({
        message: "Internal server error, try again later",
      });
    }
  }

  // Delete a task
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const { user } = req.body;

      const deletedTask = await Task.findOneAndDelete({
        _id: id,
        user,
      });

      if (!deletedTask) {
        return res.status(404).json({
          message: "Task not found or you don't have permission",
        });
      }

      res.status(200).json({
        message: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({
        message: "Internal server error, try again later",
      });
    }
  }
}

module.exports = new TaskController();
