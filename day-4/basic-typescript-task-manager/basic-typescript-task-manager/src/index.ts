import {TaskManager} from "./taskManager";

const manager=new TaskManager();

manager.addTask("Learn TypeScript");
manager.addTask("Create first project");
manager.completeTask(1);

console.log("Task List");
console.table(manager.listTasks());
