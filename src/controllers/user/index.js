const { getName } = require("./test.js");

function UserController() {
    return {
        getName,
    };
}

module.exports = UserController;
