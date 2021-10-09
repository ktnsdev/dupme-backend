const { logger } = require("../../configs/config");
const { v4 } = require("uuid");

function addUser(req, res) {
    if (
        req.query.username === undefined ||
        req.query.username === null ||
        req.query.username === ""
    ) {
        // bad request
    }

    let username = req.query.username;
    let response = {};

    compareName(username);
    logger.info(makeUUID());
    //login date time?
    return res.status(200).json(response);
}

function makeUUID() {
    return v4();
}

function compareName(username) {
    // var username;
    // if (req.query.name === username) return null;
    // else return username;
}

function showLogin() {
    var status;
    if (status == 200) return status;
    else return null;
}

// const user = {
//     uuid: user.makeUUID(5),
//     username: user.getName,
//     time_logged_in: now.getHours() + "-" + now.getMinutes(),
// };

module.exports = { addUser };
