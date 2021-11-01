const { getName } = require("./test.js");
const { addUser } = require("./add-user.js");
const { checkStatus } = require("./check-status.js");
const { changeUsername } = require("./change-username.js");
const { removeUser } = require("./remove-user.js");
const { getAllPlayer } = require("./get-all-player.js");

function UserController() {
    return {
        getName,
        addUser,
        checkStatus,
        changeUsername,
        removeUser,
        getAllPlayer,
    };
}

module.exports = UserController;
