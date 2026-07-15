import { Router } from "express";

import register

    from "../config/metrics.js";

import HealthController

    from "../controller/healthController.js";

const router = Router();

router.get(

    "/health",

    HealthController.getHealth

);

router.get(

    "/metrics",

    async (req, res) => {

        res.set(

            "Content-Type",

            register.contentType

        );

        res.end(

            await register.metrics()

        );

    });

export default router;