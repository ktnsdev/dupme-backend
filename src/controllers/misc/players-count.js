const APIStatus = require("../../configs/api-errors");
const { logger } = require("../../configs/config");
const { receiveFromFirebase } = require("../../firebase/firebase");

async function playersCount(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);

    let data = await receiveFromFirebase(req, "misc", "players_count");

    if (data.error) {
        logger.error(
            `At reading from Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${data.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: data.error });
    }

    console.log(data)

    if (!data.data) {
        logger.error(APIStatus.INTERNAL.SERVER_ERROR.message);
        return res
            .status(APIStatus.INTERNAL.SERVER_ERROR.status)
            .json(APIStatus.INTERNAL.SERVER_ERROR);
    }

    return res.status(APIStatus.OK.status).json({ players_count: data.data });
}

module.exports = { playersCount };
