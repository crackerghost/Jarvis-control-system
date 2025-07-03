const { runADB } = require("../utils/androidUtils");
const { getGeminiResponse } = require("../utils/gemini");
const play = require("../utils/tscrap");
const { android } = require("./androidController");
const { AccessLed } = require("./espController");
const { LaptopAccess } = require("./laptopController");

exports.command = async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) {
      return res.send("no command found");
    }
    if (
      command.toLowerCase().includes("laptop") ||
      command.toLowerCase().includes("pc")
    ) {
      return await LaptopAccess(command, res);
    }
    if (command.toLowerCase().includes("phone")) {
      return await android(command, res);
    }

    if (command.toLowerCase().includes("bulb")) {
      if (command.toLowerCase().includes("on")) {
        await AccessLed(true)
        return res.send({ status: "success", message: "Bulb turned on" });
      } else {
         await AccessLed(false)
        return res.send({ status: "success", message: "Bulb turned off" });
      }
    }
    if (
      !command.toLowerCase().includes("phone") ||
      !command.toLowerCase().includes("laptop")
    ) {
      return res.send({ status: "success with no command" });
    }
  } catch (error) {
    return res.send({ status: "failed", message: error });
  }
};
