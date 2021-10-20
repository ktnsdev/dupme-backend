const { getApp } = require("@firebase/app");
const { getAuth, signInWithEmailAndPassword, signOut } = require("firebase/auth");
const { logger } = require("../configs/config");
const admin = require("firebase-admin");

/**
 *
 * @param {import("express").Request} - Express Request
 * @param {string} email - Authentication Email
 * @param {string} uid - Authentication UID
 * @returns {{error: {code: string, message: string}} | undefined} - Returns error if the authentication process has failed.
 */
async function emailPasswordAuthentication(email, uid) {
    if (
        email === undefined ||
        email === null ||
        email === "" ||
        uid === undefined ||
        uid === null ||
        uid === ""
    ) {
        return { error: { code: "bad-props-structure", message: "Bad props structure" } };
    }

    let err = undefined;

    const auth = await admin.auth();

    await auth
        .getUserByEmail(email)
        .then((userRecord) => {
            if (userRecord.uid === uid) err = undefined;
            else
                err = {
                    error: { code: "unauthorized", message: "Username and UID do not match" },
                };
        })
        .catch((error) => {
            err = { error: { code: error.code, message: error.message } };
        });

    if (err) {
        logger.error(`Authorisation Error: ${err.error.code} - ${err.error.message}`);
    }

    return err;
}

/**
 *
 * @param {string} sub - From ```payload.sub```
 * @returns {boolean} authorized - If ```payload.sub``` is authorized with Firebase, return ```true```.
 */
async function jwtAuthentication(sub) {
    if (sub === undefined || sub === null || sub === "") {
        return false;
    }

    let err = undefined;

    const auth = await admin.auth();

    await auth
        .getUserByEmail(sub)
        .then((userRecord) => {
            if (userRecord.email === sub) err = undefined;
            else
                err = {
                    error: { code: "unauthorized", message: "Username from the token doesn't match." },
                };
        })
        .catch((error) => {
            err = { error: { code: error.code, message: error.message } };
        });

    if (err) {
        logger.error(`Authorisation Error: ${err.error.code} - ${err.error.message}`);
        return false;
    }

    return true;
}

module.exports = { emailPasswordAuthentication, jwtAuthentication };
