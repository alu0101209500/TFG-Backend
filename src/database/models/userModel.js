const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;

const UserSchema = new mongoose.Schema({
    username : {type: String, required: true, index: {unique: true}}, 
    fullname : String,
    password : {type: String, required: true},
    email : String,
    registration : Number,
    reviewNumber : Number,
    reviewScore: Number,
    icon: String,
    description: String
});

UserSchema.pre('save', function(next) {
    if(!this.isModified('password')) { return next();}
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    return cb(null, bcrypt.compareSync(candidatePassword, this.password));
};

exports.UserSchema = UserSchema