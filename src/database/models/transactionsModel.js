const mongoose = require("mongoose");

const TransactionsSchema = new mongoose.Schema({
    proprietary: {type: String, required: true},
    applicant: {type: String, required: true},
    status: {type: String, required: true},
    requestedAt: {type: Number, required: true},
    applicantNotes: {type: String, required: false},
    proprietaryNotes: {type: String, required: false},
    serviceName: {type: String, required: true},
    serviceId: {type: String, required: true},
    previousPayment: {type: Number, required: false},
    finalPayment: {type: Number, required: false},
    closedAt: {type: Number, required:false},
    originIgnored: {type: Boolean, required:true},
    destinationIgnored: {type: Boolean, required:true}
});


exports.TransactionsSchema = TransactionsSchema;