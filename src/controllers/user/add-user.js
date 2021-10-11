const { logger } = require("../../configs/config");
const { v4 } = require("uuid");
const dayjs = require("dayjs");
const { addToFirebase } = require("../../firebase/firebase");
const APIStatus = require("../../configs/api-errors");

async function addUser(req, res) {
    if (
        req.query.username === undefined ||
        req.query.username === null ||
        req.query.username === ""
    ) {
        logger.error("400 Bad request from the client");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    let uuid = v4();

    let response = {
        logged_in: dayjs().toISOString(),
        status: "idle",
        username: req.query.username,
    };

    let error = await addToFirebase(req, "users", uuid, response);

    if (error) {
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    return res.status(APIStatus.OK.status).json({
        response: APIStatus.OK,
        data: {
            username: req.query.username,
            uuid: uuid,
            logged_in: response.logged_in,
        },
    });
}

module.exports = { addUser };
