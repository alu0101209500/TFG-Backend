let transactionsModule = require('../../index').transactionsDB

function attachIcons(index, list, origin) {
    return new Promise((res, rej) => {
        if(index >= list.length) {
            res(list);
        } else {
            userUtils.returnCleanUser(list[index][origin]).then((user) => {
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

function getAllTransactions(){
    return new Promise((res, rej) => {
        transactionsModule.find({}).then((list) => {
            res(list);
        }).catch((err) => {
            rej(err);
        })
    })
}

function getUserProprietaryTransactions(user){
    query= {
        $and:[
            {
                proprietary: user
            },
            {
                originIgnored: false
            }
        ]
        
    }

    return new Promise((res, rej) => {
        transactionsModule.find({...query}).then((list) => {
            attachIcons(0, [...list], "applicant").then((updatedList) => {
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

function getUserApplicantTransactions(user){
    query= {
        $and:[
            {
                applicant: user
            },
            {
                destinationIgnored: false
            }
        ]
        
    }
    
    return new Promise((res, rej) => {
        transactionsModule.find({...query}).then((list) => {
            attachIcons(0, [...list], "proprietary").then((updatedList) => {
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

function postNewMessage(user, messageInfo) {
    let now = new Date();
    let newMessage = new messagesModule({
        from: user,
        to: messageInfo.to,
        subject: messageInfo.subject,
        message: messageInfo.message,
        sentAt: now.getTime(),
        originIgnored: false,
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
                if(doc.destinationIgnored == true) {
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
                if(doc.originIgnored == true) {
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