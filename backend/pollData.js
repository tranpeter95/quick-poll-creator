import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POLL_FILE = path.join(__dirname, "polls.json");

export function readPolls() {
  try {
    const data = fs.readFileSync(POLL_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

export function writePolls(polls) {
  fs.writeFileSync(POLL_FILE, JSON.stringify(polls, null, 2));
}
