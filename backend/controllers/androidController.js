const { runADB } = require("../utils/androidUtils");
const { getGeminiResponse } = require("../utils/gemini");

exports.command = async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) {
      return res.send("no command found");
    }
    let exeCommand = await getGeminiResponse(`
        you have to provide a command for adb shell for android phone regarding ${command}
        your response should like this :[
        {command : "input keyevent 26"} ,
        NOTE : do not return any thing else only return command array make sure whole command is working
        also return it in proper json format which i can easily parse
    ]
        `);
 
    const jsonString = exeCommand
      .replace(/^```json\n/, "")
      .replace(/\n```$/, "")
      .trim();

    exeCommand = JSON.parse(jsonString);
    console.log(exeCommand.command)
    runADB(exeCommand[0]?.command);
    return res.send({
      status: "success",
      shellCommand: exeCommand,
    });
  } catch (error) {
    return res.send({ status: "failed", message: error });
  }
};
