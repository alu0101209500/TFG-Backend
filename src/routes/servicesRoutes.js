const utilityFunctions = require("../utils/utilityFunctions");
const middlewares = require('./middlewares');
const servicesUtils = require('../database/dbaccess/servicesUtils');
const e = require("express");


module.exports = function(app) {
    app.post("/services/search", (req, res) => {
        let search = "";
        let page = 0;
        let ipp = 10;

        if(req.body.page)
            page = req.body.page;
        if(req.body.ipp)
            ipp = req.body.ipp;
        if(req.body.search)
            search = req.body.search;

        servicesUtils.searchServices(search, page, ipp, {... req.body}).then((list) => {
            res.send(JSON.stringify({type: "res", value: list}));
        }).catch((e) => {
            res.send(JSON.stringify({type: "err", value: e}));
        });
    })
    
    app.post("/services/addimg", middlewares.jwtAuthenticate, (req, res) => {
        if(!req.body.id || !req.body.image || req.body.id == "" || req.body.image == "") {
            res.send(JSON.stringify({type: "err", value: "Id and image fields required"}));
        } else {
            servicesUtils.addImages(req.body.id, req.body.image, req.body.authinfo.username).then((_) => {
                utilityFunctions.recordLog(`[INFO] - ADDED IMAGE TO SERVICE WITH ID ${req.body.id}  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                res.send(JSON.stringify({type: "res", value: "OK"}));
            }).catch((e) => {
                utilityFunctions.recordLog(`[INFO] - FAILED ATTEMPT TO ADD IMAGE TO SERVICE WITH ID ${req.body.id}  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                res.send(JSON.stringify({type: "err", value: e}));
            });
        }
    })
    
    app.post("/services", middlewares.jwtAuthenticate, (req, res) => {
        let videos = "";
        let images = "";
        let tags = [];
        if(req.body.images) {
            images = req.body.images;
        }
        if (req.body.videos) {
            videos = req.body.videos;
        }
        if(req.body.tags) {
            tags = [...req.body.tags];
        }

        if(!req.body.serviceName || !req.body.serviceDesc || !req.body.price || !req.body.priceType || req.body.serviceName == "" || req.body.price == "" || req.body.priceType == ""){
            res.send(JSON.stringify({type: "err", value: "Service Name, Service Description, Price and Price Type must be provided"}))}
        else {
            servicesUtils.postNewService(req.body.authinfo.username, {serviceName: req.body.serviceName,
                serviceDesc: req.body.serviceDesc,
                images: images,
                videos: videos,
                price: req.body.price,
                priceType: req.body.priceType,
                tags: tags}).then((docId) => {
                    utilityFunctions.recordLog(`[INFO] - SERVICE CREATED - By user ${req.body.authinfo.username} with ID ${docId}\n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                    res.send(JSON.stringify({type: "res", value: "OK", id: docId}));
            }).catch((e) => {
                utilityFunctions.recordLog(`[INFO] - FAILED ATTEMPT TO POST SERVICE BY USER ${req.body.authinfo.username}. Reason: ${e}  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                res.send(JSON.stringify({type: "err", value: e}));
            });
        } 
    });
    
    app.delete("/services", middlewares.jwtAuthenticate, (req, res) => {
        if(!req.body.id) {
            res.send(JSON.stringify({type: "err", value: "Id required"}));
        } else {
            servicesUtils.deleteOneService(req.body.authinfo.username, req.body.id).then((_) => {
                utilityFunctions.recordLog(`[INFO] - DELETED SERVICE ${req.body.id}  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                res.send(JSON.stringify({type: "res", value: "OK"}))
            }).catch((e) => {
                utilityFunctions.recordLog(`[INFO] - FAILED ATTEMPT TO DELETE SERVICE ${req.body.id}. Reason: ${e}  \n\tProxy-forwarded address: ${req.headers['x-forwarded-for']} \n\tRemote address: ${req.connection.remoteAddress}\n\tUser-Agent:${req.header['user-agent']} \n\tReferrer: ${ req.header['referrer']}`);
                res.send(JSON.stringify({type: "err", value: e}));
            });
        }
    });
}