const { getName } = require("./test.js");
const { addUser } = require("./add-user.js");

function UserController() {
    return {
        getName,
        addUser
    };
}

module.exports = UserController;
