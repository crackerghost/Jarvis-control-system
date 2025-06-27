const express = require("express");
const { command } = require("../controllers/mainController");
const router = express.Router();
router.route("/command").post(command);
module.exports = router;
