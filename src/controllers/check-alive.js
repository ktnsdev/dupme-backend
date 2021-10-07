const { logger } = require("../configs/config");

function checkAlive(req, res) {
    return res.send("Hi, the server is alive.");
}

module.exports = { checkAlive };
