import { Request, Response } from "express";

import { components } from "../types/api";

type CreateBookDto =
components["schemas"]["CreateBookRequest"];

export class BookController {

    create(req: Request, res: Response) {

        const body = req.body as CreateBookDto;

        res.status(201).json(body);

    }

}