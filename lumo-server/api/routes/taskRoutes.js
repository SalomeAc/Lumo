const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/TaskController');

/**
 * @route GET /tasks
 * @description Get all tasks
 * @access Public
 */
router.get("/", (req, res) => new TaskController().getAllTasks(req, res));

/**
 * @route POST /tasks
 * @description Create a new task
 * @access Public
 */
router.post("/", (req, res) => new TaskController().createTask(req, res));

/**
 * @route DELETE /tasks/:id
 * @description Delete a task by ID
 * @param {string} id - Task ID
 * @access Public
 */
router.delete("/:id", (req, res) => new TaskController().deleteTask(req, res));


module.exports = router;