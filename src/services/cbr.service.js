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
        return await db.case.find({ "context.id_student" : id_student })
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

        if(response.status == 200){
            let selectedCase = null;
            if(response.data.length){
                let item = response.data[response.data.length-1][1]
                selectedCase = await db.case.findOne({ _id: cases[item]._id }).populate({
                   path: 'solution.resources.resource',
                   model: 'Resource'
                });
            }
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
            resources: []
        }

        newCase.euclideanWight = 0;
        newCase.results = {
            uses : 0,
            success : 0,
            errors : 0,
        };
        
        let selectedLesson = await db.lesson.findById(mongoose.Types.ObjectId(id_lesson));

        //restructure
        if(resources && resources.length > 0){
            return Promise.all(structure.map(async (l, index) => {
                let selectedStructure = await db.structure.findById(mongoose.Types.ObjectId(l));
                let student = await db.student.findById(id_student).populate('learningStyleDimensions', '_id');
                let pedagogicalStrategy = await db.pedagogicalStrategy.findOne({ learningStyleDimensions: { $in: student.learningStyleDimensions } });
                if(pedagogicalStrategy){

                    let resource = null;

                    let traces = await db.trace.find({ student : id_student, lesson: selectedLesson._id });

                    if(traces){

                        if(traces.length == 3){
                            await db.trace.deleteMany({ id_student: id_student, lesson: selectedLesson._id });

                            resource = await db.resource.findOne({ pedagogicalStrategy: pedagogicalStrategy._id, structure: selectedStructure._id });

                        } else {

                            let _ids = [];

                            //TODO: fix resources when has a rating or time 
                            traces.map(async trace => {
                                
                                if(trace.assessments[index] && trace.assessments[index].rating > 3){
                                    let sr = await db.resource.findById(trace.resources[index]._id);
                                    console.log(sr);
                                    return resource = { resource: sr, rating: 0, time_use: 0 }
                                } else {
                                    if(trace.resources[index]){
                                        _ids.push(trace.resources[index]._id);
                                    }
                                }
                            })

                            resource = await db.resource.findOne({ _id: { $nin: _ids }, pedagogicalStrategy: pedagogicalStrategy._id, structure: selectedStructure._id });
                        } 

                        
                    } else {
                        resource = await db.resource.findOne({ pedagogicalStrategy: pedagogicalStrategy._id, structure: selectedStructure._id });
                    }

                    if(resource){
                        return { resource: resource, rating: 0, time_use: 0 };
                    }
                }
            })).then(r => {
                newCase.solution.resources = r;
                return newCase;
            });
        } else {
            return Promise.all(structure.map(async l => {
                let selectedStructure = await db.structure.findById(mongoose.Types.ObjectId(l));
                let student = await db.student.findById(id_student).populate('learningStyleDimensions', '_id');
                let pedagogicalStrategy = await db.pedagogicalStrategy.findOne({ learningStyleDimensions: { $in: student.learningStyleDimensions } });
                if(pedagogicalStrategy){
                    let resource = await db.resource.findOne({ pedagogicalStrategy: pedagogicalStrategy._id, structure: selectedStructure._id });
                    if(resource){
                        return { resource: resource, rating: 0, time_use: 0 };
                    }
                }
            })).then(r => {
                newCase.solution.resources = r;
                return newCase;
            });
        }
    }

    //return to view like plan
    async adapt(c){
        
        let plan = [];
        c.solution.resources.map(async data => {

            plan.push(data);
        })

        return { id_case : c._id, plan : plan };

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