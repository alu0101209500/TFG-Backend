const jwt = require('jsonwebtoken');
const authSecret = 'aJDvksKOndi21FKDSasvbniopADpvi';
const utilityFunctions = require("../utils/utilityFunctions");

const jwtAuthenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
  
        jwt.verify(token, authSecret, (err, authinfo) => {
            if (err) {
              utilityFunctions.recordLog(`[AUTH] - Failed to validate JSON Web Token at ${req.url}\n\tremoteHost:${req.hostname}\n\tremoteIp:${req.ip}\n\twithMethod:${req.method}\n\tprotocol:${req.protocol}\n\tparams:${JSON.stringify(req.params)}\n\tquery:${JSON.stringify(req.query)}\n\tbody:${JSON.stringify(req.body)}\n\tcookies:${req.cookies}`);
              return res.send({
                type: "err",
                msg: "Token could not be verified"
              });
            }
  
            req.body.authinfo = {...authinfo};
            next();
        });
    } else {
        res.send({
          type: "err",
          value: "Token could not be verified"
        });
    }
}

const secretAuthenticate = (req, res, next) => {
  console.log(JSON.stringify(req.hostname));
  //console.log(req.headers)
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const cipherToken = authHeader.split(' ')[1];
    //console.log(`Clave cifrada: ${cipherToken}`);
    let buff = new Buffer(cipherToken, 'base64');
    let token = buff.toString('ascii');
    //console.log(`Clave descifrada: ${token}`);
    let result = [];
    let i = 0;
    while(i + 3 <= token.length){
      result.push(token.slice(i, i+3))
      i += 5;
    }
    //console.log(`Clave reformada: ${result.join('')}`);
    if(result.join('') == authSecret) 
      next()
    else {
      utilityFunctions.recordLog(`[AUTH] - Failed to validate secret Token at ${req.url}\n\tremoteHost:${req.hostname}\n\tremoteIp:${req.ip}\n\twithMethod:${req.method}\n\tprotocol:${req.protocol}\n\tparams:${JSON.stringify(req.params)}\n\tquery:${JSON.stringify(req.query)}\n\tbody:${JSON.stringify(req.body)}\n\tcookies:${req.cookies}`);
      res.send({
        type: "err",
        value: "Token could not be verified"
      });
    }
  } else {
      res.send({
        type: "err",
        value: "Token could not be verified"
      });
  }
}

module.exports.jwtAuthenticate = jwtAuthenticate;
module.exports.secretAuthenticate = secretAuthenticate;