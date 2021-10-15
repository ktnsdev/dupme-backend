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
            status: 500,
            message: "Username has been used",
        },
        UUID_NOT_FOUND: {
            status: 500,
            message: "Can't find online player with that UUID",
        },
        ROOM_NOT_IDLE: {
            status: 500, 
            message: "Can't perform the request because the room is not idle."
        },
        ROOM_NOT_IN_GAME: {
            status: 500,
            message: "Can't end the game because the game has not been started yet."
        },
        ROOM_IS_FULL: {
            status: 500,
            message: "Can't perform the request because the room is full."
        },
        USER_DATA_CORRUPTED: {
            status: 500,
            message: "User data is corrupted.",
        },
        ROOM_NOT_FOUND: {
            status: 500,
            message: "Can't find room with that ID",
        },
        PLAYER_NOT_IN_ROOM: {
            status: 500,
            message: "The player with that UUID is not in the room",
        },
        PLAYER_NOT_HOST: {
            status: 500,
            message: "The player who is not the host cannot make this request",
        },
        FIREBASE_ERROR: {
            status: 500,
            message: "Firebase request error",
        },
    },
};

module.exports = APIStatus;
