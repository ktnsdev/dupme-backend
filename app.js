const express = require("express");
const app = express();

require("dotenv").config();

const Route = require("./src/routes/routes.js");
const Router = Route(app);
Router.setup();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Starting server on port " + PORT);
});
