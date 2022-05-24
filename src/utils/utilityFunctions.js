nodemailer = require('nodemailer');
const {google} = require('googleapis');

fs = require('fs');

function recordLog(msg) {
    let date = new Date();
    filePath = `/home/pablo/logs/backend-logs/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`;
    fs.appendFile(filePath,`[${date.getHours() < 10 ? "0" + date.getHours().toString() : date.getHours().toString()}:${date.getMinutes() < 10 ? "0" + date.getMinutes().toString() : date.getMinutes().toString()}] ` + String(msg) + "\n", (e) => {if(e) {console.log("Failed to save log: " + e)}});
}

module.exports.recordLog = recordLog;