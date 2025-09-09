const express = require('express');
const router = express.Router();
const ListController = require('../controllers/ListController');

router.post("/", ListController.create); 
router.get("/", ListController.getAll);   

module.exports = router;