const { domains } = require("googleapis/build/src/apis/domains");

let servicesModule = require("../../index.js").servicesDB

function getAllServices(page, ipp){
    page = Number(page);
    ipp = Number(ipp);
    return new Promise((res, rej) => {
        servicesModule.find({}, {}, {skip: page*ipp, limit: ipp}).then((list) => {
            res(list);
        }).catch((err) => {
            console.log("error");
            rej(err);
        })
    })
}

function getUserServices(user){
    return new Promise((res, rej) => {
        servicesModule.find({postedBy: user}).then((list) => {
            res(list);
        }).catch((err) => {
            console.log("error");
            rej(err);
        })
    })
}

function searchServices(query, page, ipp) {
    page = Number(page);
    ipp = Number(ipp);
    return new Promise((res, rej) => {
        servicesModule.find({
            $or: [
                {serviceName: { "$regex": String(query), "$options": "i" } },
                {serviceDesc: { "$regex": String(query), "$options": "i" } },
                {postedBy: query}
            ]}, {}, {skip: page*ipp, limit: ipp}).then((list) => {
                res(list);
        }).catch((err) => {
            rej(err);
        })
    })
}

function postNewService(user, serviceInfo) {
    let now = new Date();
    let newService = new servicesModule({
        serviceName: serviceInfo.serviceName,
        postedBy : user, 
        serviceDesc: serviceInfo.serviceDesc,
        images: serviceInfo.images,
        videos: serviceInfo.videos,
        postedAt: now.getTime()
    });
    return new Promise((res, rej) => {
        newService.save().then((doc) => {
            res(doc._id);
        }).catch((err) => {
            rej(err);
        })
    })
}

function deleteOneService(user, id) {
    return new Promise((res, rej) => {
        if(!id) {
            rej("Query field required - 'username'")
        }
        servicesModule.findOne({_id: id}).then((doc) => {
            if(doc.postedBy == user) {
                servicesModule.deleteOne({_id: id}).then((deletions) => {
                    if(deletions.deletedCount == 0) {
                        rej(`Service with id ${id} does not exist`)
                    } else {
                        res("User succesfully deleted");
                    }       
                })
            } else {
                rej(`User ${user} is not allowed to remove service posted by ${doc.postedBy}`)
            }
        }).catch((err) => {
            rej(err);
        })
    })
}

function deleteUserServices(user) {
    return new Promise((res, rej) => {
        servicesModule.deleteMany({postedBy: user}).then((doc) => {
            res(doc);
        }).catch((err) => {
            rej(err);
        })
    })
}

function addImages(id, img, queryUser) {
    return new Promise((res, rej) => {
        servicesModule.findOne({_id: id}).then((doc) => {
            if(doc.length == 0) {
                rej("No service found");
            } else {
                if(doc.postedBy !== queryUser) {
                    rej("Invalid operation")
                } else {
                    if(doc.images == "") {
                        doc.images = img;
                        doc.save();
                        res("OK")
                    } else {
                        let aux = [];
                        aux = doc.images.split(",");
                        aux.push(img);
                        doc.images = aux.join(",");
                        doc.save()
                        res("OK")
                    }
                }

            }
        }).catch((err) => {
            rej(err);
        })
    })
}

exports.getAllServices = getAllServices;
exports.getUserServices = getUserServices;
exports.searchServices = searchServices;
exports.postNewService = postNewService;
exports.deleteOneService = deleteOneService;
exports.deleteUserServices = deleteUserServices;
exports.addImages = addImages;