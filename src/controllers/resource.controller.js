const db = require("../models");
const Resource = db.Resource;

exports.all = (req, res) => {
    const resources = Resource.findAll();
    res.send({ resources });
}

exports.one = (req, res) => {
    const resource = Resource.findOne(req.query.id);

    if(!resource){
        res.status(500).send({ message: "Resource not found" });
    }

    res.send({ resource })
} 

exports.create = (req, res) => {
    const resource = new Resource({
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
    Resource.findAndUpdate({ id: req.body.id }, { $set: { ...req.body }})
    .exec((err, resource) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send({ message: "Resource update successful" });
    });
}

exports.delete = (req, res) => {
    Resource.findAndDelete({ id: req.body.id })
    .exec( (err, resource) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "Resource deleted successful "});
    })
}