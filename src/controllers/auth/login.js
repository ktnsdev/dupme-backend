require("dotenv").config();

const dayjs = require("dayjs");
const APIStatus = require("../../configs/api-errors");
const { logger } = require("../../configs/config");
const jwt = require("jsonwebtoken");

function login(req, res) {
    if (req.body.username === undefined || req.body.username === null || req.body.username === "") {
        logger.error(APIStatus.BAD_REQUEST.message);
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    const payload = {
        sub: req.body.username,
        iat: dayjs().valueOf(),
        exp: dayjs().add(1, "hour").valueOf(),
    };

    return res
        .status(APIStatus.OK.status)
        .json({ token: jwt.sign(payload, process.env.JWT_SECRET) });
}

module.exports = { login };
