const mongoose = require("mongoose");

const KnowledgeComponentSchema = new mongoose.Schema({
    name: String,
    prefix: String
});

module.exports = mongoose.model("KnowledgeComponent", KnowledgeComponentSchema);