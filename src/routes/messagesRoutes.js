const utilityFunctions = require("../utils/utilityFunctions");
const middlewares = require('./middlewares');
const messagesUtils = require('../database/dbaccess/messagesUtils');
const userUtils = require('../database/dbaccess/userUtils');
const e = require("express");


module.exports = function(app) {
    app.post("/messages", middlewares.jwtAuthenticate, (req, res) => {
        if(!req.body.to || !req.body.subject || !req.body.message || req.body.to == "" || req.body.subject == "" || req.body.message == "" ) {
            res.send(JSON.stringify({type: "err", value: "Destination, subject and message body are required"}));
        } else {
            userUtils.findUserByName(req.body.to).then(() => {
                messagesUtils.postNewMessage(req.body.authinfo.username, {
                    to: req.body.to,
                    subject: req.body.subject,
                    message: req.body.message
                }).then(() => {
                    res.send(JSON.stringify({type: "res", value: "OK"}));
                }).catch((e) => {
                    res.send(JSON.stringify({type: "err", value: e}));
                })
            }).catch((e) => {
                res.send(JSON.stringify({type: "err", value: e}));
            })
        }
    });

    app.get("/messages", middlewares.jwtAuthenticate, (req, res) => {
        let result = {
            received: [],
            sent:[]
        };

        messagesUtils.getUserReceivedMessages(req.body.authinfo.username).then((receivedArray) => {
            result.received = [...receivedArray];
            messagesUtils.getUserSentMessages(req.body.authinfo.username).then((sentArray) => {
                result.sent = [...sentArray];
                res.send(JSON.stringify({type: "res", value: {...result}}));
            }).catch((e) => {
                res.send(JSON.stringify({type: "err", value: e}));
            })
        }).catch((e) => {
            res.send(JSON.stringify({type: "err", value: e}));
        })
    });

    app.delete("/messages", middlewares.jwtAuthenticate, (req, res) => {
        if(!req.body.id) {
            res.send(JSON.stringify({type: "err", value: "Id of the message must be provided"}));
        } else {
            messagesUtils.ignoreMessage(req.body.authinfo.username, req.body.id).then(() => {
                res.send(JSON.stringify({type: "res", value: "OK"}));
            }).catch((e) => {
                res.send(JSON.stringify({type: "err", value: e}));
            })
        }
    });
}