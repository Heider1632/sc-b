const db = require("../models");
const axios = require('axios');
const mongoose = require("mongoose");
class CbrService {

    constructor(metacore){
        this.metacoreIntance(metacore);
    }

    metacoreIntance(metacore){
        return metacore;
    }
    
    async performance(id_student){
        return await db.case.find({ "context.id_student" : id_student }).populate({
            path: 'solution.resources.resource',
            model: 'Resource'
         });
    }

    async coincident(id_student, id_lesson, structure){

        let student = await db.student.findById(id_student);

        if(student.learningStyleDimensions.length === 0){
            return [];
        }

        structure = structure.map(l => l = mongoose.Types.ObjectId(l));
        //mongodb query avanced
        //do it how agreggation to get max use cases and success case;
        //1. equal learning style 2. equal lesson course  optionals 3. max use cases 4. success cases (true, false);
        return await db.case.aggregate([
            {
                $match: { "context.lesson" : {  $eq : id_lesson } }
            },
            { 
                $match: { "context.structure" : { $eq : structure } }
            },
            {
                $project: {
                    _id: "$_id",
                    euclideanWeight: "$euclideanWeight",
                }
            }
        ]);
    }

    async recovery(cases){
        //call api python to k-nearest neighbours
        //1. cases tranform to dataset 2.call api python 3. filter the results
        // eucledean weigth is average time spent by the student when he achieves the success
        //2. look the eucledean weigth after the user passed success case filter

        //. many case relationed with style learning
        // 1. select cases most success (major to not success case)
        // 2. filter the euclidean weigth with knn (select minor)
        // 
        let dataset = [];

        const results = Object.values(cases.reduce((r, o) => {
            r[o.results.success] = (r[o.results] && r[o.results.success].value > o.results.success) ? r[o.results.success] : o
            
            return r
        }, {}))
        

        results.map((c) => {
            dataset.push(
                [ c.euclideanWeight, Math.floor(Math.random() * 2) ]
            )
        })

        let response = await axios.post('http://localhost:5000/api/knn',  {
            query: 100,
            dataset: dataset
        })

        console.log("knn encontro el caso mas adecuado segun el peso euclidiano");

        if(response.status == 200){
            let selectedCase = null;

            if(response.data.length){
                let item = response.data[response.data.length-1][1]
                selectedCase = await db.case.findOne({ _id: cases[item]._id }).populate({
                   path: 'solution.resources.resource',
                   model: 'Resource'
                });
            }

            console.log(selectedCase);


            return selectedCase;
        } else {
            throw response.errors
        }
    }

    filter(response){
        return response.reduce( (c, r) => r.euclideanWeight > c.euclideanWeight);
    }

    async create(id_student, id_course, id_lesson, structure, resources){

        let newCase = {};
        
        newCase.context = {
            id_student: id_student,
            id_course: id_course,
            id_lesson: id_lesson,
            structure: structure
        }

        newCase.solution = {
            id_student: id_student,
            resources: resources
        }
        //default euclidean weight is 100% because the selecion  in than minus of 100%
        newCase.euclideanWeight = 100;
        newCase.results = {
            uses : 0,
            success : 0,
            errors : 0,
        };

        let savedCase = await db.case.create(newCase);

        console.log("caso guardado exitosamente");
        
        return savedCase; 
    }

