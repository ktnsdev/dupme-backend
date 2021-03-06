require("dotenv").config();

const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

/**
 * @param {import("express").Application} app - Express Application from Express.js
 * @returns {{name: string, message: string} | undefined} error - Returns an error object if the function can't initialise a connection to Firebase. No return if there's no error.
 */
async function initialiseFirebase(app) {
    if (
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON === undefined ||
        process.env.FIREBASE_DATABASE_DOMAIN === undefined
    ) {
        return {
            name: "firebase-key-json-env-not-found",
            message:
                "The server cannot initialise connection to Firebase. Please check whether the environment file is structured correctly.",
        };
    }

    let key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

    await admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(key)),
        databaseURL: process.env.FIREBASE_DATABASE_DOMAIN,
    });

    let db = admin.database();

    app.set("db", db);
}

/**
 * @param {import("express").Request} req - Request from Express.js.
 * @param {'rooms'|'users'} primaryPath - Primary path to request from Firebase, can be "rooms" or "users" only.
 * @param {string} [secondaryPath=''] - Secondary path to request from Firebase, can be either room ID if primary path is "rooms" or UUID if primary path is "users". The default value is ''.
 * @param {string} [additionalPath=''] - Add additional path only if you want to read specific value from any users or rooms.
 * @returns {{data: Object | undefined, error: {name: string, message: string} | undefined} | undefined} Returns the data from Firebase without error object if available. If the data from Firebase is corrupted or the request can't be made, returns error object without data.
 */
async function receiveFromFirebase(req, primaryPath, secondaryPath, additionalPath) {
    if (req === undefined) {
        return {
            error: {
                error: "firebase-express-request-not-found",
                message: "req parameter passed is corrupted or undefined",
            },
        };
    }

    if (primaryPath !== "rooms" && primaryPath !== "users" && primaryPath !== "misc") {
        return {
            error: {
                name: "firebase-wrong-primary-path",
                message: 'Primary path can only be "rooms" or "users"',
            },
        };
    }

    if (secondaryPath === undefined || secondaryPath === null) {
        secondaryPath = "";
    }

    if (additionalPath === undefined || additionalPath === null) {
        additionalPath = "";
    }

    if (additionalPath.charAt(0) === "/") {
        additionalPath = additionalPath.substr(1);
    }

    const db = req.app.get("db");
    let data;

    await db.ref(`/${primaryPath}/${secondaryPath}/${additionalPath}`).once(
        "value",
        function (snapshot) {
            data = snapshot.val();
        },
        (error) => {
            logger.error("Receive from Firebase failed: " + error.name);
            return {
                error: { name: error, message: "Receive from Firebase failed: " + error.name },
            };
        },
    );

    if (!data) {
        return {
            error: {
                name: "firebase-path-not-found",
                message: `Firebase returned null for /${primaryPath}/${secondaryPath}/${additionalPath}`,
            },
        };
    }

    return { data: data };
}

/**
 * @param {import("express").Request} req - Request from Express.js.
 * @param {'rooms' | 'users'} primaryPath - Primary path to request from Firebase, can be "rooms" or "users" only.
 * @param {string} secondaryPath - Secondary path to request from Firebase, can be either room ID if primary path is "rooms" or UUID if primary path is "users".
 * @param {any} dataToAdd - Provide which data to be added to the database.
 * @param {string} [additionalPath=''] - Add additional path only if you want to set specific value to any users or rooms.
 * @returns {{name: string, message: string} | undefined} error - If the data from Firebase is corrupted or the request can't be made, returns error object. No return if there's no error.
 */
async function addToFirebase(req, primaryPath, secondaryPath, dataToAdd, additionalPath) {
    if (req === undefined) {
        return {
            error: "firebase-express-request-not-found",
            message: "req parameter passed is corrupted or undefined",
        };
    }

    if (primaryPath !== "rooms" && primaryPath !== "users" && primaryPath !== "misc") {
        return {
            name: "firebase-wrong-primary-path",
            message: 'Primary path can only be "rooms" or "users"',
        };
    }

    if (secondaryPath === undefined || secondaryPath === null) {
        secondaryPath = "";
    }

    if (additionalPath === undefined || additionalPath === null) {
        additionalPath = "";
    }

    if (additionalPath.charAt(0) === "/") {
        additionalPath = additionalPath.substr(1);
    }

    const db = req.app.get("db");

    await db.ref(`/${primaryPath}/${secondaryPath}/${additionalPath}`).set(dataToAdd, (error) => {
        if (error) {
            logger.error("Adding data to Firebase failed: " + error.name);
            return error;
        }
    });
}

/**
 * @param {import("express").Request} req - Request from Express.js.
 * @param {'rooms' | 'users'} primaryPath - Primary path to request from Firebase, can be "rooms" or "users" only.
 * @param {string} secondaryPath - Secondary path to request from Firebase, can be either room ID if primary path is "rooms" or UUID if primary path is "users".
 * @param {string} [additionalPath=''] - Add additional path only if you want to remove specific value from any users or rooms.
 * @returns {{name: string, message: string} | undefined} error - If the data from Firebase is corrupted or the request can't be made, returns error object. No return if there's no error.
 */
async function removeFromFirebase(req, primaryPath, secondaryPath, additionalPath) {
    if (req === undefined) {
        return {
            error: "firebase-express-request-not-found",
            message: "req parameter passed is corrupted or undefined",
        };
    }

    if (primaryPath !== "rooms" && primaryPath !== "users" && primaryPath !== "misc") {
        return {
            name: "firebase-wrong-primary-path",
            message: 'Primary path can only be "rooms" or "users"',
        };
    }

    if (secondaryPath === undefined || secondaryPath === null || secondaryPath === "") {
        return {
            name: "firebase-wrong-secondary-path",
            message: "Secondary path required to remove user from the database",
        };
    }

    if (additionalPath === undefined || additionalPath === null) {
        additionalPath = "";
    }

    if (additionalPath.charAt(0) === "/") {
        additionalPath = additionalPath.substr(1);
    }

    const db = req.app.get("db");
    let tempData = await receiveFromFirebase(req, primaryPath, secondaryPath, additionalPath);

    if (!tempData.data) {
        return {
            name: "firebase-path-not-found",
            message: `Firebase returned null for /${primaryPath}/${secondaryPath}/${additionalPath}, cannot remove the data`,
        };
    }

    await db.ref(`/${primaryPath}/${secondaryPath}/${additionalPath}`).remove();

    tempData = await receiveFromFirebase(req, primaryPath, secondaryPath, additionalPath);

    if (tempData.data) {
        return {
            error: {
                name: "firebase-data-not-removed",
                message: "Data is not removed from the database",
            },
        };
    }
}

module.exports = { initialiseFirebase, receiveFromFirebase, addToFirebase, removeFromFirebase };
