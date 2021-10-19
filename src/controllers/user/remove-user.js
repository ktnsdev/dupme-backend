const { logger } = require("../../configs/config");
const { v4 } = require("uuid");
const { removeFromFirebase } = require("../../firebase/firebase");
const APIStatus = require("../../configs/api-errors");

async function removeUser(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);
    if (req.params.uuid === undefined || req.params.uuid === null || req.params.uuid === "") {
        logger.error(APIStatus.BAD_REQUEST.message);
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    let error = await removeFromFirebase(req, "users", req.params.uuid);

    if (error) {
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    return res.status(APIStatus.OK.status).json(APIStatus.OK);
}

module.exports = { removeUser };
