require("dotenv").config();
const APIStatus = require("../configs/api-errors");
const { logger } = require("../configs/config");
const { emailPasswordAuthentication, jwtAuthentication } = require("./auth");

const extractJWT = require("passport-jwt").ExtractJwt;
const JWTStrategy = require("passport-jwt").Strategy;
const passport = require("passport");
const dayjs = require("dayjs");

const jwtOptions = {
    jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

const jwtAuth = new JWTStrategy(jwtOptions, (payload, done) => {
    if (jwtAuthentication(payload.sub) && dayjs().diff(dayjs(payload.exp)) < 0) {
        done(null, true);
    } else {
        logger.error(APIStatus.UNAUTHORIZED.message);
        done(null, false);
    }
});

passport.use(jwtAuth);
const middleware = passport.authenticate("jwt", { session: false });

async function loginMiddleware(req, res, next) {
    logger.info(`${req.method} ${req.baseUrl + req.path}`);

    if (
        req.body.username === undefined ||
        req.body.username === null ||
        req.body.username === "" ||
        req.body.uid === undefined ||
        req.body.uid === null ||
        req.body.uid === ""
    ) {
        logger.error(APIStatus.BAD_REQUEST.message);
        return res.status(APIStatus.BAD_REQUEST.status).json(APIStatus.BAD_REQUEST);
    }

    let error = await emailPasswordAuthentication(req.body.username, req.body.uid);

    if (error) {
        logger.error(APIStatus.UNAUTHORIZED_USERNAME_PASSWORD_INCORRECT.message);
        return res
            .status(APIStatus.UNAUTHORIZED_USERNAME_PASSWORD_INCORRECT.status)
            .json({ response: APIStatus.UNAUTHORIZED_USERNAME_PASSWORD_INCORRECT, error: error });
    }

    logger.info(`${req.body.username} is authorised.`);
    next();
}

module.exports = { loginMiddleware, middleware };
