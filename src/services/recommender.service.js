const db = require("../models");
const axios = require("axios");
const _ = require('lodash');

const mongoose = require("mongoose");

class RecommenderService {
  constructor(metacore) {
    this.metacoreIntance(metacore);
  }

  metacoreIntance(metacore) {
    return metacore;
  }

  isValidResource(trace, index) {
    return (
      trace.assessments[index] &&
      trace.assessments[index].like > 3 &&
      trace.assessments[index].time_use >=
      trace.resources[index].estimatedTime
    );
  }

  async validateUserSeen(user, data, prefix, index) {
    let vus = await db.userSeen.findOne({ user: user, ref: data[index], lesson: prefix });

    if (vus) {
      index++;
      return this.validateUserSeen(user, data, prefix, index);
    } else {
      return index;
    }
  }
  
  async recovery(args) {

    let student = await db.student
      .findById(args.id_student)
      .populate({ path: "learningStyleDimensions" });

    let traces = await db.trace
      .find({ student: student.id, lesson: args.id_lesson })
      .populate("resources");

    let lesson = await db.lesson.findById(args.id_lesson).populate("structure");

    let learningStyleDimensions = student.learningStyleDimensions.map(
      (ls) => ls._id
    );

    let pedagogicalStrategies = await db.pedagogicalStrategy.find({});

    let counts = pedagogicalStrategies.map((ps, indice) => {
      let count = 0;
      ps.learningStyleDimensions.forEach((val) => {
        if (learningStyleDimensions.includes(val)) {
          count++;
        }
      });
      return { index: indice, count: count };
    });

    var indice = counts.sort((a, b) => b.count - a.count)[0].index;

    let pedagogicalStrategy = pedagogicalStrategies[indice];

    let response = await axios.get(process.env.NODE_ENV === "development" ? 'http://localhost:5000/api/recommender/user' : 'https://scp.protocolosensalud.com/api/recommender/user', {
      params: { id: student.key, name: student.id + "-" + student.name },
    });

    if (response.status == 200) {
      let resources = [];

      let index = 0;

      let data = response.data;

      let vus = await db.userSeen.findOne({
        user: student.key,
        ref: data[index],
        lesson: lesson.prefix,
      });

      if (vus) {
        var newIndex = await this.validateUserSeen(student.key, data, lesson.prefix, index);
      }

      if (!vus || newIndex) {

        let r = await axios.get(process.env.NODE_ENV === "development" ? 'http://localhost:5000/api/recommender/resources' : 'https://scp.protocolosensalud.com/api/recommender/resources', {
          params: {
            id: data[newIndex ?? index],
            name: student.id + "-" + student.name,
            learningStyle: pedagogicalStrategy.key,
            lesson: lesson.prefix ?? "L1",
          },
        });

        if (r.status == 200) {

          await db.userSeen.create({
            user: student.key,
            ref: data[newIndex ?? index],
            data: data,
            lesson: lesson.prefix
          });

          var d = r.data;

          return Promise.all(
            lesson.structure.map(async (structure, index) => {
              if (index < 5) {
                let x = d.map((element) => {
                  if (element.structure == structure.type) {
                    return element;
                  }
                });

                let y = _.maxBy(x, "rating");

                if (y) {
                  let r = await db.resource.findOne({ title: y.title });
                  
                  if (r) {
                    return { time_use: 0, rating: 0, resource: r };
                  } else {

                    let resource = null;

                    if (traces.length > 0) {
                      
                      let foundR = null;
                      let _ids = [];

                      for (var i = 0; i < traces.length; i++) {

                        if (this.isValidResource(traces[i], index)) {
      
                          foundR = true;
                          resource = await db.resource.findById(
                            traces[i].resources[index]._id
                          );

                          break;
      
                        } else {
                          foundR = false;

                          if (traces[i].resources[index]) {
                            _ids.push(traces[i].resources[index]._id);
                          }
                        }
                      }
      
                      if (foundR == false) {
      
                        resource = await db.resource.findOne({
                          _id: { $nin: _ids },
                          pedagogicalStrategy: pedagogicalStrategy._id,
                          structure: structure._id,
                        });
    
      
                        if (resource == null) {
      
                          resource = await db.resource.findOne({
                            pedagogicalStrategy: pedagogicalStrategy._id,
                            structure: structure._id,
                          });

                          return { resource: resource, time_use: 0, like: 0 };
                        } else {
                          return { resource: resource, time_use: 0, rating: 0 };
                        }
                      } else {
                        return { time_use: 0, rating: 0, resource: resource };
                      }
                    } else {
                      resource = await db.resource.findOne({
                        pedagogicalStrategy: pedagogicalStrategy._id,
                        structure: structure._id,
                      });

                      return { time_use: 0, rating: 0, resource: resource };
                    }
                  }
                } else {
                  console.log('--------ERRORRR--------');
                }
              }
            })
          ).then((value) => {
            resources = value.filter((r) => r);
            return resources;
          });
        } else {
          return [];
        }
      }
    } else {
      return [];
    }
  }

  async retrain(args) {

    let student = await db.student.findOne({ _id: args.id_student });
    
    let trace = await db.trace.findOne({ _id: args.id_trace }).populate('resources');
    
    let lastSeen = await db.userSeen.find({ user: student.key, lesson: args.prefix,  trace: { $exists: false }});

    await db.userSeen.findOneAndUpdate({ _id: lastSeen[lastSeen.length -1]._id }, { $set: { trace: trace._id } });

    let name = student.id + "-" + student.name;

    let content = trace.assessments.map((s, index) => {

      let c = trace.resources[index].estimatedTime * s.like * args.note;
      let b = s.time_use * s.like * args.note;

      //TODO:: resolve
      let a = (b * 5) / c;

      if(Number.isNaN(a)) { 
        a = 0;
      } else if (a > 5) { 
        a = 5;
      };
      
      return [student.key, trace.resources[index].key, a];
    });

    let data = {  
      name: name,
      body: content,
    };

    let response = await axios.post(process.env.NODE_ENV  === "development" ? 'http://localhost:5000/api/recommender/dataset/update' : 'https://scp.protocolosensalud.com/api/recommender/dataset/update', data);

    if (response.status == 200) {
      return true;
    } else {
      return false;
    }
  }
}

let recommenderInstance;
module.exports = function (metacore) {
  recommenderInstance = recommenderInstance || new RecommenderService(metacore);
  return recommenderInstance;
};
