const mongoose = require("mongoose");

const MessagesSchema = new mongoose.Schema({
    from: {type: String, required: true},
    to: {type: String, required: true},
    subject: {type: String, required: true},
    message: {type: String, required: true},
    sentAt: {type: Number, required: true},
    originIgnored: {type: Boolean, required:true},
    destinationIgnored: {type: Boolean, required:true}
});


exports.MessagesSchema = MessagesSchema;