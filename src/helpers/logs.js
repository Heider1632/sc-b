const db = require("../models");

class LogHelper {
  constructor(log) {
    this.LogHelperInstance(log);
  }

  LogHelperInstance(log) {
    return log;
  }
  
  async create(log){
    return await db.log.create(log)
  }

  async update(log){
    return await db.log.findOneAndUpdate({ _id: log._id, }, { $set: { ...log }})
  }

  async delete(log){
    return await db.log.findOneAndDelete({ _id: log._id, })
  }
}

let logInstance;
module.exports = function (log) {
  logInstance = logInstance || new LogHelper(log);
  return logInstance;
};