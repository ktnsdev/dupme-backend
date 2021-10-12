//POST /create-room/?uuid=

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");

async function createRoom(req, res) {
    if (req.query.uuid === undefined || req.query.uuid === null || req.query.uuid === "") {
        logger.error("400 Bad request from the client");
        logger.error("UUID not found.");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    logger.info(`A user with UUID ${req.query.uuid} has requested to create a room.`);
    let receivedUserData = await receiveFromFirebase(req, "users", req.query.uuid);

    if (!receivedUserData.data) {
        logger.error("User not found.");
        return res
            .status(APIStatus.INTERNAL.UUID_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.UUID_NOT_FOUND);
    }

    //check UUID with database if it has ok if not return error
    let roomID;
    let receivedRoomData;

    do {
        roomID = makeID(4);
        logger.info("Generated roomID is " + roomID);
        receivedRoomData = await receiveFromFirebase(req, "rooms", roomID);
    } while (receivedRoomData.data);
    //this while use for check whether the id is already exist in the database

    let date = dayjs();

    //put inside database json{room_id: xxxx, host: xxxx, time_created: xxxx}
    let roomData = {
        room_id: roomID,
        host: req.query.uuid,
        players: [req.query.uuid],
        settings: { difficulty: 0, levels: 0, player_limit: 2, turns: 0 },
        status: "idle",
        time_created: date.toISOString(),
    };

    let error = await addToFirebase(req, "rooms", roomID, roomData);

    if (error) {
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
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

module.exports = { createRoom };
