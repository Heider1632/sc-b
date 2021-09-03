
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
}