import logger from "../utils/logger.js";

export default class UserService {

    static async getUsers() {

        logger.info("Reading Users");

        return [

            {

                id: 1,

                name: "Nishi"

            },

            {

                id: 2,

                name: "John"

            }

        ];

    }

}