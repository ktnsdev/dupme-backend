const { getName } = require("./test.js");
const { addUser } = require("./add-user.js");
const { removeUser } = require("./remove-user.js");

function UserController() {
    return {
        getName,
        addUser,
        removeUser,
    };
}

module.exports = UserController;
