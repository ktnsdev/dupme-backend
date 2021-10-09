const { logger } = require("../../configs/config");

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
