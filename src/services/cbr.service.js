const db = require("../models");
class CbrService {
    
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
        db.cases.find({ "context.lessons" : { $in: id_lesson }  }).lean().exec( (err, res) => {
            if (err) throw err;
            if(res.lenght > 0) return res[0]._id;
        });
    }

    recovery(cases){
        //call api python to k-nearest neighbours

        //1. cases tranform to dataset 2.call api python 3. filter the results
        // db.cases.findById(_id).exec((err, res) => {
        //     if (err) throw err;
        //     if(res) 
        // });
        this.adapt(result);
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
        c.solution.map(async e => {

            let resource = await db.resources.find({ id_lesson: e.id_lesson });

            //call assesment package to generate a new evaluation lesson
            if(resource.type == "assessment"){}
            //id for the case
            plan[0].case = { _id : e._id };
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
        } else if(error){
            db.cases.findByIdAndUpdate(id_case, 
                { $set: { "results.sucess" : "results.errors" + 1, "results.use" : "results.use" + 1 }
            });
        }

    }

    async storage(c, profile, trace){
        //call metacore services save case, profile, trace student
        this.metacore.setProfile(profile)
        this.metacore.setTrace(trace)
        this.metacore.setCases(c)
    }

}

module.exports = CbrService;