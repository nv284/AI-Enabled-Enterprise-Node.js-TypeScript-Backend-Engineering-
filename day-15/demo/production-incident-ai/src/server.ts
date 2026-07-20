import express from "express";
import fs from "fs";
const app=express(); app.use(express.json());
app.get("/health",(_,res)=>res.json({status:"Running"}));
app.get("/users/:id",(req,res)=>{
 const id=req.params.id;
 if(id==="999"){
   const log=`ERROR Database Timeout UserId=${id} ${new Date().toISOString()}\n`;
   fs.mkdirSync("logs",{recursive:true});
   fs.appendFileSync("logs/incident.log",log);
   return res.status(500).json({error:"Database Timeout"});
 }
 res.json({id:Number(id),name:"John"});
});
app.post("/analyze-incident",(_,res)=>{
 let txt="";
 try{txt=fs.readFileSync("logs/incident.log","utf8");}catch{}
 const result=txt.includes("Database Timeout")?
 {incident:"Database Timeout",rootCause:"Database unavailable or slow",confidence:"95%",recommendation:"Check DB connectivity and connection pool"}:
 {incident:"None",rootCause:"No incident found",confidence:"100%",recommendation:"No action"};
 res.json(result);
});
app.listen(3000,()=>console.log("Server running http://localhost:3000"));