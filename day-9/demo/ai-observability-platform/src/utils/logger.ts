
import winston from "winston";
//const winston = require("winston");
import asyncLocalStorage from "./context.js";

const logger = winston.createLogger({
    level: "info",

    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {

            const context =

                asyncLocalStorage.getStore();

            return JSON.stringify({

                timestamp: info.timestamp,

                level: info.level,

                requestId: context?.requestId,

                correlationId: context?.correlationId,

                message: info.message

            });

        })


    ),

    transports: [

        new winston.transports.Console(),

        new winston.transports.File({

            filename: "src/logs/application.log"

        }),
        new winston.transports.File({
            filename: "src/logs/error.log",
            level: "error"
        })

    ]
});

export default logger;
//module.exports = logger;
//export { logger };