import {Task} from "./task";

export class TaskManager{
 private tasks:Task[]=[];

 addTask(title:string){
  this.tasks.push({id:this.tasks.length+1,title,completed:false});
 }

 completeTask(id:number){
  const t=this.tasks.find(x=>x.id===id);
  if(t) t.completed=true;
 }

 listTasks(){
  return this.tasks;
 }
}
