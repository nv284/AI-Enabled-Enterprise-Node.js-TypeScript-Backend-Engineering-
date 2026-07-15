import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
import requestLogger from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import homeRoutes from "./routes/homeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import monitoringRoutes from "./routes/monitoringRoutes.js";
import metricsMiddleware from "./middleware/metricsMiddleware.js";
import aiRoutes from "./routes/aiRoutes.js";
import path from "path";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);
app.use(homeRoutes);
app.use(userRoutes);
app.use(errorHandler);
app.use(metricsMiddleware);
app.use(monitoringRoutes);
app.use(aiRoutes);
app.use(

    express.static(

        path.join(process.cwd(), "src/public")

    )

);

app.get("/", (req, res) => {

    logger.info("Home API Called");

    res.json({

        success: true,

        message: "AI Observability Platform Running"

    });

});

app.listen(PORT, () => {

    logger.info(`Server Started On Port ${PORT}`);

});