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

  isValidCase(c, index, traces) {

    console.log("ejecutando metodo is valid case");
    console.log(c.solution.resources[index]);

    if(c.solution.resources[index]){
      console.log(c.solution.resources[index].resource);
      console.log(c.solution.resources[index].rating > 3);
    
      console.log(traces.length > 0);

      if(traces.length > 0){
        console.log(traces[traces.length - 1].resources[index]);
        console.log(c.solution.resources[index].time_use);
        console.log(traces[traces.length - 1].resources[index].estimatedTime);
      }

      
    }

    return (c.solution.resources[index] &&
      c.solution.resources[index].resource &&
      c.solution.resources[index].rating > 3 &&
      traces.length > 0 && 
      traces[traces.length - 1].resources[index] && 
      c.solution.resources[index].time_use >
          traces[traces.length - 1].resources[index].estimatedTime);
  }

  isValidResource(trace, index) {
    return (
      trace.assessments[index] &&
      trace.assessments[index].like > 3 &&
      trace.assessments[index].time_use >=
        trace.resources[index].estimatedTime
    );
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

  async adapt(c, id_student, id_lesson) {

    console.log("id_case");
    console.log(c._id);

    let selectedLesson = await db.lesson.findById(
      mongoose.Types.ObjectId(id_lesson)
    );
    
    console.log("lesson");
    console.log(selectedLesson);

    let traces = await db.trace
      .find({ student: id_student, lesson: selectedLesson._id })
      .populate("resources", 'estimatedTime');

    console.log("traces")
    console.log(traces);

    let student = await db.student
      .findById(id_student)
      .populate("learningStyleDimensions", "_id");

    console.log("student");
    console.log(student);

    let learningStyleDimensions = student.learningStyleDimensions.map(ls => ls._id);
    
    console.log("learningStyleDimensions");
    console.log(learningStyleDimensions);
  
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
  
    console.log("pedagogicalStartegy");
    console.log(pedagogicalStrategy);

    return Promise.all(
      c.context.structure.map(async (l, index) => {

        //skip evaluation
        if(index < 5){

          console.log("structure");

          let selectedStructure = await db.structure.findById(
            mongoose.Types.ObjectId(l)
          );

          console.log(selectedStructure);
  
          if(this.isValidCase(c, index, traces)){
  
            console.log("recurso seleccionado del caso");
            console.log(c.solution.resources[index].resource);
  
            return {
              resource: c.solution.resources[index].resource,
              time_use: 0,
              like: 0,
            };
          } else {
  
            console.log("recurso seleccionado de las condiciones");
  
            console.log(traces.length);
            console.log(traces);

            let resource = null;
  
            if(traces.length > 0){
  
              if (traces.length >= 3) {
  
                console.log("paso a buscar de la traza el mejor recurso");
  
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
  
                  if(resource == null){
                    resource = await db.resource.findOne({
                      pedagogicalStrategy: pedagogicalStrategy._id,
                      structure: selectedStructure._id,
                    });
                  }
                }
  
              } else {

                let foundR = false;
                let _ids = [];

                for (var i = 0; i < traces.length; i++) {
  
                  if(this.isValidResource(traces[i], index)){

                    console.log("recurso valido de la traza")

                    foundR = true;
                    resource = await db.resource.findById(
                      traces[i].resources[index]._id
                    );
                    
                    console.log(resource);

                    break;
                  } else {
                    foundR = false;
                    console.log("esta guardando los recursos vistos");
                    if (traces[i].resources[index]) {
                      console.log(traces[i].resources[index]._id);
                      _ids.push(traces[i].resources[index]._id);
                    }
                  }
                }
                
                console.log("validar esta variable");
                console.log(foundR);

                console.log(_ids);
    
                if (foundR == false) {
    
                  console.log("recurso no encontrado");
    
                  resource = await db.resource.findOne({
                    _id: { $nin: _ids },
                    pedagogicalStrategy: pedagogicalStrategy._id,
                    structure: selectedStructure._id,
                  });
                  
                  console.log("este es el recurso seleccionado del historial de las trazas");
                  console.log(resource);
    
                  if(resource == null){
    
                    console.log("no seleccion ninguno");
    
                    resource = await db.resource.findOne({
                      pedagogicalStrategy: pedagogicalStrategy._id,
                      structure: selectedStructure._id,
                    });
    
                    console.log(resource);
    
                  }
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
    ).then((plan) => {
      let resources = [];

      plan.map(async (data, index) => {
        if (data && data.resource) {
          resources.push(data.resource._id);
        }
      });

      console.log("plan");
      console.log(plan);

      console.log("resources");
      console.log(resources); 

      return { id_case: c._id, plan: plan };
    });
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
