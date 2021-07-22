const db = require("../models");
const axios = require('axios');
class CbrService {

    constructor(metacore){
        this.metacoreIntance(metacore);
    }

    metacoreIntance(metacore){
        return metacore;
    }
    
    performance(id_student, id_course, lessons){
        db.cases.find({ "context.id_student" : id_student }).lean().exec( (err, res) => {
            if (err) throw err;
            if(res.lenght > 0) {
                this.recovery(res);
            } else {
                let coincident = this.coincident(id_student, id_course, lessons);
    
                if(coincident){
                    this.recovery(coincident);
                } else {
                    this.create(id_student, id_course, lessons)
                }
            }
        });
    }

    coincident(id_student, lessons){
        //mongodb query avanced
        //do it how agreggation to get max use cases and success case;
        //1. equal learning style 2. equal lesson course  optionals 3. max use cases 4. success cases (true, false);
        db.cases.find({ "context.lessons" : { $in: lessons }  }).lean().exec( (err, res) => {
            if (err) throw err;
            if(res.lenght > 0) return res[0]._id;
        });
    }

    async recovery(cases){
        //call api python to k-nearest neighbours
        //1. cases tranform to dataset 2.call api python 3. filter the results
        let dataset = [];
        cases.map((c) => {
            dataset.push(
                [ c_id, c.euclideanWeight ]
            )
        })
        let response = await axios.post('http://localhost:5000/api/knn',  {
            query: 33,
            dataset: dataset
        })

        if(response.status == 200){
            console.log(response.body);
            let selectedCase = null;
            if(response.body.lenght > 1){
                selectedCase = this.filter(response.body, cases);
            } else {
                selectedCase = cases.filter(c => c._id == response.body[0]._id);
            }
            this.adapt(selectedCase);
        } else {
            throw response.errors
        }
        
    }

    filter(response){
        //reduce
        return response.reduce( (c, r) => r.euclideanWeight > c.euclideanWeight);
    }
    create(id_student, id_course, lessons){

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
        lessons.map(async lesson => {
            let knowledgePS = await db.KnowlegdePedagogicStrategy.find({ learningStyle: lesson.learningStyle });
            if(knowledgePS){
                let resource = await db.KnowlegdeResource.find({ pedagogicStrategy: knowledgePS.pedagogicStrategy });

                if(resource){
                    newCase.lessons.push(resource.id_lesson);
                }
            }
        })

        this.adapt(newCase);
    }

    //return to view like plan
    adapt(c){
        let plan = [];
        plan[0].case = { _id : c._id };
        c.solution.map(async e => {
            let resource = await db.resources.find({ lesson: e.lesson });
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