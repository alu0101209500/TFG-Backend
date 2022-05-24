const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
    serviceName: {type: String, required: true},
    postedBy : {type: String, required: true}, 
    serviceDesc: {type: String, required: true},
    images: {type: String, required: false},
    videos: {type: String, required: false},
    postedAt: {type: Number, required: false}
});


exports.ServiceSchema = ServiceSchema;