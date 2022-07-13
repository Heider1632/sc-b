const db = require("../models");
const axios = require("axios");
const mongoose = require("mongoose");
class CbrService {
  constructor(metacore) {
    this.metacoreIntance(metacore);
  }

  metacoreIntance(metacore) {
    return metacore;
  }

  async validate(id_student, id_course, id_lesson) {
    return await db.case.findOne({
      "context.id_student": id_student,
      "context.id_course": id_course,
      "context.id_lesson": id_lesson,
      "euclideanWeight": 0,
    });
  }

  async performance(id_student) {
    return await db.case.find({ "context.id_student": id_student }).populate({
      path: "solution.resources.resource",
      model: "Resource",
    });
  }

  async coincident(id_student, id_course, id_lesson, structure) {
    let student = await db.student.findById(id_student);

    if (student.learningStyleDimensions.length === 0) {
      return [];
    }

    structure = structure.map((l) => (l = mongoose.Types.ObjectId(l)));

    let cases = [];

    let maxUses = await db.case.aggregate([
      {
        $match: { "context.id_course": mongoose.Types.ObjectId(id_course) },
      },
      {
        $match: { "context.id_lesson": mongoose.Types.ObjectId(id_lesson) },
      },
      {
        $lookup: {
            from: "students",
            localField: "context.id_student",
            foreignField: "_id",
            as: "student"
          }
      },
      {
        $lookup: {
          from: "historycases",
          localField: "_id",
          foreignField: "case",
          as: "historycase"
        }
      },
      {
        $match: { "student.learningStyleDimensions": student.learningStyleDimensions }
      },
      {
        $match: { "context.structure": { $eq: structure } },
      },
      {
        $sort: { "results.uses": -1 }
      },
    ]);

    if(maxUses.length > 0){

      let mostSuccessFiltered = maxUses.sort((a, b) => {
        if (a.results.success > b.results.success) {
          return -1;
        }
        if (a.results.success < b.results.success) {
          return 1;
        }
        return 0;
      });

      if(mostSuccessFiltered.lenght >= 4){
        let mostSuccess = mostSuccessFiltered.slice(0, parseInt(maxUses.length / 2));

        const busqueda = mostSuccess.reduce((acc, c) => {
          acc[c.results.success] = ++acc[c.results.success] || 0;
          return acc;
        }, {});
        
        const duplicados = mostSuccess.filter( (c) => {
          return busqueda[c.results.success];
        });

        if(duplicados.length > 0){

          let lessErrors =  mostSuccess.sort((a, b) => {
            if (a.results.errors < b.results.errors) {
              return -1;
            }
            if (a.results.errors > b.results.errors) {
              return 1;
            }
            return 0;
          })[0];

          cases = [lessErrors];
        } else {
          cases = [mostSuccess[0]];
        }
      } else {
        cases = mostSuccessFiltered;
      }
      
    }

    let historyCases = await db.historyCase.find({ student:  student._id });

    if(historyCases.length > 0){

      cases = cases.map((c) => {
        let filter = historyCases.filter(hc => hc.case.equals(c._id));
        if(filter.length == 0) return c;
      });

      cases = cases.filter(function(x) {
        return x !== undefined;
      });

    }

    return cases;
  }
  
  async recovery(cases) {

    let dataset = [];

    cases.map((c) => {
      dataset.push([c.euclideanWeight, c.results.uses]);
    });

    var url = '';

    if (process.env.NODE_ENV === "development") {
      url = "http://localhost:5000/api/knn"
    }
    
    if (process.env.NODE_ENV === "production") {
     url = "https://stip.fichasyprotocolosensalud.com/api/knn"
    }

    let response = await axios.post(url, {
      query: 10000,
      dataset: dataset,
    });

    if (response.status == 200) {
      let selectedCase = null;

      if (response.data.length) {

        //TODO: verify if value has a 0.5 range and get mode
        let item = response.data[0][1];

        selectedCase = await db.case.findOne({ _id: cases[item]._id }).populate('solution.resources.resource');
        
      }

      return selectedCase;
    } else {
      throw response.errors;
    }
  }

  filter(response) {
    return response.reduce((c, r) => r.euclideanWeight < c.euclideanWeight);
  }

  async create(id_student, id_course, id_lesson, structure, resources) {
    let newCase = {};

    newCase.context = {
      id_student: id_student,
      id_course: id_course,
      id_lesson: id_lesson,
      structure: structure,
    };

    newCase.solution = {
      id_student: id_student,
      resources: resources,
    };

    newCase.euclideanWeight = 0;
    newCase.results = {
      uses: 0,
      success: 0,
      errors: 0,
    };

    let savedCase = await db.case.create(newCase);

    return savedCase;
  }

