const { logger } = require("../../configs/config");
const { addToFirebase, receiveFromFirebase } = require("../../firebase/firebase");
const APIStatus = require("../../configs/api-errors");
const dayjs = require("dayjs");

async function getAllPlayer(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);
    let data = await receiveFromFirebase(req, "users");

    if (data.error) {
        logger.error(
            `At reading from Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${data.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: data.error });
    }

    if (!data.data) {
        logger.error(APIStatus.INTERNAL.FIREBASE_ERROR.message);
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json(APIStatus.INTERNAL.FIREBASE_ERROR);
    }
    
    return res.status(APIStatus.OK.status).json(data.data);
}
module.exports = { getAllPlayer };
