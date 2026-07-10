import * as grpc from '@grpc/grpc-js';
import * as loader from '@grpc/proto-loader';

const def=loader.loadSync('proto/hello.proto');
const proto=(grpc.loadPackageDefinition(def) as any).hello;

const client=new proto.GreetingService('localhost:50051',grpc.credentials.createInsecure());

client.SayHello({name:'Nishi'},(err:any,res:any)=>{
 if(err) return console.error(err);
 console.log(res.message);
});
