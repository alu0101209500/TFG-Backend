let messagesModule = require("../../index.js").messagesDB
let userUtils = require("./userUtils")

function attachIcons(index, list) {
    return new Promise((res, rej) => {
        if(index >= list.length) {
            res(list);
        } else {
            userUtils.returnCleanUser(list[index].from).then((user) => {
                list[index]._doc.icon = user.icon;
                attachIcons(index+1, [...list]).then((updatedList) => {
                    res(updatedList);
                }).catch((e) => {
                    rej(e)
                })
            }).catch((e) => {
                rej(e)
            })
        }
    })
}

function getAllMessages(){
    return new Promise((res, rej) => {
        messagesModule.find({}).then((list) => {
            res(list);
        }).catch((err) => {
            console.log("error");
            rej(err);
        })
    })
}

function getUserReceivedMessages(user){
    query= {
        $and:[
            {
                to: user
            },
            {
                destinationIgnored: false
            }
        ]
        
    }

    return new Promise((res, rej) => {
        messagesModule.find({...query}).then((list) => {
            attachIcons(0, [...list]).then((updatedList) => {
                res(updatedList);
            }).catch((err) => {
                rej(err)
            });
        }).catch((err) => {
            console.log("error");
            rej(err);
        })
    })
}

function getUserSentMessages(user){
    query= {
        $and:[
            {
                from: user
            },
            {
                originIgnored: false
            }
        ]
        
    }
    
    return new Promise((res, rej) => {
        messagesModule.find({...query}).then((list) => {
            userUtils.returnCleanUser(user).then((returneduser) => {
                for(let i in list) {
                    list[i]._doc.icon = returneduser.icon
                }
                res(list)
            }).catch((err) => {
                rej(err)
            })
        }).catch((err) => {
            console.log("error");
            rej(err);
        })
    })
}

function postNewMessage(user, messageInfo) {
    let now = new Date();
    let ignoreFromOrigin = false;
    if(user == "System") {
        ignoreFromOrigin = true;
    }
    let newMessage = new messagesModule({
        from: user,
        to: messageInfo.to,
        subject: messageInfo.subject,
        message: messageInfo.message,
        sentAt: now.getTime(),
        originIgnored: ignoreFromOrigin,
        destinationIgnored: false
    });
    return new Promise((res, rej) => {
        newMessage.save().then((doc) => {
            res(doc._id);
        }).catch((err) => {
            rej(err);
        })
    })
}

function ignoreMessage(user, id) {
    return new Promise((res, rej) => {
        if(!id) {
            rej("Query field required - 'messageID'")
        }
        messagesModule.findOne({_id: id}).then((doc) => {
            if(doc.from == user) {
                if(doc.to == user) {
                    messagesModule.deleteOne({_id: id}).then((deletions) => {
                        if(deletions.deletedCount == 0) {
                            rej(`Message with id ${id} does not exist`)
                        } else {
                            res("Message ignored");
                        }       
                    })
                } else if(doc.destinationIgnored == true) {
                    messagesModule.deleteOne({_id: id}).then((deletions) => {
                        if(deletions.deletedCount == 0) {
                            rej(`Message with id ${id} does not exist`)
                        } else {
                            res("Message ignored");
                        }       
                    })
                } else {
                    doc.originIgnored = true;
                    doc.save()
                    res("Message ignored")
                }
            } else if(doc.to == user) {
                if(doc.from == user) {

                } else if(doc.originIgnored == true) {
                    messagesModule.deleteOne({_id: id}).then((deletions) => {
                        if(deletions.deletedCount == 0) {
                            rej(`Message with id ${id} does not exist`)
                        } else {
                            res("Message ignored");
                        }       
                    })
                } else {
                    doc.destinationIgnored = true;
                    doc.save()
                    res("Message ignored")
                }

            } else {
                rej(`User ${user} is not allowed to remove this message`)
            }
        }).catch((err) => {
            rej(err);
        })
    })
}

exports.getAllMessages = getAllMessages;
exports.getUserReceivedMessages = getUserReceivedMessages;
exports.getUserSentMessages = getUserSentMessages;
exports.postNewMessage = postNewMessage;
exports.ignoreMessage = ignoreMessage;