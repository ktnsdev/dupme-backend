//POST /create-room/?uuid=&difficulty=&turns=

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");
const APIStatus = require("../../configs/api-errors");
const { receiveFromFirebase, addToFirebase } = require("../../firebase/firebase");

async function createRoom(req, res) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);
    if (
        req.query.uuid === undefined ||
        req.query.uuid === null ||
        req.query.uuid === "" ||
        req.query.difficulty === undefined ||
        req.query.difficulty === null ||
        req.query.difficulty === "" ||
        (req.query.difficulty !== "0" && req.query.difficulty !== "1") ||
        req.query.turns === undefined ||
        req.query.turns === null ||
        req.query.turns === "" ||
        isNaN(req.query.turns)
    ) {
        logger.error(APIStatus.BAD_REQUEST.message);
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    logger.info(`A user with UUID ${req.query.uuid} has requested to create a room.`);
    let receivedUserData = await receiveFromFirebase(req, "users", req.query.uuid);
    if (receivedUserData.error) {
        logger.error(APIStatus.INTERNAL.FIREBASE_ERROR.message);
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: receivedUserData.error });
    }
    if (!receivedUserData.data) {
        logger.error("User not found.");
        return res
            .status(APIStatus.INTERNAL.UUID_NOT_FOUND.status)
            .json(APIStatus.INTERNAL.UUID_NOT_FOUND);
    }
    if (receivedUserData.data.status !== "idle") {
        logger.error(APIStatus.INTERNAL.PLAYER_NOT_IDLE.message);
        return res
            .status(APIStatus.INTERNAL.PLAYER_NOT_IDLE.status)
            .json(APIStatus.INTERNAL.PLAYER_NOT_IDLE);
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
        settings: {
            difficulty: parseInt(req.query.difficulty),
            levels: 0,
            player_limit: 2,
            turns: parseInt(req.query.turns),
        },
        status: "idle",
        time_created: date.toISOString(),
    };

    let error = await addToFirebase(req, "rooms", roomID, roomData);

    if (error) {
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }
    error = await addToFirebase(req, "users", req.query.uuid, "in-room-as-host", "status");
    if (error) {
        logger.error(
            `At adding to Firebase. ${APIStatus.INTERNAL.FIREBASE_ERROR.message}: ${dataFromFirebase.error.message}`,
        );
        return res
            .status(APIStatus.INTERNAL.FIREBASE_ERROR.status)
            .json({ response: APIStatus.INTERNAL.FIREBASE_ERROR, error: error });
    }

    logger.info(`Room ${roomID} create successfully.`);
    return res.status(APIStatus.OK.status).json(roomData);
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
