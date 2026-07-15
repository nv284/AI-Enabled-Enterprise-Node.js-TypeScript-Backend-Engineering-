import { Request, Response } from "express";

import UserService from "../services/userService.js";

import logger from "../utils/logger.js";

export default class UserController {

    static async getUsers(

        req: Request,

        res: Response

    ) {

        logger.info("Controller Started");

        const users =

            await UserService.getUsers();

        logger.info("Returning Response");

        res.json(users);

    }

}