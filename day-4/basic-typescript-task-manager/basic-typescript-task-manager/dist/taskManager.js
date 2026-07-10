"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskManager = void 0;
class TaskManager {
    constructor() {
        this.tasks = [];
    }
    addTask(title) {
        this.tasks.push({ id: this.tasks.length + 1, title, completed: false });
    }
    completeTask(id) {
        const t = this.tasks.find(x => x.id === id);
        if (t)
            t.completed = true;
    }
    listTasks() {
        return this.tasks;
    }
}
exports.TaskManager = TaskManager;
