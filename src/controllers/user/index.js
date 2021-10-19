const { getName } = require("./test.js");
const { addUser } = require("./add-user.js");
const { checkStatus } = require("./check-status.js");
const { changeUsername } = require("./change-username.js");

function UserController() {
    return {
        getName,
        addUser,
        checkStatus,
        changeUsername
    };
}

module.exports = UserController;
