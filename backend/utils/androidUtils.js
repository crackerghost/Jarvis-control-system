const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const runADB = async (cmds) => {
  for (const code of cmds) {
    try {
      const { stdout } = await execPromise(`adb shell ${code.command}`);
      await delay(1000); 
    } catch (err) {
      console.error(`Error executing "${code.command}":`, err.message);
      return false;
    }
  }
  return true;
};

module.exports = { runADB };
