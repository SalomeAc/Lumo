const express = require('express');
const router = express.Router();
const ListController = require('../controllers/ListController');

/**
 * @route POST /lists
 * @description Create a new list
 * @access Public
 */
router.post("/", (req, res) => new ListController().createList(req, res));

/**
 * @route GET /lists
 * @description Get all lists for a user
 * @access Public
 */
router.get("/", (req, res) => new ListController().getListsByUser(req, res));

/**
 * @route GET /lists/:id
 * @description Get a list by ID
 * @access Public
 */
router.get("/:id", (req, res) => new ListController().getListById(req, res));

/**
 * @route PUT /lists/:id
 * @description Update a list by ID
 * @access Public
 */
router.put("/:id", (req, res) => new ListController().updateList(req, res));

/**
 * @route DELETE /lists/:id
 * @description Delete a list by ID
 * @access Public
 */
router.delete("/:id", (req, res) => new ListController().deleteList(req, res));

module.exports = router;