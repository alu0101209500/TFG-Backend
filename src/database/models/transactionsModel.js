const mongoose = require("mongoose");

const TransactionsSchema = new mongoose.Schema({
    proprietary: {type: String, required: true},
    applicant: {type: String, required: true},
    status: {type: String, required: true},
    applicantNotes: {type: String, required: true},
    proprietaryNotes: {type: String, required: true},
    serviceName: {type: String, required: true},
    serviceId: {type: String, required: true},
    previousPayment: {type: Number, required: false},
    finalPayment: {type: Number, required: false},
    originIgnored: {type: Boolean, required:true},
    destinationIgnored: {type: Boolean, required:true}
});


exports.TransactionsSchema = TransactionsSchema;