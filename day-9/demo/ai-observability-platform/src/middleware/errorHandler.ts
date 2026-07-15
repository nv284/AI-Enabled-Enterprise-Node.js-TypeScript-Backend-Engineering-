import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

export default function (

    err: any,

    req: Request,

    res: Response,

    next: NextFunction

) {

    logger.error({

        message: err.message,

        stack: err.stack

    });

    res.status(500).json({

        success: false,

        message: "Internal Server Error"

    });

}