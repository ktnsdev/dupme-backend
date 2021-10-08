require("dotenv").config();

const fs = require("fs");
const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

function initialiseFirebase(app) {
    if (
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH === undefined ||
        process.env.FIREBASE_DATABASE_DOMAIN === undefined
    ) {
        return {
            error: "firebase-env-not-found",
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

    return undefined;
}

module.exports = { initialiseFirebase };
