const { logger } = require("../../configs/config");

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
    makeUUID(0);
    //login date time?
    return res.status(200).json(response);
}

function makeUUID(length) {
    var results = "";
    var numnum = "0123456789";
    var numnumLength = numnum.length;
    for (var i = 0; i < length; i++) {
        results += numnum.charAt(Math.floor(Math.random() * numnumLength));
    }

    return results;
}

function compareName(username) {
    var username;

    if (req.query.name === username) return null;
    else return username;
}

function showLogin() {
    var status;
    if (status == 200) return status;
    else return null;
}

const user = {
    uuid: user.makeUUID(5),
    username: user.getName,
    time_logged_in: now.getHours() + "-" + now.getMinutes(),
};

module.exports = { addUser };
