let userModule = require("../../index.js").userDB

function getUsers(){
    return new Promise((res, rej) => {
        userModule.find().then((list) => {
            res(list);
        }).catch((err) => {
            console.log("error");
            rej(err);
        })
    })
}

function findUserByName(nick) {
    return new Promise((res, rej) => {
        userModule.find({username: nick}).then((list) => {
            if(list.length == 0) {
                rej("No user found");
            } else {
                res(list[0]);
            }
        }).catch((err) => {
            rej(err);
        })
    })
}

function returnCleanUser(nick) {
    let aux = {
        "username": "",
        "email": "", 
        "fullname": "",
        "registration": 0,
        "reviewNumber" : 0,
        "reviewScore": 0,
        "icon": "",
        "description": ""
    }
    return new Promise((res, rej) => {
        userModule.find({username: nick}).then((list) => {
            if(list.length == 0) {
                rej("No user found");
            } else {
                for(let prop in aux) {
                    aux[prop] = list[0][prop]
                }
                res(aux);
            }
        }).catch((err) => {
            rej(err);
        })
    })
}

function validateUser(user, passwd){
    return new Promise((res, rej) => {
        userModule.find({username: user}).then((list) => {
            if(list.length == 0) {
                console.log("no user")
                rej("No user found");
            } else {
                list[0].comparePassword(passwd, (err, isMatch) => {
                    if(err) throw err;
                    res(isMatch)
                });
            }
        }).catch((err) => {
            rej(err);
        })
    })
}

function checkIfValidReg(queryUser, queryEmail) {
    return new Promise((res, rej) => {
        let user
        let email
        try {
            userModule.find({username: queryUser}).then((userval) => {
                user = userval;
                userModule.find({email: queryEmail}).then((emailval) => {
                    email = emailval;
                    if(user.length > 0){
                        res({
                            type: "res",
                            register: "false",
                            validUser: "Ese usuario ya se encuentra registrado"
                        });
                    }
                    if(email.length > 0){
                        res({
                            type: "res",
                            register: "false",
                            validEmail: "Ese correo ya se encuentra registrado"
                        });
                    }
                    res({
                        type: "res",
                        register: "true"
                    });
                })

            });
        } catch(err) {
            rej(err)
        }
    })
}

function postNewUser(userInfo) {
    let newUser = new userModule(userInfo);
    return new Promise((res, rej) => {
        newUser.save().then(() => {
            res("User created");
        }).catch((err) => {
            rej(err);
        })
    })
}

function updateProfile(userInfo) {
    return new Promise((res, rej) => {
        userModule.find({username: userInfo.authinfo.username}).then((list) => {
            if(list.length == 0) {
                console.log("no user")
                rej("No user found");
            } else {
                if(userInfo.icon) {
                    list[0].icon = userInfo.icon
                }
                if(userInfo.description) {
                    list[0].description = userInfo.description
                }
                list[0].save()
                res()
            }
        }).catch((err) => {
            rej(err);
        })
    }) 
}

function deleteOneUser(nick) {
    return new Promise((res, rej) => {
        if(!nick) {
            rej("Query field required - 'username'")
        }
        userModule.deleteOne({username: nick}).then((deletions) => {
            if(deletions.deletedCount == 0) {
                rej(`User ${nick} does not exist`)
            } else {
                res("User succesfully deleted");
            }
            
        }).catch((err) => {
            rej(err);
        })
    })
}

function updateScore(user, value) {
    return new Promise((res, rej) => {
        console.log("User: " + user + " || Value: " + String(value))
        userModule.find({username: user}).then((list) => {
            if(list.length == 0) {
                rej("No user found");
            } else {
                list[0].reviewNumber = Number(list[0].reviewNumber) + 1;
                list[0].reviewScore = Number(list[0].reviewScore) + value;
                list[0].save().then((_) => {res("OK");}).catch((err) => {rej(err)})
            }
        }).catch((err) => {
            rej(err);
        })
    })
}

exports.getUsers = getUsers
exports.findUserByName = findUserByName
exports.checkIfValidReg = checkIfValidReg
exports.postNewUser = postNewUser
exports.deleteOneUser = deleteOneUser
exports.validateUser = validateUser
exports.returnCleanUser = returnCleanUser
exports.updateProfile = updateProfile
exports.updateScore = updateScore