//POST /create-room/?uuid=

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");

async function createRoom(req, res) {
    if (req.query.uuid === undefined || req.query.uuid === null || req.query.uuid === "") {
        logger.error("400 Bad request from the client");
        logger.error("UUID not found.");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }
    logger.info(req.query.uuid);
    let recievedUserData = await testRecieveUserFromFirebase(req, req.query.uuid);
    logger.info(recievedUserData.data);
    if (!recievedUserData.data) {
        logger.error("User not found.");
        return res
            .status(APIStatus.INTERNAL.UUID_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.UUID_NOT_FOUND);
    }
    //check UUID with database if it has ok if not return error
    let roomID;
    let recievedRoomData;
    do {
        roomID = makeID(4);
        logger.info("Generated roomID is " + roomID);
        recievedRoomData = await testRecieveRoomFromFirebase(req, req.params.uuid);
    } while (recievedRoomData.data);
    //this while use for check whether the id is already exist in the database
    let date = dayjs();
    //put inside database json{room_id: xxxx, host: xxxx, time_created: xxxx}
    let roomData = {
        room_id: roomID,
        host: req.query.uuid,
        players: { 0: req.query.uuid },
        settings: { difficulty: 0, levels: 0, player_limit: 2, turns: 0 },
        time_created: date.toISOString(),
    };
    let error = await testAddRoomToFirebase(req, roomID, roomData);

    if (error) {
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ADD_FAILED.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ADD_FAILED, error: error.name });
    }
    return res.status(APIStatus.OK.status).json({
        status: APIStatus.OK.status,
        message: "Room created successfully",
        room: roomData,
    });
}

function makeID(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

async function testRecieveUserFromFirebase(req, uuid) {
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

async function testRecieveRoomFromFirebase(req, roomID) {
    const db = req.app.get("db");
    let data = undefined;

    await db.ref(`/rooms/${roomID}`).once(
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

async function testAddRoomToFirebase(req, roomID, roomData) {
    const db = req.app.get("db");
    await db.ref(`/rooms/${roomID}`).set(roomData, (error) => {
        if (error) {
            logger.error("Adding data to Firebase failed: " + error.name);
            return error;
        }
    });
}
module.exports = { createRoom };
