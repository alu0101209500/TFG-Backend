const jwt = require('jsonwebtoken');
const userUtils = require('../database/dbaccess/userUtils');

const authSecret = 'aJDvksKOndi21FKDSasvbniopADpvi';

module.exports = function(app) {
    
  
  app.post("/users/auth", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new Error("User request must have content field");
      } else {
        const token = authHeader.split(' ')[1];
        let buff = new Buffer(token, "base64");
        let auxArr = buff.toString("ascii").split(":");
        userUtils.validateUser(auxArr[0], auxArr[1]).then((value) => {
          if (value == true) {
            let token = jwt.sign({username: auxArr[0]}, authSecret, {expiresIn: "2h"});
            userUtils.returnCleanUser(auxArr[0]).then((value) => {
              res.send(JSON.stringify({
                type: "res",
                status: "true",
                ...value,
                authToken : token,
                msg: "User logged in"
              }));
            }).catch((e) => {throw e})
            
          } else {
            res.send(JSON.stringify({
              type: "res",
              status: "false",
              msg: "Wrong user or password"
            }));
          }
        }).catch((e) => {
          throw e;
        })
      }
    } catch (err) {
      res.send(JSON.stringify({
        type: "err",
        msg: "Request not valid: " + err
      }));
    }
  });


}