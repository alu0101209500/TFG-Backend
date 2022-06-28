let transactionsModule = require('../../index').transactionsDB
let userUtils = require("./userUtils")
let servicesUtils = require("./servicesUtils")
let messagesUtils = require("./messagesUtils")

function attachIcons(index, list, origin) {
    return new Promise((res, rej) => {
        if(index >= list.length) {
            res(list);
        } else {
            userUtils.returnCleanUser(list[index][origin]).then((user) => {
                list[index]._doc.icon = user.icon;
                attachIcons(index+1, [...list], origin).then((updatedList) => {
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

function postNewTransaction(user, transactionInfo) {
    let now = new Date();
    
    return new Promise((res, rej) => {
        servicesUtils.getServiceById(transactionInfo.id).then((service) => {
            let newTransaction = new transactionsModule({
                proprietary: service.postedBy,
                applicant: user,
                status: "new",
                requestedAt: now.getTime(),
                applicantNotes: transactionInfo.notes,
                proprietaryNotes: "",
                serviceName: service.serviceName,
                serviceId: service._id,
                previousPayment: 0,
                finalPayment: Number(service.price),
                closedAt: 0,
                originIgnored: false,
                destinationIgnored: false
            });
            newTransaction.save().then((_) => {
                messagesUtils.postNewMessage("System", {to: service.postedBy,
                    subject: `Solicitud de servicio - ${service.serviceName}`,
                    message: `Saludos, ${service.postedBy}.El usuario ${user} ha solicitado su servicio ${service.serviceName} - (Id de transacción ${service._id}). Puedes seguir en todo momento el estado de la transacción desde la sección "Mis transacciones".`})
                res("Transaction created")
            }).catch((err) => {
                rej(err)
            })
        }).catch((err) => {
            rej(err)
        })
    })
}

function acceptTransaction(user, transactionInfo) {
    return new Promise((res, rej) => {
        transactionsModule.find({_id: transactionInfo.id}).then((list) => {
            if(list.length <= 0) {
                rej("There is no transaction with id " + String(transactionInfo.id))
            } else {
                if(list[0].proprietary != user || list[0].status != "new") {
                    rej("Forbidden")
                } else {
                    list[0].previousPayment = transactionInfo.previousPayment * transactionInfo.finalPayment;
                    list[0].finalPayment = transactionInfo.finalPayment;
                    list[0].proprietaryNotes = transactionInfo.notes;
                    list[0].status = "accepted"
                    list[0].save().then((_) => {
                        messagesUtils.postNewMessage("System", {to: list[0].applicant,
                            subject: `${list[0].proprietary} ha aceptado su solicitud de servicio`,
                            message: `Saludos, ${list[0].applicant}. El usuario ${list[0].proprietary} ha aceptado su solicitud del servicio ${list[0].serviceName} - (Id de transacción ${list[0]._id}). Puedes seguir en todo momento el estado de la transacción desde la sección "Mis transacciones".`})
                        res("Transaction updated")
                    }).catch((err) => {
                        rej(err)
                    })
                }
            }
        }).catch((err) => {
            rej(err)
        })
    });
}

function rejectTransaction(user, transactionInfo) {
    return new Promise((res, rej) => {
        transactionsModule.find({_id: transactionInfo.id}).then((list) => {
            if(list.length <= 0) {
                rej("There is no transaction with id " + String(transactionInfo.id))
            } else {
                if(list[0].proprietary != user || list[0].status != "new") {
                    rej("Forbidden")
                } else {
                    list[0].proprietaryNotes = transactionInfo.proprietaryNotes;
                    list[0].status = "closed"
                    list[0].closedAt = new Date().getTime()
                    list[0].save().then((_) => {
                        messagesUtils.postNewMessage("System", {to: list[0].applicant,
                            subject: `${list[0].proprietary} ha rechazado su solicitud de servicio`,
                            message: `Saludos, ${list[0].applicant}. El usuario ${list[0].proprietary} ha rechazado su solicitud del servicio ${list[0].serviceName} - (Id de transacción ${list[0]._id}). La transacción ha sido marcada cómo "cerrada", y puede ser revisada desde la sección "Mis transacciones". ¡Muchas gracias por usar nuestros servicios!`})
                        res("Transaction updated")
                    }).catch((err) => {
                        rej(err)
                    })
                }
            }
        }).catch((err) => {
            console.log(err)
            rej(err)
        })
    });
}

function payTransaction(user, transactionInfo) {
    return new Promise((res, rej) => {
        transactionsModule.find({_id: transactionInfo.id}).then((list) => {
            if(list.length <= 0) {
                rej("There is no transaction with id " + String(transactionInfo.id))
            } else {
                if(list[0].applicant != user || ((list[0].status != "accepted")&&(list[0].status != "firstPayment"))) {
                    rej("Forbidden")
                } else {
                    if(list[0].previousPayment == 0) {
                        list[0].status = "closed"
                        list[0].closedAt = new Date().getTime()
                        list[0].save().then((_) => {
                            messagesUtils.postNewMessage("System", {to: list[0].proprietary,
                                subject: `${list[0].applicant} ha abonado el pago por su servicio`,
                                message: `Saludos, ${list[0].proprietary}. El usuario ${list[0].applicant} ha abonado la totalidad del pago por su servicio "${list[0].serviceName}" - (Id de transacción ${list[0]._id}). La transacción, marcada como "cerrada", puede revisarse desde el apartado "Mis transacciones". ¡Muchas gracias por usar nuestros servicios!`})
                            if(transactionInfo.punctuation) {
                                userUtils.updateScore(list[0].proprietary, transactionInfo.punctuation).then((e) => {console.log(e)}).catch((err) => {console.log(err)})
                            }
                            res("Transaction updated")
                        }).catch((err) => {
                            rej(err)
                        })
                    } else {
                        list[0].status = "firstPayment",
                        list[0].previousPayment = 0
                        list[0].save().then((_) => {
                            messagesUtils.postNewMessage("System", {to: list[0].proprietary,
                                subject: `${list[0].applicant} ha abonado el pago por la señal de su servicio`,
                                message: `Saludos, ${list[0].proprietary}- El usuario ${list[0].applicant} ha abonado el pago correspondiente a la señal previamente acordada por la solicitud del servicio "${list[0].serviceName}" - (Id de transacción ${list[0]._id}). La transacción, marcada como "cerrada", puede revisarse desde el apartado "Mis transacciones".¡Muchas gracias por usar nuestros servicios!`})
                            res("Transaction updated")
                        }).catch((err) => {
                            rej(err)
                        })
                    }
                    
                }
            }
        }).catch((err) => {
            rej(err)
        })
    });
}

function cancelTransaction(user, transactionInfo) {
    return new Promise((res, rej) => {
        transactionsModule.find({_id: transactionInfo.id}).then((list) => {
            if(list.length <= 0) {
                rej("There is no transaction with id " + String(transactionInfo.id))
            } else {
                if(list[0].status == "new" && list[0].applicant == user) {
                    //Notificar al vendedor que el comprador ha cancelado la transacción antes incluso de que él la valorase
                    list[0].closedAt = new Date().getTime()
                    list[0].status = "closed"
                    list[0].save().then((_) => {
                        messagesUtils.postNewMessage("System", {to: list[0].proprietary,
                            subject: `${list[0].applicant} ha cancelado la solicitud de servicio`,
                            message: `Saludos, ${list[0].proprietary}El usuario ${list[0].applicant} ha cancelado la solicitud del servicio "${list[0].serviceName}" - (Id de transacción ${list[0]._id}). La transacción, marcada como "cerrada", puede revisarse desde el apartado "Mis transacciones".¡Muchas gracias por usar nuestros servicios!`})
                        res("Transaction updated")
                    }).catch((err) => {
                        rej(err)
                    })
                } else if (list[0].status == "accepted" && list[0].applicant == user) {
                    list[0].closedAt = new Date().getTime()
                    //Notificar al vendedor que el comprador ha cancelado la transacción tras su propuesta de pago
                    list[0].status = "closed"
                    list[0].save().then((_) => {
                        messagesUtils.postNewMessage("System", {to: list[0].proprietary,
                            subject: `${list[0].applicant} ha rechazado el pago por su servicio`,
                            message: `Saludos, ${list[0].proprietary}. El usuario ${list[0].applicant} ha rechazado abonar el pago solicitado para la realización del servicio "${list[0].serviceName}" - (Id de transacción ${list[0]._id}). La transacción, marcada como "cerrada", puede revisarse desde el apartado "Mis transacciones".¡Muchas gracias por usar nuestros servicios!`})
                        res("Transaction updated")
                    }).catch((err) => {
                        rej(err)
                    })
                } else if (list[0].status == "accepted" && list[0].proprietary == user) {
                    //Notificar al comprador que el vendedor ha cancelado la transacción antes de que él pudiese empezar a pagarla
                    list[0].closedAt = new Date().getTime()
                    list[0].status = "closed"
                    list[0].save().then((_) => {
                        messagesUtils.postNewMessage("System", {to: list[0].applicant,
                            subject: `${list[0].proprietary} ha cancelado la transacción en curso`,
                            message: `Saludos, ${list[0].applicant}El usuario ${list[0].proprietary} ha cancelado la transacción en curso por el servicio "${list[0].serviceName}" - (Id de transacción ${list[0]._id}).La transacción, marcada como "cerrada", puede revisarse desde el apartado "Mis transacciones".¡Muchas gracias por usar nuestros servicios!`})
                        res("Transaction updated")
                    }).catch((err) => {
                        rej(err)
                    })
                } else if (list[0].status == "firstPayment" && list[0].applicant == user) {
                    //Notificar al vendedor que el comprador ha cancelado la transacción después del primer pago, perdiendo así la señal
                    list[0].closedAt = new Date().getTime()
                    list[0].status = "closed"
                    list[0].save().then((_) => {
                        messagesUtils.postNewMessage("System", {to: list[0].proprietary,
                            subject: `${list[0].applicant} ha cancelado la transacción tras el pago de la señal`,
                            message: `Saludos, ${list[0].proprietary}El usuario ${list[0].applicant} ha cancelado la transacción por el servicio "${list[0].serviceName}" con id de transacción ${list[0]._id}, perdiendo así cualquier derecho a reintegro de la señal abonada. La transacción, marcada como "cerrada", puede revisarse desde el apartado "Mis transacciones".¡Muchas gracias por usar nuestros servicios!`})
                        res("Transaction updated")
                    }).catch((err) => {
                        rej(err)
                    })
                } else if (list[0].status == "firstPayment" && list[0].proprietary == user) {
                    //Notificar al comprador que el vendedor ha cancelado la transacción después del primer pago, recuperando así la señal
                    list[0].closedAt = new Date().getTime()
                    list[0].status = "closed"
                    list[0].save().then((_) => {
                        messagesUtils.postNewMessage("System", {to: list[0].applicant,
                            subject: `${list[0].proprietary} ha cancelado la transacción tras el pago de la señal`,
                            message: `Saludos, ${list[0].applicant}El usuario ${list[0].proprietary} ha cancelado la transacción por el servicio "${list[0].serviceName}" con id de transacción ${list[0]._id}. Por ello, se procederá al reintegro de la cantidad abonada como señal. La transacción, marcada como "cerrada", puede revisarse desde el apartado "Mis transacciones". ¡Muchas gracias por usar nuestros servicios!`})
                        res("Transaction updated")
                    }).catch((err) => {
                        rej(err)
                    })                
                } else {
                    rej("Forbidden")
                }
            }
        }).catch((err) => {
            rej(err)
        })
    });
}

function ignoreTransaction(user, id) {
    return new Promise((res, rej) => {
        if(!id) {
            rej("Query field required - 'transactionID'")
        }
        transactionsModule.findOne({_id: id}).then((doc) => {
            if(doc.applicant == user) {
                doc.destinationIgnored = true;
                doc.save()
                res("Transaction ignored")
            } else if(doc.proprietary == user) {
                doc.originIgnored = true;
                doc.save()
                res("Transaction ignored")
            } else {
                rej(`User ${user} is not allowed to remove this message`)
            }
        }).catch((err) => {
           
            rej(err);
        })
    })
}

exports.getAllTransactions = getAllTransactions;
exports.getUserProprietaryTransactions = getUserProprietaryTransactions;
exports.getUserApplicantTransactions = getUserApplicantTransactions;
exports.postNewTransaction = postNewTransaction;
exports.acceptTransaction = acceptTransaction;
exports.rejectTransaction = rejectTransaction;
exports.payTransaction = payTransaction;
exports.cancelTransaction = cancelTransaction;
exports.ignoreTransaction = ignoreTransaction;