  async adapt(c) {

    let selectedLesson = await db.lesson.findById(
      mongoose.Types.ObjectId(c.context.id_lesson)
    );

    let traces = await db.trace
      .find({ student: c.context.id_student, lesson: selectedLesson._id })
      .populate("resources", 'estimatedTime');

    if (c.solution.resources && c.solution.resources.length > 0) {

      return Promise.all(
        c.context.structure.map(async (l, index) => {

          if (
            c.solution.resources[index] &&
            c.solution.resources[index].resource != null &&
            c.solution.resources[index].rating > 3 &&
            c.solution.resources[index].time_use >
                traces[traces.length - 1].resources[index].estimatedTime
          ) {

            console.log('paso aqui');
            return {
              resource: c.solution.resources[index].resource,
              time_use: 0,
              like: 0,
            };
          } else {

            let selectedStructure = await db.structure.findById(
              mongoose.Types.ObjectId(l)
            );

            let student = await db.student
              .findById(c.context.id_student)
              .populate("learningStyleDimensions", "_id");

            let learningStyleDimensions = student.learningStyleDimensions.map(ls => ls._id);
          
            let pedagogicalStrategies = await db.pedagogicalStrategy.find({});

            let counts = pedagogicalStrategies.map((ps, indice) => {
              let count = 0;
              ps.learningStyleDimensions.forEach((val) => {
                if(learningStyleDimensions.includes(val)){
                  count++
                } 
              });
              return { index : indice, count: count };
            });

            var indice = counts.sort((a,b)=>b.count-a.count)[0].index
            
            let pedagogicalStrategy = pedagogicalStrategies[indice];

            console.log(pedagogicalStrategy);

            if (pedagogicalStrategy) {
              var foundR = false;

              let resource = null;

              if (traces.length > 0) {
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
                      structure: selectedStructure._id,
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
                        structure: selectedStructure._id,
                      });
                      
                    }
                  }
              } else {

                resource = await db.resource.findOne({
                  pedagogicalStrategy: pedagogicalStrategy._id,
                  structure: selectedStructure._id,
                });
              }

              if (resource) {
                return { resource: resource, rating: 0, time_use: 0 };
              }
            }
          }
        })
      ).then(async (plan) => {
        let resources = [];
        plan.map(async (data, index) => {
          if (data && data.resource) {
            resources.push(data.resource._id);
          }
        });

        return { id_case: c._id, plan: plan };
      });
    } else {

      return Promise.all(
        c.context.structure.map(async (l, index) => {

          let selectedStructure = await db.structure.findById(
            mongoose.Types.ObjectId(l)
          );        

          let student = await db.student
            .findById(c.context.id_student)
            .populate("learningStyleDimensions", "_id");
          
          let learningStyleDimensions = student.learningStyleDimensions.map(ls => ls._id);
          
          let pedagogicalStrategies = await db.pedagogicalStrategy.find({});

          let counts = pedagogicalStrategies.map((ps, indice) => {
            let count = 0;
            ps.learningStyleDimensions.forEach((val) => {
              if(learningStyleDimensions.includes(val)){
                count++
              } 
            });
            return { index : indice, count: count };
          });

          var indice = counts.sort((a,b) => b.count - a.count)[0].index
          
          let pedagogicalStrategy = pedagogicalStrategies[indice];

          if (pedagogicalStrategy) {

            var foundR = false;

            let resource = null;

            if (traces.length > 0) {

              if (traces.length >= 3) {

                let assessments_academics = traces.map((trace) => {
                  if (trace.assessments[index]) {
                    return trace.assessments[index]
                  }
                });

                let resources_academics = traces.map((trace) => {
                  if (trace.resources[index]) {
                    return trace.resources[index]
                  }
                });

                assessments_academics = assessments_academics.filter((a_a) => a_a);
                resources_academics = resources_academics.filter((r_a) => r_a);
                
                if(assessments_academics.length > 0){

                  let ra = assessments_academics.reduce((prev, current) => 
                    (prev.like > current.like) ? prev : current 
                  )

                  let indexF = assessments_academics.indexOf(ra);

                  resource = await db.resource.findOne({
                    _id: resources_academics[indexF]
                  });
                } 

              } else {

                let _ids = [];

                traces.map(async (trace) => {
                  if (trace.assessments[index]) {

                    if (
                      trace.assessments[index].like > 3 &&
                      trace.resources[index] && 
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
                    structure: selectedStructure._id,
                  });

                }
              }
            } else {

              resource = await db.resource.findOne({
                pedagogicalStrategy: pedagogicalStrategy._id,
                structure: selectedStructure._id,
              });

            }

            if (resource) {
              return { resource: resource, rating: 0, time_use: 0 };
            }
          }
        })
      ).then(async (plan) => {
        
        let resources = [];

        plan.map(async (data, index) => {
          if (data && data.resource) {
            resources.push(data.resource._id);
          }
        });
        
        return { id_case: c._id, plan: plan };
      });
    }
  }

  async reviewCase(id_case, id_trace, success, error, time) {

    let caseS = await db.case.findById(id_case);

    if (caseS) {
      let uses = caseS.results.uses + 1;
      let timeSpend = 0;

      let trace = await db.trace.findOne({ _id: id_trace });

      if(trace.assessments){
        timeSpend = trace.assessments.reduce(function (accumulator, curValue) {
          if(curValue != null){
            return  accumulator + curValue.time_use;
          } else {
            return accumulator + 0;
          }
        }, caseS.euclideanWeight)
      } else {
        timeSpend = caseS.solution.resources.reduce(function (accumulator, curValue) {
          if(curValue != null){
            return  accumulator + curValue.time_use;
          } else {
            return accumulator + 0;
          }
        }, caseS.euclideanWeight)
      }
       
      let euclideanWeight = timeSpend / uses;

      if (success) {
        let success = caseS.results.success + 1;

        await db.case.findByIdAndUpdate(caseS._id, {
          $set: {
            "results.success": success,
            "results.uses": uses,
            "euclideanWeight": euclideanWeight
          },
        });
      } else if (error) {
        let errors = caseS.results.errors + 1;

        await db.case.findByIdAndUpdate(caseS._id, {
          $set: {
            "results.errors": errors,
            "results.uses": uses,
            "euclideanWeight": euclideanWeight
          },
        });
      }
    }
  }

  async storage(c, profile, trace) {
    this.metacoreInstance.setProfile(profile);
    this.metacoreInstance.setTrace(trace);
    this.metacoreInstance.setCases(c);
  }
}

let cbrInstance;
module.exports = function (metacore) {
  cbrInstance = cbrInstance || new CbrService(metacore);
  return cbrInstance;
};
