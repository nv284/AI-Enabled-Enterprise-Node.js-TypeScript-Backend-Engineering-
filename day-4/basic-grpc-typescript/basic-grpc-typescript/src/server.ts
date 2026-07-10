import * as grpc from '@grpc/grpc-js';
import * as loader from '@grpc/proto-loader';

const def=loader.loadSync('proto/hello.proto');
const proto=(grpc.loadPackageDefinition(def) as any).hello;

function sayHello(call:any,callback:any){
 callback(null,{message:`Hello ${call.request.name}! Welcome to gRPC.`});
}

const server=new grpc.Server();
server.addService(proto.GreetingService.service,{SayHello:sayHello});
server.bindAsync('0.0.0.0:50051',grpc.ServerCredentials.createInsecure(),()=>{
 server.start();
 console.log('Server running on 50051');
});
