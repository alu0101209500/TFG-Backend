const express = require('express');
const cors = require('cors');
const join = require('path').join;
const mongoose = require('mongoose');
const database = require('../config/database').database
const userSchema = require('./database/models/userModel').UserSchema
const servicesSchema = require('./database/models/serviceModel').ServiceSchema
const messagesSchema = require('./database/models/messagesModel').MessagesSchema
const transactionsSchema = require('./database/models/transactionsModel').TransactionsSchema
const utilityFunctions = require("./utils/utilityFunctions");
const path = require('path');

const app = express();

try {
  let userDB = mongoose.createConnection(database.userDB, {useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,});
  let servicesDB = mongoose.createConnection(database.servicesDB, {useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true});
  let messagesDB = mongoose.createConnection(database.messagesDB, {useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true});
  let transactionsDB = mongoose.createConnection(database.transactionsDB, {useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true});
  exports.userDB = userDB.model("User", userSchema);
  exports.servicesDB = servicesDB.model("Services", servicesSchema);
  exports.messagesDB = messagesDB.model("Messages", messagesSchema);
  exports.transactionsDB = transactionsDB.model("Transactions", transactionsSchema);
}
catch {
  utilityFunctions.recordLog("[ERROR] - On database connection: " + err);
  console.log("[ERROR] - On database connection: " + err);
}
utilityFunctions.recordLog(`[INFO] - Connection to databases:\n${database.remoteUrl}\n${database.userDB}\n${database.servicesDB}\n${database.messagesDB} established.`)



app.use(express.urlencoded({limit: '200mb', extended: true}));
app.use(express.json({limit: '200mb'}));
app.use(cors());


require('./routes/authentication')(app);
require('./routes/userRoutes')(app);
require('./routes/servicesRoutes')(app);
require('./routes/messagesRoutes')(app);

app.get("*", (req, res) => {
  let endpoints = ["/", "/signin", "/signup", "/service", "/servicePost", "/advancedSearch", "/profilePage", "/messagesPage"]
  if(endpoints.includes(req.originalUrl)) {
    res.sendFile(path.resolve(__dirname, "../public") + "/index.html")
  } else {
    res.sendFile(path.resolve(__dirname, "../public") + req.originalUrl, (err) => {
      if(err) {
        res.status(404).send("<html><head></head><body><h1>Error 404</h1><br><p>Page not found</p></body></html>")
      }
    });
  }
  
});

app.listen(3000, "192.168.1.42", () => {
  console.log("Server a la escucha en el puerto 3000");
  utilityFunctions.recordLog(`[INFO] - Server started at ${new Date().toString()}`);
});