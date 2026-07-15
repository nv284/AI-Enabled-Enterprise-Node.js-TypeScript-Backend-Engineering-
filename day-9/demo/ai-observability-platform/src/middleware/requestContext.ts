import { Request, Response, NextFunction } from "express";

import { v4 as uuid } from "uuid";

import asyncLocalStorage from "../utils/context.js";

export default function (

    req: Request,

    res: Response,

    next: NextFunction

) {

    const requestId = uuid();

    const correlationId =

        req.headers["x-correlation-id"]?.toString()

        ||

        uuid();

    asyncLocalStorage.run(

        {

            requestId,

            correlationId

        },

        () => {

            next();

        }

    );

}