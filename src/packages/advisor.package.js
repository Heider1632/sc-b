
let instance = null;
class AdvisorPakage {

    constructor() {
        if (instance) return instance;
        instance = this;
        return instance;
    }
     
    static getInstance() {
        return instance || new AdvisorPackage();
    }
}