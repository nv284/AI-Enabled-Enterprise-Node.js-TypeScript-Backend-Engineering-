"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taskManager_1 = require("./taskManager");
const manager = new taskManager_1.TaskManager();
manager.addTask("Learn TypeScript");
manager.addTask("Create first project");
manager.completeTask(1);
console.log("Task List");
console.table(manager.listTasks());
