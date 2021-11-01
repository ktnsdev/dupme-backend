// GET /user/:uuid/getName?name=dkasfjhdasklfh

const { logger } = require("../../configs/config");
const { ref, onValue } = require("firebase/database");
const APIStatus = require("../../configs/api-errors");
const dayjs = require("dayjs");
const { v4 } = require("uuid");
const {
    receiveFromFirebase,
    addToFirebase,
    removeFromFirebase,
} = require("../../firebase/firebase");

const addToFirebaseMockData = {
    logged_in: dayjs().toISOString(),
    status: "idle",
    username: "test_user_to_add",
};

async function getName(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);
    const io = req.app.get("socket");

    logger.info(`${req.method} ${req.baseUrl + req.path}`);

    if (
        req.params.uuid === undefined ||
        req.params.uuid === null ||
        req.query.name === undefined ||
        req.query.name === null ||
        req.query.name === "" ||
        req.query.uuid === "" ||
        req.query.function === "" ||
        req.query.function === undefined ||
        req.query.function === null
    ) {
        logger.error("400 Bad request from the client");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    let firebaseFunction = req.query.function;

    io.emit("message", "hello");

    if (firebaseFunction === "receive") {
        let receivedData = await receiveFromFirebase(req, "users", req.params.uuid);

        if (receivedData.error) {
            return res.status(APIStatus.INTERNAL.FIREBASE_ERROR.status).json({
                response: APIStatus.INTERNAL.FIREBASE_ERROR,
                error: receivedData.error,
            });
        }

        return res.status(APIStatus.OK.status).json({ data: receivedData.data });
    }

    if (firebaseFunction === "add") {
        let generatedUUID = v4();
        let error = await addToFirebase(req, "users", generatedUUID, addToFirebaseMockData);

        if (error) {
            return res
                .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
                .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
        }

        return res
            .status(APIStatus.OK.status)
            .json({ status: APIStatus.OK.status, message: `Added ${generatedUUID}.` });
    }

    if (firebaseFunction === "remove") {
        let error = await removeFromFirebase(req, "users", req.params.uuid);

        if (error) {
            return res.status(APIStatus.INTERNAL.FIREBASE_ERROR.status).json({
                response: APIStatus.INTERNAL.FIREBASE_ERROR,
                error: error,
            });
        }

        return res
            .status(APIStatus.OK.status)
            .json({ status: APIStatus.OK.status, message: `Removed ${req.params.uuid}.` });
    }
}

module.exports = { getName };
