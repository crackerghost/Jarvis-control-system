const { execSync } = require("child_process");
const fs = require("fs");

const play = async (targetWord) => {
  try {
    console.log("📸 Taking screenshot...");
    execSync("adb shell screencap -p /sdcard/screen.png");
    execSync("adb pull /sdcard/screen.png");

    console.log("🧠 Running native Tesseract CLI...");
    execSync(`tesseract screen.png screen_output --psm 6 tsv`);

    const tsv = fs.readFileSync("screen_output.tsv", "utf8");
    const lines = tsv.split("\n").slice(1); // skip header row

    for (const line of lines) {
      const cols = line.split("\t");
      if (cols.length >= 12) {
        const [level, page, block, par, lineNum, wordNum, left, top, width, height, conf, text] = cols;
        console.log(text)
        if (text && text.toLowerCase().includes(targetWord.toLowerCase())) {
          const x = parseInt(left) + parseInt(width) / 2;
          const y = parseInt(top) + parseInt(height) / 2;
          console.log(`✅ Found "${targetWord}" at (${x}, ${y})`);
          execSync(`adb shell input tap ${Math.floor(x)} ${Math.floor(y)}`);
          return;
        }
      }
    }

    console.log(`❌ Word "${targetWord}" not found.`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
};

module.exports = play;
