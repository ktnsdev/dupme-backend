// GET /user/:uuid/getName?name=dkasfjhdasklfh

const { logger } = require("../../configs/config");
const { ref, onValue } = require("firebase/database");
const APIStatus = require("../../configs/api-errors");

async function getName(req, res) {
    const io = req.app.get("socket");
    const db = req.app.get("db");
    var firebaseTest = undefined;

    if (
        req.params.uuid === undefined ||
        req.params.uuid === null ||
        req.query.name === undefined ||
        req.query.name === null ||
        req.query.name === "" ||
        req.query.uuid === ""
    ) {
        logger.error("400 Bad request from the client");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    io.emit("message", "hello");

    await db.ref("/users/def45c9a-f810-4452-9264-1ec9eeb7d679").once(
        "value",
        function (snapshot) {
            firebaseTest = snapshot.val();
        },
        (error) => {
            logger.error("Retrieving from Firebase failed: " + error.name);
            return res
                .status(APIStatus.INTERNAL.FIREBASE_PULL_FAILED.status)
                .json({ response: APIStatus.INTERNAL.FIREBASE_PULL_FAILED, error: error.name });
        },
    );

    logger.info("Firebase pull completed");
    logger.info(firebaseTest);

    return res.status(APIStatus.OK.status).json({ name: req.query.name, uuid: req.params.uuid });
}

module.exports = { getName };
