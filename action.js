import fs from "fs";

import chalk from "chalk";
import inquirer from "inquirer";
import axios from "axios";
import { parse, stringify } from "csv/sync";

import DB from "./db.js";
import Task from "./Task.js";

const error = chalk.redBright.bold;
const warn = chalk.yellowBright.bold;
const success = chalk.greenBright.bold;

export default class Action {
  static list() {
    const tasks = Task.getAllTasks(true);
    if (tasks.length) {
      console.table(tasks);
    } else {
      console.log(warn("There is not any task."));
    }
  }
}
