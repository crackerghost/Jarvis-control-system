const express = require("express");
const { command } = require("../controllers/androidController");
const router = express.Router();
router.route("/command").post(command);
module.exports = router;
