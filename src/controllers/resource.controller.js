const db = require("../models");

exports.all = (req, res) => {
    const resources = db.resource.findAll();
    res.send({ resources });
}

exports.one = (req, res) => {
    const resource = db.resource.findOne(req.query.id);

    if(!resource){
        res.status(500).send({ message: "Resource not found" });
    }

    res.send({ resource })
} 

exports.create = (req, res) => {
    const resource = new db.resource({
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        url: req.body.url,
        rating: req.body.rating,
        estimatedTime: req.body.estimatedTime
    });

    resource.save((err, resource) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.send({ message: "Resource created successful" });
    });
}

exports.update = (req, res) => {
    db.resource.findAndUpdate({ id: req.body.id }, { $set: { ...req.body }})
    .exec((err, resource) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send({ message: "Resource update successful" });
    });
}

exports.delete = (req, res) => {
    db.resource.findAndDelete({ id: req.body.id })
    .exec( (err, resource) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "Resource deleted successful "});
    })
}