const express = require("express");
const app = express();



const Route = require("./src/routes/routes.js");
const Router = Route(app);
Router.setup();

app.listen(3000, () => {
    console.log("Starting server on port :3000...");
});
