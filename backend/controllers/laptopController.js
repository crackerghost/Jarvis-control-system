const { getGeminiResponse } = require("../utils/gemini");
const runLaptopCommand = require("../utils/laptopUtils");

exports.LaptopAccess = async (command, res) => {
  let exeCommand = await getGeminiResponse(`

You are an assistant that returns only a JSON array of objects for controlling a Windows laptop using Node.js automation (like nut-js, child_process, etc).

Given this instruction: "${command}"

Respond ONLY with an array like this:
[
  { "action": "press", "key": "volume_down" },
  { "action": "launch", "app": "chrome" },
  { "action": "type", "text": "hello world" },
  { "action": "mouse_click", "x": 500, "y": 300 }
]

⚠️ IMPORTANT:
- Return ONLY the JSON array. No explanation, no extra text.
- press can be: volume_up, volume_down, enter, esc, ctrl+c, win+d, etc.
- launc supports apps like chrome, vscode, notepad, spotify.
- type should output literal text.
- mouse_click requires coordinates in pixels.
`);

  const jsonString = exeCommand
    .replace(/^```json\n/, "")
    .replace(/\n```$/, "")
    .trim();


    
  exeCommand = JSON.parse(jsonString);
  await runLaptopCommand(exeCommand);
  res.send({ status: "success" });
};
