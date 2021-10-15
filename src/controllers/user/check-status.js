const { logger } = require("../../configs/config");
const { addToFirebase, receiveFromFirebase } = require("../../firebase/firebase");
const APIStatus = require("../../configs/api-errors");

async function checkStatus(req, res) {
    let data = receiveFromFirebase();
}

module.exports = { checkStatus };
