const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
    
    
}, { timestamp: true });
  

module.exports = mongoose.model("Log", LogSchema);