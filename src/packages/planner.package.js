
let instance = null;
class PlannerPackage {
    constructor() {
        if (instance) return instance;
        instance = this;
        return instance;
    }
     
    static getInstance() {
        return instance || new PlannerPackage();
    }

    async getPlan(id_student, id_course, id_lesson, structure, resources){
        //conditional to active cbr (if)
        //else false
        let selectedCase;
        let cbrService = new CbrService(this);
        let selectedPerformance = await cbrService.performance(id_student);
        if(selectedPerformance.length > 0) {
            console.log("performance")
            selectedCase = await cbrService.recovery(selectedPerformance);
        } else {
            let coincident = await cbrService.coincident(id_student, id_lesson, structure);
            if(coincident.length > 0){
                console.log("coincident")
                selectedCase = await cbrService.recovery(coincident);
            } else {
                console.log("create")
                selectedCase = await cbrService.create(id_student, id_course, id_lesson, structure, resources)
            }
        }
        if(selectedCase){
            let plan = await cbrService.adapt(selectedCase);
            return plan;
        }
    }
}


module.exports = PlannerPackage;