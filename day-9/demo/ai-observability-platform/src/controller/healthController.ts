import { Request, Response } from "express";

export default class HealthController {

    static getHealth(

        req: Request,

        res: Response

    ) {

        res.json({

            status: "UP",

            uptime: process.uptime(),

            memory: process.memoryUsage(),

            nodeVersion: process.version,

            timestamp: new Date()

        });

    }

}