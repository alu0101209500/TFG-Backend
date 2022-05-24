const express = require('express');
const cors = require('cors');
const join = require('path').join;
const mongoose = require('mongoose');
const database = require('../config/database').database
const userSchema = require('./database/models/userModel').UserSchema
const servicesSchema = require('./database/models/serviceModel').ServiceSchema
const utilityFunctions = require("./utils/utilityFunctions");

const app = express();

try {
  let userDB = mongoose.createConnection(database.userDB, {useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,});
  let servicesDB = mongoose.createConnection(database.servicesDB, {useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true});
  exports.userDB = userDB.model("User", userSchema);
  exports.servicesDB = servicesDB.model("Services", servicesSchema);
}
catch {
  utilityFunctions.recordLog("[ERROR] - On database connection: " + err);
  console.log("[ERROR] - On database connection: " + err);
}
utilityFunctions.recordLog(`[INFO] - Connection to databases:\n${database.remoteUrl}\n${database.userDB}\n${database.servicesDB} established.`)

/*
mongoose.connect(database.remoteUrl , {useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,}).then(()=>{
    utilityFunctions.recordLog(`[INFO] - Connection to database ${database.remoteUrl} established.`)
  }).catch((err) => {
    utilityFunctions.recordLog("[ERROR] - On database connection: " + err);
    console.log("[ERROR] - On database connection: " + err);
});*/

app.use(express.urlencoded({limit: '200mb', extended: true}));
app.use(express.json({limit: '200mb'}));
app.use(express.static(join(__dirname, '../public')));
app.use(cors());


require('./routes/authentication')(app);
require('./routes/utilities')(app);

app.get("/script/:path", (req, res) => {
  res.sendFile("/scripts" + req.originalUrl);
});

app.get("/:path", (req, res) => {
  let enpoints = ["/", "/signin", "/signup", "/service"]
  if(req.originalUrl == "/"){
    res.sendFile("index.html");
  } else {
    res.sendFile(req.originalUrl, (err) => {
      if(err) {
        res.status(404).send("<html><head></head><body><h1>Error 404</h1><br><p>Page not found</p></body></html>")
      }
    });
  }
});

app.get("*", (req, res) => {
  //console.log(req.originalUrl);
  res.status(404).send("<html><head></head><body><h1>Error 404</h1><br><p>Page not found</p></body></html>")
});

app.listen(3000, "192.168.1.42", () => {
  console.log("Server a la escucha en el puerto 3000");
  utilityFunctions.recordLog(`[INFO] - Server started at ${new Date().toString()}`);
});