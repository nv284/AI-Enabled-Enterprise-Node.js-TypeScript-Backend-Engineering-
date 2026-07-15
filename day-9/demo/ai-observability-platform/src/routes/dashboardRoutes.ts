import { Router } from "express";

import DashboardController
    from "../controller/dashboardController.js";

const router = Router();

/*
==========================================
Dashboard Page
==========================================
*/

router.get(

    "/dashboard",

    DashboardController.getDashboard

);

/*
==========================================
Dashboard Data
==========================================
*/

router.get(

    "/dashboard/data",

    DashboardController.getDashboardData

);

/*
==========================================
Metrics
==========================================
*/

router.get(

    "/dashboard/metrics",

    DashboardController.getMetrics

);

/*
==========================================
Ping
==========================================
*/

router.get(

    "/dashboard/ping",

    DashboardController.ping

);

export default router;