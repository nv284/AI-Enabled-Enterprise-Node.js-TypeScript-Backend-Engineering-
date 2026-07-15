import { Router } from "express";

import UserController

    from "../controller/userController.js";

const router = Router();

router.get(

    "/users",

    UserController.getUsers

);

export default router;