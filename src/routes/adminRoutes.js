const utilityFunctions = require("../utils/utilityFunctions");
const middlewares = require('./middlewares');
const userUtils = require('../database/dbaccess/userUtils');
const servicesUtils = require('../database/dbaccess/servicesUtils');
const transactionsUtils = require('../database/dbaccess/transactionsUtils');
const messagesUtils = require('../database/dbaccess/messagesUtils');
const path = require("path")
fs = require('fs');

function getPaymentConf() {
    try{
        let val = fs.readFileSync(path.resolve(__dirname + "../../../config/paymentParams.json"), {encoding:'utf8', flag:'r'})
        return ({type: "res", value: JSON.parse(val)});
    } catch (err) {
        return ({type: "err", value: err});
    }
}

module.exports = function(app) {
    app.get("/admin/stats/sales", middlewares.jwtAuthenticate, (req, res) => {
        if(req.body.authinfo.username != "administrador") {
            res.send(JSON.stringify({type: "err", value: "Access granted to admins only"}));
        } else {
            transactionsUtils.saleStats(getPaymentConf()).then((val) => {
                res.send(JSON.stringify({type: "res", value: val}));
            }).catch((err) => {
                res.send(JSON.stringify({type: "res", value: err}));
            });
        }
    });

    app.get("/admin/stats/users", middlewares.jwtAuthenticate, (req, res) => {
        if(req.body.authinfo.username != "administrador") {
            res.send(JSON.stringify({type: "err", value: "Access granted to admins only"}));
        } else {
            userUtils.userStats().then((val) => {
                res.send(JSON.stringify({type: "res", value: val}));
            }).catch((err) => {
                res.send(JSON.stringify({type: "res", value: err}));
            });
        }
    });

    app.get("/admin/stats/services", middlewares.jwtAuthenticate, (req, res) => {
        if(req.body.authinfo.username != "administrador") {
            res.send(JSON.stringify({type: "err", value: "Access granted to admins only"}));
        } else {
            servicesUtils.servicesStats().then((val) => {
                res.send(JSON.stringify({type: "res", value: val}));
            }).catch((err) => {
                res.send(JSON.stringify({type: "res", value: err}));
            });
        }
    });

    app.get("/admin/stats/transactions", middlewares.jwtAuthenticate, (req, res) => {
        if(req.body.authinfo.username != "administrador") {
            res.send(JSON.stringify({type: "err", value: "Access granted to admins only"}));
        } else {
            transactionsUtils.transactionsStats().then((val) => {
                res.send(JSON.stringify({type: "res", value: val}));
            }).catch((err) => {
                res.send(JSON.stringify({type: "res", value: err}));
            });
        }
    });

    app.get("/admin/stats/messages", middlewares.jwtAuthenticate, (req, res) => {
        if(req.body.authinfo.username != "administrador") {
            res.send(JSON.stringify({type: "err", value: "Access granted to admins only"}));
        } else {
            messagesUtils.messagesStats().then((val) => {
                res.send(JSON.stringify({type: "res", value: val}));
            }).catch((err) => {
                res.send(JSON.stringify({type: "res", value: err}));
            });
        }
    });
    
    app.get("/admin/config", middlewares.jwtAuthenticate, (req, res) => {
        if(req.body.authinfo.username != "administrador") {
            res.send(JSON.stringify({type: "err", value: "Access granted to admins only"}));
        } else {
            let obj = getPaymentConf();
            console.log(obj)
            res.send(JSON.stringify(obj));
        }
    });

    app.post("/admin/config", middlewares.jwtAuthenticate, (req, res) => {
        if(req.body.authinfo.username != "administrador") {
            res.send(JSON.stringify({type: "err", value: "Access granted to admins only"}));
        } else if(!req.body.tasa) {
            res.send(JSON.stringify({type: "err", value: "New value must be provided"}));
        } else if(Number(req.body.tasa) > 99 || Number(req.body.tasa) < 0) {
            res.send(JSON.stringify({type: "err", value: "Value not valid"}));
        } else {
            if(!req.body)
            try{
                fs.writeFileSync(path.resolve(path.resolve(__dirname + "../../../config/paymentParams.json")), JSON.stringify({tasa: (Number(req.body.tasa)/100)}))
                res.send(JSON.stringify({type: "res", value: "OK"}));
            } catch (err) {
                res.send(JSON.stringify({type: "err", value: err}))
            }
        }
    });
}