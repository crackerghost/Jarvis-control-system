const { runADB } = require("../utils/androidUtils");
const { getGeminiResponse } = require("../utils/gemini");
const play = require("../utils/tscrap");

exports.android = async (command, res) => {
  if (command.toLowerCase().includes("select")) {
    const target = command
      .toLowerCase()
      .replace("select", "")
      .replace("on phone", "")
      .trim();

    await play(target);
    return res.send({ status: "success" });
  }
  let exeCommand = await getGeminiResponse(`
    You are an assistant that returns only a JSON array of ADB shell command objects for Android phones based on the given instruction.

    Given this instruction: "${command}"

    Respond ONLY with an array like this:
[
  { "command": "input keyevent 26" },
  { "command": "input keyevent 25" }
]

⚠️ IMPORTANT:
- Return ONLY the JSON array. No explanation, no extra text.
- Ensure each command is valid and executable via ADB shell.
- My camera package is: com.android.camera/com.android.camera.CameraActivity
- My youtube package is : com.google.android.youtube/com.google.android.apps.youtube.app.WatchWhileActivity and search command am start -a android.intent.action.VIEW -d \"https://www.youtube.com/results?search_query=query_Value_Without_Whitespace\"
- My spotify package is : com.spotify.music/.MainActivity and search command "am start -a android.intent.action.VIEW -d \"spotify:search:query_value_without_whitespace\"
- If play is in promot than for playing tap on x 350 and y 1150 pixels
`);

  const jsonString = exeCommand
    .replace(/^```json\n/, "")
    .replace(/\n```$/, "")
    .trim();

  exeCommand = JSON.parse(jsonString);
  runADB(exeCommand);
  return res.send({
    status: "success",
    shellCommand: exeCommand,
  });
};
