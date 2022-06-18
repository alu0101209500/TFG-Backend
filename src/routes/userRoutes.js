const utilityFunctions = require("../utils/utilityFunctions");
const middlewares = require('./middlewares');
const userUtils = require('../database/dbaccess/userUtils');
const servicesUtils = require('../database/dbaccess/servicesUtils');
const jwt = require('jsonwebtoken');
const e = require("express");

const authSecret = 'aJDvksKOndi21FKDSasvbniopADpvi';
const baseIcon = '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';


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
                    utilityFunctions.recordLog(`[INFO] - FAILED ATTEMPT TO CREATE USER. User or Email already exists  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                    res.send(val)
                } else {
                    userUtils.postNewUser({
                        username : query.username, 
                        fullname : query.fullname,
                        password : query.password,
                        email : query.email,
                        registration : new Date().getTime(),
                        reviewNumber : 0,
                        reviewScore: 0,
                        icon: baseIcon,
                        description: "Bienvenid@ a mi perfil!"
                    }).then(() => {
                        utilityFunctions.recordLog(`[INFO] - USER CREATED: \n\t-username: ${query.username}\n\t-fullname: ${query.fullname} \n\t-email: ${query.email} \n\n  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                        res.send(val)
                    }).catch((e) => {
                        utilityFunctions.recordLog(`[INFO] - FAILED ATTEMPT TO CREATE USER. Reason: ${e} \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                        res.send(JSON.stringify({type: "err", value: e}))
                    }); 
                }
            }).catch((e) => {
                utilityFunctions.recordLog(`[INFO] - FAILED ATTEMPT TO CREATE USER. Reason: ${e}  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                res.send(JSON.stringify({type: "err", value: e}))
            });
        }
    });

    app.delete("/users", (req, res) => {
        let query = req.query
        if(!query.username) {
            res.send(JSON.stringify({type:"err", value:"Required fields - username"}))
        } else {
            servicesUtils.deleteUserServices(query.username).then((_) =>{
                utilityFunctions.recordLog(`[INFO] - DELETED USER ${query.username}  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                userUtils.deleteOneUser(query.username).then((_) => {res.send(JSON.stringify({type: "res", value: "OK"}))}).catch((e) => {res.send(JSON.stringify({type: "err", value: e}))})
            }).catch((e) => {
                utilityFunctions.recordLog(`[INFO] - ATTEMPT TO DELETE USER ${query.username}. Reason: ${e} \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                res.send(JSON.stringify({type: "err", value: e}))
            })
        }
    });

    app.get("/user", middlewares.jwtAuthenticate, (req, res) => {
        userUtils.returnCleanUser(req.body.authinfo.username).then((user) => {res.send(JSON.stringify({type: "res", ...user}))}).catch((e) => {res.send(JSON.stringify({type: "err", value: e}))});
    });

    app.get("/profile", (req, res) => {
        if(!req.query.username) {
            res.send(JSON.stringify({type: "err", value: "Username must be provided"}))
        } else {
            userUtils.returnCleanUser(req.query.username).then((user) => {
                servicesUtils.getUserServices(req.query.username).then((services) => {
                    user.userServices = [...services];
                    res.send(JSON.stringify({type: "res", value: user}))
                }).catch((e) => {
                    res.send(JSON.stringify({type: "err", value: e}))
                })
            }).catch((e) => {
                res.send(JSON.stringify({type: "err", value: e}))
            });
        }
        
    })

    app.post("/profile", middlewares.jwtAuthenticate, (req, res) => {
        if(!req.body.icon && !req.body.description) {
            res.send(JSON.stringify({type:err, value: "Icon or Description must be provided"}));
        } else {
            userUtils.updateProfile(req.body).then(() => {
                res.send(JSON.stringify({type: "res", value: "OK"}))
            }).catch((e) => {
                res.send(JSON.stringify({type: "err", value: e}))
            });
        }
    })

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
}