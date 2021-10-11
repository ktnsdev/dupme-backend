require("dotenv").config();

const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

/**
 * @param {import("express")} app - Express App from Express.js, type Express
 * @returns {Object | undefined} error - Returns function can't initialise a connection to Firebase.
 * @returns {string} error.name - Returns error name.
 * @returns {string} error.message - Returns error message.
 */
function initialiseFirebase(app) {
    if (
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH === undefined ||
        process.env.FIREBASE_DATABASE_DOMAIN === undefined
    ) {
        return {
            name: "firebase-env-not-found",
            message:
                "The server cannot initialise connection to Firebase. Please check whether the environment file is structured correctly.",
        };
    }

    var serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_DOMAIN,
    });

    var db = admin.database();

    app.set("db", db);
}

/**
 * @param {import("express").Request} req - Request from Express.js.
 * @param {string} primaryPath - Primary path to request from Firebase, can be "rooms" or "users" only.
 * @param {string | undefined} secondaryPath - (optional) Secondary path to request from Firebase, can be either room ID if primary path is "rooms" or UUID if primary path is "users".
 * @returns {Object | undefined} data - If the data from Firebase is available, returns data as Object.
 * @returns {Object | undefined} error - If the data from Firebase is corrupted or the request can't be made, returns error object.
 * @returns {string} error.name - Returns error name.
 * @returns {string} error.message - Returns error message.
 */
async function receiveFromFirebase(req, primaryPath, secondaryPath) {
    if (primaryPath !== "rooms" && primaryPath !== "users") {
        return {
            error: {
                name: "wrong-primary-path",
                message: 'Primary path can only be "rooms" or "users"',
            },
        };
    }

    if (secondaryPath === undefined || secondaryPath === null) {
        secondaryPath = "";
    }

    const db = req.app.get("db");
    let data;

    await db.ref(`/${primaryPath}/${secondaryPath}`).once(
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
                name: "path-not-found",
                message: `Firebase returned null for /${primaryPath}/${secondaryPath}`,
            },
        };
    }

    return { data: data };
}

/**
 * @param {import("express").Request} req - Request from Express.js.
 * @param {string} primaryPath - Primary path to request from Firebase, can be "rooms" or "users" only.
 * @param {string} secondaryPath - Secondary path to request from Firebase, can be either room ID if primary path is "rooms" or UUID if primary path is "users".
 * @param {any} dataToAdd - Provide which data to be added to the database.
 * @returns {Object | undefined} error - If the data from Firebase is corrupted or the request can't be made, returns error object.
 * @returns {string} error.name - Returns error name.
 * @returns {string} error.message - Returns error message.
 */
async function addToFirebase(req, primaryPath, secondaryPath, dataToAdd) {
    if (primaryPath !== "rooms" && primaryPath !== "users") {
        return {
            name: "wrong-primary-path",
            message: 'Primary path can only be "rooms" or "users"',
        };
    }

    if (secondaryPath === undefined || secondaryPath === null || secondaryPath === "") {
        return {
            name: "wrong-secondary-path",
            message: "Secondary path required to add user to the database",
        };
    }

    const db = req.app.get("db");

    await db.ref(`/${primaryPath}/${secondaryPath}`).set(dataToAdd, (error) => {
        if (error) {
            logger.error("Adding data to Firebase failed: " + error.name);
            return error;
        }
    });
}

/**
 * @param {import("express").Request} req - Request from Express.js.
 * @param {string} primaryPath - Primary path to request from Firebase, can be "rooms" or "users" only.
 * @param {string} secondaryPath - Secondary path to request from Firebase, can be either room ID if primary path is "rooms" or UUID if primary path is "users".
 * @returns {Object | undefined} error - If the data from Firebase is corrupted or the request can't be made, returns error object.
 * @returns {string} error.name - Returns error name.
 * @returns {string} error.message - Returns error message.
 */
async function removeFromFirebase(req, primaryPath, secondaryPath) {
    if (primaryPath !== "rooms" && primaryPath !== "users") {
        return {
            name: "wrong-primary-path",
            message: 'Primary path can only be "rooms" or "users"',
        };
    }

    if (secondaryPath === undefined || secondaryPath === null || secondaryPath === "") {
        return {
            name: "wrong-secondary-path",
            message: "Secondary path required to remove user from the database",
        };
    }

    const db = req.app.get("db");
    let tempData = await receiveFromFirebase(req, primaryPath, secondaryPath);

    if (!tempData.data) {
        return {
            name: "path-not-found",
            message: `Firebase returned null for /${primaryPath}/${secondaryPath}, cannot remove the data`,
        };
    }

    await db.ref(`/${primaryPath}/${secondaryPath}`).remove();

    tempData = await receiveFromFirebase(req, primaryPath, secondaryPath);

    if (tempData.data) {
        return {
            error: {
                name: "data-not-removed",
                message: "Data is not removed from the database",
            },
        };
    }
}

module.exports = { initialiseFirebase, receiveFromFirebase, addToFirebase, removeFromFirebase };
