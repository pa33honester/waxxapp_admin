//import mongoose
const mongoose = require("mongoose");

//import express
const express = require("express");
const app = express();

//import cors
const cors = require("cors");
app.use(cors());
app.use(express.json());

//logging middleware
var logger = require("morgan");
app.use(logger("dev"));

//import path
const path = require("path");

//fs
const fs = require("fs");

//Config
const config = require("./config");

//import model
const Setting = require("./server/setting/setting.model");

//settingJson
const settingJson = require("./setting");

//Declare global variable
global.settingJSON = {};

//handle global.settingJSON when pm2 restart
async function initializeSettings() {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (setting) {
      console.log("In setting initialize Settings");
      global.settingJSON = setting;
    } else {
      global.settingJSON = settingJson;
    }
  } catch (error) {
    console.error("Failed to initialize settings:", error);
  }
}

module.exports = initializeSettings();

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  const settingJSON = JSON.stringify(settingData, null, 2);
  fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");

  global.settingJSON = settingData; // Update global variable
  console.log("Settings file updated.", global.settingJSON.privacyPolicyText);
};

app.use(express.static(path.join(__dirname, "public")));
app.use("/storage", express.static(path.join(__dirname, "storage")));

// Android App Links + iOS Universal Links verification files. They MUST be
// served before the SPA catch-all and with application/json content-type.
// Apple's file is served WITHOUT an extension; iOS rejects it otherwise.
app.get("/.well-known/assetlinks.json", (req, res) => {
  res.type("application/json");
  res.sendFile(path.join(__dirname, "well-known", "assetlinks.json"));
});
app.get("/.well-known/apple-app-site-association", (req, res) => {
  res.type("application/json");
  res.sendFile(path.join(__dirname, "well-known", "apple-app-site-association"));
});

//route.js
const Route = require("./route");
app.use("/", Route);

//Public File
app.get("/*", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

mongoose.connect(config?.MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//socket io
const http = require("http");
const server = http.createServer(app);
global.io = require("socket.io")(server);

//socket.js
require("./socket");

//auctionWorker
require("./workers/auctionWorker");
require("./workers/manualAuctionWorker");
require("./workers/giveawayWorker");

//mongoose connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("MONGO: successfully connected to db");
});

//Set port and listen the request
server.listen(config.PORT, () => {
  console.log("Hello World ! listening on " + config.PORT);
});
