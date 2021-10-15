const { getName } = require("./test.js");
const { addUser } = require("./add-user.js");
const { checkStatus } = require("./check-status.js");

function UserController() {
    return {
        getName,
        addUser,
        checkStatus,
    };
}

module.exports = UserController;
