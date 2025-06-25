
const { exec } = require('child_process');
const runADB = (cmd) => {
  exec(`adb shell ${cmd}`, (err, stdout, stderr) => {
    if (err) return false;
    return true;
  });
};

module.exports = { runADB };
