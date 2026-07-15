"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_js_1 = __importDefault(require("./utils/logger.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.get("/", (req, res) => {
    logger_js_1.default.info("Home API Called");
    res.json({
        success: true,
        message: "AI Observability Platform Running"
    });
});
app.listen(PORT, () => {
    logger_js_1.default.info(`Server Started On Port ${PORT}`);
});
//# sourceMappingURL=server.js.map