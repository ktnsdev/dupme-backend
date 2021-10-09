//POST /create-room/?uuid=

const dayjs = require("dayjs");
const { logger } = require("../../configs/config");

function createRoom(req, res) {
    if (req.query.uuid === undefined || req.query.uuid === null || req.query.uuid === "") {
        logger.error("400 Bad request from the client");
        logger.error("UUID not found.");
        return res.status(400).json({ status: 400, message: "Bad Request" });
    }
    if (req.query.uuid === "") {
        logger.error("User not found.");
        return res.status(400).json({ status: 400, message: "Bad Request" });
    }
    //check UUID with database if it has ok if not return error
    let roomID;

    do {
        roomID = makeID(4);
        logger.info("Generated roomID is " + roomID);
    } while (roomID === "");
    //this while use for check whether the id is already exist in the database
    let date = new dayjs();
    //put inside database json{room_id: xxxx, host: xxxx, time_created: xxxx}

    return res.status(200).json({
        status: 200,
        message: "Room created successfully",
        room: { room_id: roomID, host: req.query.uuid, time_created: date.format() },
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
