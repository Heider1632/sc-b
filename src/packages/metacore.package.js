const db = require("../models");
const RecommenderService = require("../services/recommender.service");

//every time the user has a success login the metacore package is called
let instance = null;
class MetacorePackage  {

    constructor() {
        if (instance) return instance;
        instance = this;
        return instance;
    }
     
    static getInstance() {
        return instance || new MetacorePackage();
    }

    async getPlan(args){
        let recommenderService = new RecommenderService(this);
        return await recommenderService.recovery(args);
    }

    async review(args){
        let recommenderService = new RecommenderService(this);
        return await recommenderService.retrain(args);
    }

    async history(args){
        return await db.historyCase.create({
            student: args.id_student,
            trace: args.id_trace,
            was: args.was,
            note: args.note
        });
    }

}

module.exports = MetacorePackage;

