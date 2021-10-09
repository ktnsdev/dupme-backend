const APIStatus = {
    OK: {
        status: 200,
        message: "OK",
    },
    BAD_REQUEST: {
        status: 400,
        message: "Bad Request",
    },
    INTERNAL: {
        SERVER_ERROR: {
            status: 500,
            message: "Unspecified Internal Server Error",
        },
        USERNAME_USED: {
            status: 550,
            message: "Username has been used",
        },
        UUID_NOT_FOUND: {
            status: 551,
            message: "Can't find online player with that UUID",
        },
        ROOM_NOT_FOUND: {
            status: 552,
            message: "Can't find room with that ID",
        },
        PLAYER_NOT_IN_ROOM: {
            status: 553,
            message: "The player with that UUID is not in the room",
        },
        PLAYER_NOT_HOST: {
            status: 554,
            message: "The player who is not the host cannot make this request",
        },
        FIREBASE_PULL_FAILED: {
            status: 560,
            message: "Unable to retrieve data from the database",
        },
    },
};

module.exports = APIStatus;
