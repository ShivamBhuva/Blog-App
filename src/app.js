const express = require("express");
require("./db/mongoose");

const routerUSer = require("./routers/user");
const routeTask = require("./routers/task");

const app = express();

app.use(express.json());
app.use(routerUSer);
app.use(routeTask);

module.exports = app;
