import fs from "fs";

import chalk from "chalk";

const filename = process.env.DB_FILE;
const warn = chalk.yellowBright.bold;
const success = chalk.greenBright.bold;

export default class DB {
  static createDB() {
    if (fs.existsSync(filename)) {
      console.log(warn("DB file already exists."));
      return false;
    }
    try {
      fs.writeFileSync(filename, "[]", "utf-8");
      console.log(success("DB file created successfully."));
      return true;
    } catch (error) {
      throw new Error("Can not write in " + filename);
    }
  }
  static resetDB() {
    try {
      fs.writeFileSync(filename, "[]", "utf-8");
      console.log(success("DB file reset to empty."));
      return true;
    } catch (error) {
      throw new Error("Can not write in " + filename);
    }
  }
  static DBExists() {
    if (fs.existsSync(filename)) {
      return true;
    } else {
      return false;
    }
  }
}
