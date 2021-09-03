const db = require("../models");

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
};

exports.all = async (req, res) => {
    const users = await db.user.find().populate({
        path: 'roles',
        select: 'name'
    });

    if(!users){
        res.status(500).send({ message: "Users not found" });
    }

    res.send(users);
}
