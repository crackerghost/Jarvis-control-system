const { exec } = require("child_process");
const { keyboard, mouse, Key, Button, Point } = require("@nut-tree-fork/nut-js");

// Optional: Set speed for typing and mouse
keyboard.config.autoDelayMs = 100;

async function typeText(text) {
  await keyboard.type(text);
}

async function pressKey(key) {
  const upperKey = key.toUpperCase();
  if (Key[upperKey]) {
    await keyboard.pressKey(Key[upperKey]);
    await keyboard.releaseKey(Key[upperKey]);
  } else {
    console.log("❌ Unknown key:", key);
  }
}

async function mouseClick(x, y) {
  await mouse.setPosition(new Point(x, y));
  await mouse.click(Button.LEFT);
}

function launchApp(app) {
  exec(`start ${app}`);
}

async function runLaptopCommand(commands) {
  for (const cmd of commands) {
    switch (cmd.action) {
      case "press":
        await pressKey(cmd.key);
        break;
      case "launch":
        launchApp(cmd.app);
        break;
      case "type":
        await typeText(cmd.text);
        break;
      case "mouse_click":
        await mouseClick(cmd.x, cmd.y);
        break;
      default:
        console.log("❓ Unknown action:", cmd.action);
    }
  }
}

module.exports = runLaptopCommand;
