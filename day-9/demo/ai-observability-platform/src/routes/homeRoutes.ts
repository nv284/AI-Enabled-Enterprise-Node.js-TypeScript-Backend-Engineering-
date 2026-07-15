import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Welcome to AI Observability Platform"

    });

});

router.get("/error", (req, res) => {

    throw new Error("Artificial Error Generated");

});

export default router;