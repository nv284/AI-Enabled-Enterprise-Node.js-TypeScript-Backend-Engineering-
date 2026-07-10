import * as grpc from '@grpc/grpc-js';
import * as loader from '@grpc/proto-loader';
const def=loader.loadSync('proto/notification.proto');
const proto=(grpc.loadPackageDefinition(def) as any).notification;
const client=new proto.NotificationService('localhost:50051',grpc.credentials.createInsecure());
const stream=client.Subscribe({user:'Student'});
stream.on('data',(m:any)=>console.log(m));
stream.on('end',()=>console.log('Stream completed'));

// get/status -> no change -> get/status -> no change 