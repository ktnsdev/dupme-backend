const app = require("express")();

const { logger, PORT } = require("./src/configs/config.js");
const Router = require("./src/routes/routes.js");

Router(app).setup();

app.listen(PORT, () => {
    logger.info(`Starting server on port ${PORT}...`);
});
