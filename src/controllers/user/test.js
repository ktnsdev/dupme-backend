// GET /user/:uuid/getName?name=dkasfjhdasklfh

const { logger } = require("../../configs/config");
const { ref, onValue } = require("firebase/database");
const APIStatus = require("../../configs/api-errors");
const dayjs = require("dayjs");
const { v4 } = require("uuid");

const addToFirebaseMockData = {
    logged_in: dayjs().toISOString(),
    status: "idle",
    username: "test_user_to_add",
};

async function getName(req, res) {
    const io = req.app.get("socket");

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

    if (firebaseFunction === "recieve") {
        let recievedData = await testRecieveFromFirebase(req, req.params.uuid);

        if (!recievedData.data) {
            return res.status(APIStatus.INTERNAL.FIREBASE_PULL_FAILED.status).json({
                response: APIStatus.INTERNAL.FIREBASE_PULL_FAILED,
                error: recievedData.error,
            });
        }

        return res.status(APIStatus.OK.status).json({ data: recievedData.data });
    }

    if (firebaseFunction === "add") {
        let generatedUUID = v4();
        let error = await testAddToFirebase(req, generatedUUID);

        if (error) {
            return res
                .status(APIStatus.INTERNAL.FIREBASE_ADD_FAILED.status)
                .json({ response: APIStatus.INTERNAL.FIREBASE_ADD_FAILED, error: error.name });
        }

        return res
            .status(APIStatus.OK.status)
            .json({ status: APIStatus.OK.status, message: `Added ${generatedUUID}.` });
    }

    if (firebaseFunction === "remove") {
        let recievedDataBeforeRemoval = await testRecieveFromFirebase(req, req.params.uuid);

        if (!recievedDataBeforeRemoval.data) {
            return res
                .status(APIStatus.INTERNAL.FIREBASE_REMOVE_FAILED.DATA_NOT_AVAILABLE.status)
                .json(APIStatus.INTERNAL.FIREBASE_REMOVE_FAILED.DATA_NOT_AVAILABLE);
        }

        await testRemoveFromFirebase(req, req.params.uuid);

        let recievedData = await testRecieveFromFirebase(req, req.params.uuid);

        if (recievedData.data) {
            return res
                .status(APIStatus.INTERNAL.FIREBASE_REMOVE_FAILED.DATA_NOT_REMOVED.status)
                .json(APIStatus.INTERNAL.FIREBASE_REMOVE_FAILED.DATA_NOT_REMOVED);
        }

        return res
            .status(APIStatus.OK.status)
            .json({ status: APIStatus.OK.status, message: `Removed ${req.params.uuid}.` });
    }

    logger.error("400 Bad request from the client");
    return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
}

async function testRecieveFromFirebase(req, uuid) {
    const db = req.app.get("db");
    let data = undefined;

    await db.ref(`/users/${uuid}`).once(
        "value",
        function (snapshot) {
            data = snapshot.val();
        },
        (error) => {
            logger.error("Retrieving from Firebase failed: " + error.name);
            return { error: error };
        },
    );

    return { data: data };
}

async function testAddToFirebase(req, uuid) {
    const db = req.app.get("db");

    await db.ref(`/users/${uuid}`).set(addToFirebaseMockData, (error) => {
        logger.error("Adding data to Firebase failed: " + error.name);
        return error;
    });
}

async function testRemoveFromFirebase(req, uuid) {
    const db = req.app.get("db");

    await db.ref(`/users/${uuid}`).remove();
}

module.exports = { getName };
