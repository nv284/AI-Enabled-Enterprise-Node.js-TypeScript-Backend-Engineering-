"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = __importStar(require("@grpc/grpc-js"));
const loader = __importStar(require("@grpc/proto-loader"));
const def = loader.loadSync('proto/notification.proto');
const proto = grpc.loadPackageDefinition(def).notification;
function subscribe(call) {
    const msgs = [
        { title: 'Alert', message: 'Robot Started' },
        { title: 'Info', message: 'Obstacle Detected' },
        { title: 'Done', message: 'Mission Completed' }
    ];
    let i = 0;
    const id = setInterval(() => {
        if (i < msgs.length) {
            call.write(msgs[i++]);
        }
        else {
            clearInterval(id);
            call.end();
        }
    }, 1000);
}
const s = new grpc.Server();
s.addService(proto.NotificationService.service, { Subscribe: subscribe });
s.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => { s.start(); console.log('Streaming server started'); });
