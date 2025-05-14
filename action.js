import fs from "fs";

import chalk from "chalk";
import inquirer from "inquirer";
import axios from "axios";
import { parse, stringify } from "csv/sync";

import DB from "./db.js";
import Task from "./Task.js";
import { type } from "os";

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
  static async add() {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "Enter task title",
        validate: (value) => {
          if (value.length < 3) {
            return "The title must contain at least 3 letters.";
          }
          return true;
        },
      },
      {
        type: "confirm",
        name: "completed",
        message: "Is this task completed?",
        default: false,
      },
    ]);
    try {
      const task = new Task(answers.title, answers.completed);
      task.save();
      console.log(success("New task saved successfully."));
    } catch (error) {
      console.log(error(error.message));
    }
  }
  static async delete() {
    const tasks = Task.getAllTasks();
    const choices = [];
    for (let task of tasks) {
      choices.push(task.title);
    }

    const answer = await inquirer.prompt({
      type: "list",
      name: "title",
      message: "Select a task to delete:",
      choices,
    });

    const task = Task.getTaskByTitle(answer.title);
    try {
      DB.deleteTask(task.id);
      console.log(success("Select task deleted successfully"));
    } catch (err) {
      console.log(error(err.message));
    }
  }

  static async deleteAll() {
    const answer = await inquirer.prompt({
      type: "confirm",
      name: "result",
      message: "Are you sure for delete all tasks?",
    });

    if (answer.result) {
      try {
        DB.resetDB();
        console.log(success("All tasks deleted successfully."));
      } catch (er) {
        console.log(error(er.message));
      }
    }
  }
  static async edit() {
    const tasks = Task.getAllTasks();
    const choices = [];
    for (let task of tasks) {
      choices.push(task.title);
    }
    const selectedTask = await inquirer.prompt({
      type: "list",
      name: "title",
      message: "Select a task to edit:",
      choices,
    });
    const task = Task.getTaskByTitle(selectedTask.title);

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "Enter task title",
        validate: (value) => {
          if (value.length < 3) {
            return "The title must contain at least 3 letters.";
          }
        },
        default: task.title,
      },
      {
        type: "confirm",
        name: "completed",
        message: "Is this task completed?",
        default: false,
      },
    ]);
    try {
      DB.saveTask(answers.title, answers.completed, task.id);
      console.log(success("Selected task edited successfully"));
    } catch (err) {
      console.log(error(err.message));
    }
  }
  static async export() {
    const answer = await inquirer.prompt({
      type: "input",
      name: "filename",
      message: "Enter output filename",
      validate: (value) => {
        if (!/^[\w .-]{1,50}$/.test(value)) {
          return "Please enter a valid filename";
        }
        return true;
      },
    });

    const tasks = Task.getAllTasks(true);
    const output = stringify(tasks, {
      header: true,
      cast: {
        boolean: (value, context) => {
          return String(value);
        },
      },
    });
    try {
      fs.writeFileSync(answer.filename, output);
      console.log(success("Task exported successfully"));
    } catch (error) {
      console.log(error("Can not write to " + answer.filename));
    }
  }

  static async import() {
    const answer = await inquirer.prompt({
      type: "input",
      name: "filename",
      message: "Enter input filename",
    });
    if (fs.existsSync(answer.filename)) {
      try {
        const input = fs.readFileSync(answer.filename);
        const data = parse(input, {
          columns: true,
          cast: (value, context) => {
            if (context.column === "id") {
              return Number(value);
            } else if (context.column === "completed") {
              return value.toLocaleLowerCase() === "true" ? true : false;
            }
            return value;
          },
        });
        DB.insertBulkData(data);
        console.log(success("Data imported successfully."));
      } catch (err) {
        console.log(error(err.message));
      }
    } else {
      console.log(error("Specified file does not exists."));
    }
  }
}
