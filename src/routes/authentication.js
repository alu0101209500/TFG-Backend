const utilityFunctions = require("../utils/utilityFunctions");
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
              utilityFunctions.recordLog(`[AUTH] - USER LOGGED-IN: ${auxArr[0]}  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
              res.send(JSON.stringify({
                type: "res",
                status: "true",
                ...value,
                authToken : token,
                msg: "User logged in"
              }));
            }).catch((e) => {throw e})
            
          } else {
            utilityFunctions.recordLog(`[AUTH] - FAILED ATTEMPT TO LOG-IN - User: ${auxArr[0]}  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
            res.send(JSON.stringify({
              type: "res",
              status: "false",
              msg: "Wrong user or password"
            }));
          }
        }).catch((e) => {
          utilityFunctions.recordLog(`[AUTH] [ERROR] - ERROR DURING ATTEMPT TO LOG-IN - User: ${auxArr[0]} \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
          res.send(JSON.stringify({
            type: "err",
            msg: "Request not valid: " + e
          }));
        })
      }
    } catch (err) {
      utilityFunctions.recordLog(`[AUTH] [ERROR] - ERROR DURING ATTEMPT TO LOG-IN  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
      res.send(JSON.stringify({
        type: "err",
        msg: "Request not valid: " + err
      }));
    }
  });


}