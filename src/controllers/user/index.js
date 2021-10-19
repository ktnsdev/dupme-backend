const { getName } = require("./test.js");
const { addUser } = require("./add-user.js");
const { checkStatus } = require("./check-status.js");
const { changeUsername } = require("./change-username.js");
const { removeUser } = require("./remove-user.js");

function UserController() {
    return {
        getName,
        addUser,
        checkStatus,
        changeUsername,
        removeUser,
    };
}

module.exports = UserController;
