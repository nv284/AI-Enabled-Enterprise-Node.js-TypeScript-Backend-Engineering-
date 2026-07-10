import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { AnyZodObject } from "zod/v3";

export const validate =
    (schema: AnyZodObject) =>
        (
            req: Request,
            res: Response,
            next: NextFunction
        ): void => {
            try {
                req.body = schema.parse(req.body);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    res.status(400).json({
                        success: false,
                        message: "Validation failed.",
                        errors: error.issues.map((issue) => ({
                            field: issue.path.join("."),
                            message: issue.message
                        }))
                    });

                    return;
                }

                next(error);
            }
        };