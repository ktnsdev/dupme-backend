const { logger } = require("../../configs/config");
const { v4 } = require("uuid");
const dayjs = require("dayjs");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");
const APIStatus = require("../../configs/api-errors");

async function addUser(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);

    if (
        req.query.username === undefined ||
        req.query.username === null ||
        req.query.username === ""
    ) {
        logger.error(APIStatus.BAD_REQUEST.message);
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
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    let data = await receiveFromFirebase(req, "misc", "players_count");

    if (data.error) {
        logger.error(
            `At reading from Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${data.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: data.error });
    }

    if (!data.data) {
        logger.error(APIStatus.INTERNAL.SERVER_ERROR.message);
        return res
            .status(APIStatus.INTERNAL.SERVER_ERROR.status)
            .json(APIStatus.INTERNAL.SERVER_ERROR);
    }

    let newPlayersCount = data.data + 1;
    error = await addToFirebase(req, "misc", "players_count", newPlayersCount);

    if (error) {
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    return res.status(APIStatus.OK.status).json({
        username: req.query.username,
        uuid: uuid,
        logged_in: response.logged_in,
    });
}

module.exports = { addUser };
