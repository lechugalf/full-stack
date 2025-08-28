const fs = require("fs");
const path = require("path");

const baseDir = path.resolve(__dirname, "../../../data");

/**
 * Creates a file service for the specified file.
 *
 * This service is responsible for reading/writing files in a shared `data/` directory.
 * The base directory is resolved relative to THIS file so it points to: /project-root/data
 *
 * Example:
 *    const userFile = createFileService("users.json");
 *    // will read/write at /project-root/data/users.json
 *
 * @param {*} fileName
 * @returns
 */
function createFileService(fileName) {
  const filePath = path.join(baseDir, fileName);

  async function readData() {
    const raw = await fs.promises.readFile(filePath);
    return JSON.parse(raw);
  }

  async function writeData(data) {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  return { readData, writeData };
}

module.exports = { createFileService };
