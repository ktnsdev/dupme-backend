// GET /user/:uuid/getName?name=dkasfjhdasklfh

const { logger } = require("../../configs/config");

function getName(req, res) {
    const io = req.app.get("socket");

    if (
        req.params.uuid === undefined ||
        req.params.uuid === null ||
        req.query.name === undefined ||
        req.query.name === null
    ) {
        logger.error("400 Bad request from the client");
        return res.status(400).json({ status: 400, message: "Bad Request" });
    }

    io.emit("message", "hello");

    return res.status(200).json({ name: req.query.name, uuid: req.params.uuid });
}

module.exports = { getName };
