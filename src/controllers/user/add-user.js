const { logger } = require("../../configs/config");
const { v4 } = require("uuid");

function addUser(req, res) {
    if (
        req.query.username === undefined ||
        req.query.username === null ||
        req.query.username === ""
    ) {
        logger.error("400 Bad request from the client");
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    let username = req.query.username;
    let response = {};

    compareName(username);

    logger.info(makeUUID());

    return res.status(200).json(response);
}

function makeUUID() {
    return v4();
}

function showLogin() {
    var status;
    if (status == 200) return status;
    else return null;

    var time = new Date();
    var hour = time.getHours();
    var min = time.getMinutes();
    var sec = time.getSeconds();

    timetime = hour + ":" + min + ":" + sec;
    return timetime;
}

const user = {
    uuid: user.makeUUID(),
    username: user.getName(),
    time_logged_in: timetime,
};

module.exports = { addUser };
