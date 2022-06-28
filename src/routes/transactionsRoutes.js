const utilityFunctions = require("../utils/utilityFunctions");
const middlewares = require('./middlewares');
const transactionsUtils = require("../database/dbaccess/transactionsUtils");
const e = require("express");


module.exports = function(app) {
    app.post("/transactions", middlewares.jwtAuthenticate, (req, res) => {
        let notes = "";
        if(req.body.notes) {
            notes = req.body.notes;
        }
        if(!req.body.id) {
            res.send(JSON.stringify({type: "err", value: "Id of the service is required"}));
        } else {
            transactionsUtils.postNewTransaction(req.body.authinfo.username, {id: req.body.id, notes: notes}).then(() => {
                res.send(JSON.stringify({type: "res", value: "OK"}))
            }).catch((e) => {
                console.log(e)
                res.send(JSON.stringify({type: "err", value: e}));
            })
        }
    });

    app.get("/transactions", middlewares.jwtAuthenticate, (req, res) => {
        let result = [];
        
        transactionsUtils.getUserProprietaryTransactions(req.body.authinfo.username).then((proprietaryArray) => {
            result = [...proprietaryArray];
            transactionsUtils.getUserApplicantTransactions(req.body.authinfo.username).then((applicantArray) => {
                result = [...result.concat(applicantArray)];
                res.send(JSON.stringify({type: "res", value: result}))
            }).catch((e) => {
                res.send(JSON.stringify({type: "err", value: e}));
            })
        }).catch((e) => {
            res.send(JSON.stringify({type: "err", value: e}));
        })
    });

    app.put("/transactions", middlewares.jwtAuthenticate, (req, res) => {
        console.log(req.body)
        let notes = ""
        if(req.body.notes) {
            notes = req.body.notes
        }
        if(!req.body.id || !req.body.operation) {
            res.send(JSON.stringify({type: "err", value: "ID and operation must be provided"}))
        } else {
            if(req.body.operation == "accept") {
                if(req.body.previousPayment == undefined || req.body.finalPayment == undefined) {
                    res.send(JSON.stringify({type: "err", value: "Accept operations must include previousPayment and finalPayment fields"}))
                } else {
                    transactionsUtils.acceptTransaction(req.body.authinfo.username, {id: req.body.id, previousPayment: req.body.previousPayment, finalPayment: req.body.finalPayment, notes: notes}).then((_) => {
                        res.send(JSON.stringify({type: "res", value: "OK"}));
                    }).catch((err) => {
                        res.send(JSON.stringify({type: "err", value: err}));
                    })
                }
            } else if (req.body.operation == "reject") {
                transactionsUtils.rejectTransaction(req.body.authinfo.username, {id: req.body.id, notes: req.body.notes}).then((_) => {
                    res.send(JSON.stringify({type: "res", value: "OK"}));
                }).catch((err) => {
                    res.send(JSON.stringify({type: "err", value: err}));
                })
            } else if (req.body.operation == "pay") {
                transactionsUtils.payTransaction(req.body.authinfo.username, {id: req.body.id, punctuation: req.body.punctuation}).then((_) => {
                    res.send(JSON.stringify({type: "res", value: "OK"}));
                }).catch((err) => {
                    res.send(JSON.stringify({type: "err", value: err}));
                })
            } else if (req.body.operation == "cancel") {
                transactionsUtils.cancelTransaction(req.body.authinfo.username, {id: req.body.id}).then((_) => {
                    res.send(JSON.stringify({type: "res", value: "OK"}));
                }).catch((err) => {
                    res.send(JSON.stringify({type: "err", value: err}));
                })
            } else {
                res.send(JSON.stringify({type: "err", value: "Unknown operation"}))
            }
        }
    })

    app.delete("/transactions", middlewares.jwtAuthenticate, (req, res) => {
        if(!req.body.id) {
            res.send(JSON.stringify({type: "err", value: "Id of the transaction must be provided"}));
        } else {
            transactionsUtils.ignoreTransaction(req.body.authinfo.username, req.body.id).then(() => {
                res.send(JSON.stringify({type: "res", value: "OK"}));
            }).catch((e) => {
                res.send(JSON.stringify({type: "err", value: e}));
            })
        }
    });
}