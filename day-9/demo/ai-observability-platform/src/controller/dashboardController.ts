import { Request, Response } from "express";
import path from "path";
import os from "os";

import register from "../config/metrics.js";

export default class DashboardController {

    /*
    ===========================================================
    Dashboard Page
    ===========================================================
    */

    static getDashboard(
        req: Request,
        res: Response
    ) {

        const dashboardPath = path.join(
            process.cwd(),
            "src",
            "public",
            "dashboard.html"
        );

        res.sendFile(dashboardPath);

    }

    /*
    ===========================================================
    Dashboard Data API
    ===========================================================
    */

    static async getDashboardData(
        req: Request,
        res: Response
    ) {

        try {

            const memory = process.memoryUsage();

            const dashboardData = {

                application: {

                    name: "AI Observability Platform",

                    version: "1.0.0",

                    environment:
                        process.env.NODE_ENV || "development"

                },

                health: {

                    status: "UP",

                    uptime: process.uptime(),

                    timestamp: new Date()

                },

                runtime: {

                    nodeVersion: process.version,

                    platform: process.platform,

                    architecture: process.arch,

                    hostname: os.hostname(),

                    cpuCount: os.cpus().length

                },

                memory: {

                    rss: DashboardController.convertToMB(memory.rss),

                    heapUsed: DashboardController.convertToMB(memory.heapUsed),

                    heapTotal: DashboardController.convertToMB(memory.heapTotal),

                    external: DashboardController.convertToMB(memory.external)

                }

            };

            res.status(200).json(dashboardData);

        }

        catch (error) {

            res.status(500).json({

                success: false,

                message: "Unable to load dashboard data"

            });

        }

    }

    /*
    ===========================================================
    Prometheus Metrics
    ===========================================================
    */

    static async getMetrics(
        req: Request,
        res: Response
    ) {

        try {

            res.setHeader(

                "Content-Type",

                register.contentType

            );

            const metrics = await register.metrics();

            res.send(metrics);

        }

        catch (error) {

            res.status(500).send("Unable to generate metrics.");

        }

    }

    /*
    ===========================================================
    Dashboard Ping
    ===========================================================
    */

    static ping(
        req: Request,
        res: Response
    ) {

        res.json({

            success: true,

            message: "Dashboard API Running",

            time: new Date()

        });

    }

    /*
    ===========================================================
    Helper Function
    ===========================================================
    */

    private static convertToMB(
        value: number
    ): string {

        return (

            value /

            1024 /

            1024

        ).toFixed(2) + " MB";

    }

}