const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Student = db.student;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        var student = new Student({
          name: req.body.name,
          lastname: req.body.lastname,
          user: user._id
        })
    
        student.save();

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {

  User.findOne({ email: req.body.email })
    .populate("roles", "-__v")
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var authorities = [];
      
      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }

      var signinData = {};

      if(authorities.includes('ROLE_USER')) {

        let student = await db.student.findOne({ user: user._id }).populate('learningStyleDimensions');

        console.log(student);

        signinData = { id: user.id, student_id: student.id, name: student.name, lastname: student.lastname, email: user.email, roles: authorities, learningStyleDimensions: student.learningStyleDimensions };
      } else {
        signinData = { id: user.id, email: user.email, roles: authorities }
      }
      
      var token = jwt.sign(signinData, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      //saver user session
      db.session.create({
        token: token,
        user_id: user._id,
        device: req.body.device,
        user_agent: req.body.userAgent
      })
      
      res.status(200).send({
        id: signinData.id,
        email: signinData.email,
        roles: signinData.roles,
        accessToken: token
      });
    });
};