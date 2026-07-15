import {

    httpRequestCounter,

    activeRequests,

    responseTimeHistogram

}

    from "../config/metrics.js";

import {

    Request,

    Response,

    NextFunction

}

    from "express";

export default function (

    req: Request,

    res: Response,

    next: NextFunction

) {

    httpRequestCounter.inc();

    activeRequests.inc();

    const start = Date.now();

    res.on("finish", () => {

        const duration = Date.now() - start;

        responseTimeHistogram.observe(duration);

        activeRequests.dec();

    });

    next();

}