    //return to view like plan
    async adapt(c){

        console.log("paso a adapatar el caso segun tiempo y gusto");

        //select resources
        let selectedLesson = await db.lesson.findById(mongoose.Types.ObjectId(c.context.id_lesson));

        //select traces
        let traces = await db.trace.find({ student : c.context.id_student, lesson: selectedLesson._id }).populate('resources');

        //restructure
        if(c.solution.resources && c.solution.resources.length > 0){
            return Promise.all(c.context.structure.map(async (l, index) => {
                let selectedStructure = await db.structure.findById(mongoose.Types.ObjectId(l));
                let student = await db.student.findById(c.context.id_student).populate('learningStyleDimensions', '_id');
                let pedagogicalStrategy = await db.pedagogicalStrategy.findOne({ learningStyleDimensions: { $in: student.learningStyleDimensions } });
                if(pedagogicalStrategy){

                    var foundR = false;

                    let resource = null;

                    if(traces){

                        console.log(traces.length);

                        if(traces.length == 3){

                            //TODO: validate trace to get the best resources do it in in base to (assessment, like, time_use)

                            //TODO: 10 estudiantes del mismo estilo de aprendizaje, excel (estudiante por evaluacion)
                            // inventar trazar por estudiantes para validar la seleccion de recursos 
                            await db.trace.deleteMany({ student: c.context.id_student, lesson: selectedLesson._id });
                            foundR = false;
                            resource = await db.resource.findOne({ pedagogicalStrategy: pedagogicalStrategy._id, structure: selectedStructure._id });

                        } else {

                            let _ids = [];

                            //TODO: fix resources when has a rating or time
                            traces.map(async trace => {
                                if(trace.assessments[index]){

                                    console.log("trace encontrada exitosamente");

                                    console.log("like" + trace.assessments[index].like);
                                    console.log("tiempo usado" + trace.assessments[index].time_use);
                                    console.log("tiempo esperado" + trace.resources[index].estimatedTime);

                                    if(trace.assessments[index].like > 3 && trace.assessments[index].time_use >= trace.resources[index].estimatedTime){
                                        console.log("resource recovery");
                                        
                                        let sr = await db.resource.findById(trace.resources[index]._id);
                                        foundR = true;
                                        resource = { resource: sr, rating: 0, time_use: 0 };
                                        
                                    } else {

                                        foundR = false;
                                        if(trace.resources[index]){
                                            _ids.push(trace.resources[index]._id);
                                        }
                                    }
                                    
                                } else {
                                    if(trace.resources[index]){
                                        _ids.push(trace.resources[index]._id);
                                    }
                                }
                            })

                            console.log(foundR);
                            
                            if(foundR == false){
                                console.log("no encontro recurso que cumpliera las condiciones de gusto y tiempo: paso a buscar uno de los existentes")
                                resource = await db.resource.findOne({ _id: { $nin: _ids }, pedagogicalStrategy: pedagogicalStrategy._id, structure: selectedStructure._id });
                            }

                        } 

                        
                    } else {

                        console.log("traces not found");

                        resource = await db.resource.findOne({ pedagogicalStrategy: pedagogicalStrategy._id, structure: selectedStructure._id });
                    }

                    if(resource){
                        return { resource: resource, rating: 0, time_use: 0 };
                    }
                }
            })).then(async plan => {
                let resources = [];
                plan.map(async (data, index) => {
                    if(data && data.resource){
                        resources.push(data.resource._id);
                    }
                })
                await db.case.updateOne({ _id: c._id },  { $set: { "solution.resources" : resources } });
                return { id_case : c._id, plan : plan };
            });
        } else {
            return Promise.all(c.context.structure.map(async (l, index) => {
                let selectedStructure = await db.structure.findById(mongoose.Types.ObjectId(l));
                let student = await db.student.findById(c.context.id_student).populate('learningStyleDimensions', '_id');
                let pedagogicalStrategy = await db.pedagogicalStrategy.findOne({ learningStyleDimensions: { $in: student.learningStyleDimensions } });
                if(pedagogicalStrategy){

                    var foundR = false;

                    let resource = null;

                    if(traces){

                        //TODO: conditions under time, 
                        if(traces.length == 3){
                            await db.trace.deleteMany({ id_student: c.context.id_student, lesson: selectedLesson._id });

                            resource = await db.resource.findOne({ pedagogicalStrategy: pedagogicalStrategy._id, structure: selectedStructure._id });

                        } else {

                            let _ids = [];

                            //TODO: fix resources when has a rating or time
                            traces.map(async trace => {
                                if(trace.assessments[index]){
                                    if(trace.assessments[index].rating > 3 && trace.assessments[index].time_use >= trace.resources[index].estimatedTime){
                                        console.log("resource recovery");
                                        
                                        let sr = await db.resource.findById(trace.resources[index]._id);
                                        foundR = true;
                                        resource = { resource: sr, rating: 0, time_use: 0 };
                                        
                                    } else {

                                        foundR = false;
                                        if(trace.resources[index]){
                                            _ids.push(trace.resources[index]._id);
                                        }
                                    }
                                    
                                } else {
                                    if(trace.resources[index]){
                                        _ids.push(trace.resources[index]._id);
                                    }
                                }
                            })
                            
                            if(foundR == false){
                                resource = await db.resource.findOne({ _id: { $nin: _ids }, pedagogicalStrategy: pedagogicalStrategy._id, structure: selectedStructure._id });
                            }

                        } 

                        
                    } else {

                        console.log("traces not found");

                        resource = await db.resource.findOne({ pedagogicalStrategy: pedagogicalStrategy._id, structure: selectedStructure._id });
                    }

                    if(resource){
                        return { resource: resource, rating: 0, time_use: 0 };
                    }
                }
            })).then(async plan => {
                let resources = [];
                plan.map(async (data, index) => {
                    if(data && data.resource){
                        resources.push(data.resource._id);
                    }
                })
                await db.case.updateOne({ _id: c._id },  { $set: { "solution.resources" : resources } });
                return { id_case : c._id, plan : plan };
            });
        }
       

    }

    async reviewCase(id_case, success, error) {

        let caseS = await db.case.findById(id_case);

        if(caseS){

            let uses = caseS.results.uses + 1;

            if(success){
                let success = caseS.results.success + 1;
                console.log(success);

                await db.case.findByIdAndUpdate(id_case,
                    { $set: { "results.sucess" : success, "results.use" : uses }
                });
            } else if(error){
                let errors = caseS.results.errors + 1;
                await db.case.findByIdAndUpdate(id_case,
                    { $set: { "results.errors" : errors, "results.use" : uses }
                });
            }
        }
        

    }

    async storage(c, profile, trace){
        //call metacore services save case, profile, trace student
        this.metacoreInstance.setProfile(profile)
        this.metacoreInstance.setTrace(trace)
        this.metacoreInstance.setCases(c)
    }

}

let cbrInstance;
module.exports = function(metacore) {
    cbrInstance = cbrInstance || new CbrService(metacore);
    return cbrInstance;
};