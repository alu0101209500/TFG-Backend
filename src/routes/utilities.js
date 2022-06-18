const utilityFunctions = require("../utils/utilityFunctions");
const middlewares = require('./middlewares');
const userUtils = require('../database/dbaccess/userUtils');
const servicesUtils = require('../database/dbaccess/servicesUtils');
const jwt = require('jsonwebtoken');
const e = require("express");

const authSecret = 'aJDvksKOndi21FKDSasvbniopADpvi';

module.exports = function(app) {
    app.get("/authresource", middlewares.jwtAuthenticate, (req, res) => {
        res.send(JSON.stringify({type: "res", value:`If you can access this, congratulations, you have been logged in.\nAuthinfo: ${JSON.stringify(req.body.authinfo)}`}))
    });

  app.post("/users", (req, res) => {
    let query = req.body
    if(!query.username || !query.fullname || !query.password || !query.email) {
      res.send(JSON.stringify({type:"err", validUser: "Campo requerido", validPassword: "Campo requerido", validEmail: "Campo requerido"}))
    } else {
      userUtils.checkIfValidReg(query.username, query.email).then((val) => {
        if(val.register == "false") {
          res.send(val)
        } else {
          userUtils.postNewUser({
            username : query.username, 
            fullname : query.fullname,
            password : query.password,
            email : query.email,
            registration : new Date().getTime()
          }).then(() => {res.send(val)}).catch((e) => {res.send(JSON.stringify({type: "err", value: e}))}); 
        }
      }).catch((e) => {res.send(JSON.stringify({type: "err", value: e}))});
    }
  });

  app.delete("/users", (req, res) => {
    let query = req.query
    if(!query.username) {
      res.send(JSON.stringify({type:"err", value:"Required fields - username"}))
    } else {
      servicesUtils.deleteUserServices(query.username).then((_) =>{
        userUtils.deleteOneUser(query.username).then((_) => {res.send(JSON.stringify({type: "res", value: "OK"}))}).catch((e) => {res.send(JSON.stringify({type: "err", value: e}))})
      }).catch((e) => {res.send(JSON.stringify({type: "err", value: e}))})
    }
  });

  app.get("/user", middlewares.jwtAuthenticate, (req, res) => {
      userUtils.returnCleanUser(req.body.authinfo.username).then((user) => {res.send(JSON.stringify({type: "res", ...user}))}).catch((e) => {res.send(JSON.stringify({type: "err", value: e}))});
  });

  app.get("/listusers", (_, res) => {
    userUtils.getUsers().then((user) => {res.send(JSON.stringify({users: user}))}).catch((e) => {res.send(JSON.stringify({type: "err", value: e}))});
  });

  app.get("/testauth", (req, res) => {
    let query = req.query
    if(!query.username || !query.password) {
      res.send(JSON.stringify({type:"err", value:"Required fields - username, password"}))
    } else {
      userUtils.validateUser(query.username, query.password).then((v) => {
        if (v == true) {
          let token = jwt.sign({username: query.username}, authSecret, {expiresIn: "2h"});
          res.send(JSON.stringify({
            type: "res",
            status: "true",
            authToken : token,
            msg: "User logged in"
          }));
        } else {
          res.send(JSON.stringify({
            type: "res",
            status: "false",
            msg: "Wrong user or password"
          }));
        }
      }).catch((e) => {res.send(JSON.stringify({type: "err", value: String(e)}))});
    }
  });

  app.get("/services", (req, res) => {
    let page = 0;
    let ipp = 10;
    if(req.query.page)
      page = req.query.page;
    if(req.query.ipp)
      ipp = req.query.ipp;
    if(req.query.search !== "" && req.query.search !== undefined) {
      servicesUtils.searchServices(req.query.search, page, ipp).then((list) => {
        res.send(JSON.stringify({type: "res", value: list}));
      }).catch((e) => {
        res.send(JSON.stringify({type: "err", value: e}));
      });
    } else {
      servicesUtils.getAllServices(page, ipp).then((list) => {
        res.send(JSON.stringify({type: "res", value: list}));
      }).catch((e) => {
        res.send(JSON.stringify({type: "err", value: e}));
      });
    }
  })

  app.post("/services/addimg", middlewares.jwtAuthenticate, (req, res) => {
    if(!req.body.id || !req.body.image || req.body.id == "" || req.body.image == "") {
        res.send(JSON.stringify({type: "err", value: "Id and image fields required"}));
    } else {
      servicesUtils.addImages(req.body.id, req.body.image, req.body.authinfo.username).then((_) => {
        res.send(JSON.stringify({type: "res", value: "OK"}));
      }).catch((e) => {
        res.send(JSON.stringify({type: "err", value: e}));
      });
    }
  })

  app.post("/services", middlewares.jwtAuthenticate, (req, res) => {
    let videos = ""
    let images = ""
    if(req.body.images) {
      images = req.body.images;
    }
    if (req.body.videos) {
      videos = req.body.videos;
    }

    if(!req.body.serviceName || !req.body.serviceDesc){
      res.send(JSON.stringify({type: "err", value: "Service Name and Service Description must be provided"}))}
    else {
      servicesUtils.postNewService(req.body.authinfo.username, {serviceName: req.body.serviceName,
        serviceDesc: req.body.serviceDesc,
        images: images,
        videos: videos}).then((docId) => {
        res.send(JSON.stringify({type: "res", value: "OK", id: docId}));
      }).catch((e) => {
        res.send(JSON.stringify({type: "err", value: e}));
      });
    } 
  });

  app.delete("/services", middlewares.jwtAuthenticate, (req, res) => {
    if(!req.body.id) {
      res.send(JSON.stringify({type: "err", value: "Id required"}));
    } else {
      servicesUtils.deleteOneService(req.body.authinfo.username, req.body.id).then((_) => {
        res.send(JSON.stringify({type: "res", value: "OK"}))
      }).catch((e) => {
        res.send(JSON.stringify({type: "err", value: e}));
      });
    }
  });
}