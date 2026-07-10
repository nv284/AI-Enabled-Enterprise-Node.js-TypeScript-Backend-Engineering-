import * as grpc from '@grpc/grpc-js';
import * as loader from '@grpc/proto-loader';
const def=loader.loadSync('proto/notification.proto');
const proto=(grpc.loadPackageDefinition(def) as any).notification;
function subscribe(call:any){
 const msgs=[
  {title:'Alert',message:'Robot Started'},
  {title:'Info',message:'Obstacle Detected'},
  {title:'Done',message:'Mission Completed'}
 ];
 let i=0;
 const id=setInterval(()=>{
   if(i<msgs.length){call.write(msgs[i++]);}
   else{clearInterval(id);call.end();}
 },1000);
}
const s=new grpc.Server();
s.addService(proto.NotificationService.service,{Subscribe:subscribe});
s.bindAsync('0.0.0.0:50051',grpc.ServerCredentials.createInsecure(),()=>{s.start();console.log('Streaming server started');});
