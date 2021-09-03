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

    async coincident(id_student, lessons){
        lessons = lessons.map(l => l = mongoose.Types.ObjectId(l));
        //mongodb query avanced
        //do it how agreggation to get max use cases and success case;
        //1. equal learning style 2. equal lesson course  optionals 3. max use cases 4. success cases (true, false);
        return await db.case.aggregate([
            { 
                $match: { "context.lessons" : { $in : lessons } }
            },
            { $group : { _id: null, max: { $max : "$results.success" } } }
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
        cases.map((c) => {
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
                let item = response.data[0][1]
                selectedCase = cases[item];
            }
            return selectedCase;
        } else {
            throw response.errors
        }
    }

    filter(response){
        return response.reduce( (c, r) => r.euclideanWeight > c.euclideanWeight);
    }

    async create(id_student, id_course, lessons){

        let newCase = {};
        
        newCase.context = {
            id_student: id_student,
            id_course: id_course, 
            lessons: lessons
        }

        newCase.solution = {
            id_student: id_student,
            lessons: []
        }

        newCase.euclideanWight = 0;
        newCase.results = {
            uses : 0,
            success : 0,
            errors : 0,
        };
        
        //get resources
        return Promise.all(lessons.map(async l => {
            let selectedLesson = await db.lesson.findById(mongoose.Types.ObjectId(l));
            let knowledgePS = await db.knowledgePedagogicalStrategy.findOne({ learningStyleDimensions: { $eq: selectedLesson.learningStyleDimensions } });
            if(knowledgePS){
                let kResource = await db.knowledgeResource.findOne({ pedagogicTactic: knowledgePS.pedagogicTactic }).populate('resource');
                if(kResource){
                    return kResource.resource;
                }
            }
        })).then(r => {
            newCase.solution.lessons = r;
            return newCase;
        })
    }

    //return to view like plan
    async adapt(c){
        let plan = [];
        c.solution.lessons.map(resource => {
            //call assesment package to generate a new evaluation lesson
            if(resource.type == "assessment"){}
            //id for the case
            plan.push({
                resource
            });
        })

        return plan;
    }

    async review(id_case, success, error) {
        if(success){
            db.cases.findByIdAndUpdate(id_case, 
                { $set: { "results.sucess" : "results.sucess" + 1, "results.use" : "results.use" + 1 }
            });
            // this.storage();
        } else if(error){
            db.cases.findByIdAndUpdate(id_case, 
                { $set: { "results.sucess" : "results.errors" + 1, "results.use" : "results.use" + 1 }
            });
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