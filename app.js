const express = require("express");
const app = express();

app.get("/check-alive", (req, res) => {
    res.send("Hi! The server is alive!");
});

app.listen(3000, () => {
    console.log("Starting server on port :3000...");
});
