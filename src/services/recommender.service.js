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

  async validateUserSeen(user, data, index) {
    let vus = await db.userSeen.findOne({ user: user, ref: data[index] });

    if (vus) {
      index++;
      return this.validateUserSeen(user, data, index);
    } else {
      return index;
    }
  }
  
  async recovery(args) {

    console.log(args);

    let student = await db.student
      .findById(args.id_student)
      .populate({ path: "learningStyleDimensions" });

    console.log(student);

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
      });

      if (vus) {
        var newIndex = await this.validateUserSeen(student.key, data, index);
      }
      

      console.log(vus, newIndex);
      console.log(index);

      if (!vus || newIndex) {

        console.log(newIndex);
        let r = await axios.get(process.env.NODE_ENV === "production" ? 'https://scp.protocolosensalud.com/api/recommender/resources' : 'http://localhost:5000/api/recommender/resources', {
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
                    if (traces.length > 0) {
                      let resource = null;
                      let foundR = null;
                      let _ids = [];
                      traces.map(async (trace) => {
                        if (trace.assessments[index]) {
                          if (
                            trace.assessments[index].like > 3 &&
                            trace.assessments[index].time_use >=
                              trace.resources[index].estimatedTime
                          ) {
                            let sr = await db.resource.findById(
                              trace.resources[index]._id
                            );
                            foundR = true;
                            resource = { resource: sr, rating: 0, time_use: 0 };
                          } else {
                            foundR = false;
                            if (trace.resources[index]) {
                              _ids.push(trace.resources[index]._id);
                            }
                          }
                        } else {
                          if (trace.resources[index]) {
                            _ids.push(trace.resources[index]._id);
                          }
                        }
                      });
                      if (foundR == false) {
                        resource = await db.resource.findOne({
                          _id: { $nin: _ids },
                          pedagogicalStrategy: pedagogicalStrategy._id,
                          structure: structure._id,
                        });
                      } else {
                        let _ids = [];
                        traces.map(async (trace) => {
                          if (trace.assessments[index]) {
                            if (
                              trace.assessments[index].like > 3 &&
                              trace.assessments[index].time_use >=
                                trace.resources[index].estimatedTime
                            ) {
                              let sr = await db.resource.findById(
                                trace.resources[index]._id
                              );
                              foundR = true;
                              resource = {
                                resource: sr,
                                rating: 0,
                                time_use: 0,
                              };
                            } else {
                              foundR = false;
                              if (trace.resources[index]) {
                                _ids.push(trace.resources[index]._id);
                              }
                            }
                          } else {
                            if (trace.resources[index]) {
                              _ids.push(trace.resources[index]._id);
                            }
                          }
                        });
                        if (foundR == false) {
                          resource = await db.resource.findOne({
                            _id: { $nin: _ids },
                            pedagogicalStrategy: pedagogicalStrategy._id,
                            structure: structure._id,
                          });
                        }
                      }
                      if (resource) {
                        return { resource: resource, rating: 0, time_use: 0 };
                      } else {
                        let rs = d.find((r) => r.structure === structure.type);
                        let r = await db.resource.findOne({
                          key: rs.resourceId,
                        });
                        return { time_use: 0, rating: 0, resource: r };
                      }
                    } else {
                      let rs = d.find((r) => r.structure === structure.type);
                      let r = await db.resource.findOne({
                        key: { $not: { $in: [rs.resourceId] } },
                      });
                      return { time_use: 0, rating: 0, resource: r };
                    }
                  }
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

    console.log(args);

    let student = await db.student.findOne({_id: args.id_student });
    let trace = await db.trace.findOne({ _id: args.id_trace }).populate('resources');

    let name = student.id + "-" + student.name;

    let content = trace.assessments.map((s, index) => {
      return [student.key, trace.resources[index].key, (s.time_use * s.like * args.note) / 100];
    });

    let data = {  
      name: name,
      body: content,
    };

    let response = await axios.post(process.env.NODE_ENV  === "development" ? 'http://localhost:5000/api/recommender/dataset/update' : 'https://scp.proyectosifilisgestasionaria.com/recommender/dataset/update', data);

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
