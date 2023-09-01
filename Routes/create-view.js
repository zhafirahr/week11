const express = require('express');
const router = express.Router();
const mysqlConnection = require('../database');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verify = require('../verifyToken')
const verifyrest = require('../verifyTokenRest')

const {registerValidation, loginValidation} = require('../validation')


//authview
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname , '../auth.html'));
});

//Signup using form
router.post("/signup", async (req, res) => {
    let emailExist = false;

    const {error} = registerValidation(req.body);
    if(error) return res.redirect('/?error=' + encodeURIComponent(error.details[0].message));

    mysqlConnection.query(
        "SELECT * FROM user WHERE email = ?",
        [req.body.Email], (err, rows, fields) => {
            rows.length ? emailExist=true : emailExist=false;
        }

    );

    //salting
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.Password, salt);

    if(!emailExist){
        mysqlConnection.query(
            "INSERT INTO user (email, password) VALUES (?,?)",
            [req.body.Email, hashedPassword], (err, rows, fields) => {
                !err ? res.redirect("/") : console.log(err);
            }
        );
    }else{
        return res.redirect('/?error=' + encodeURIComponent('Email already exists!'));
    }
});

//Signup using end-point API
router.post("/restsignup", async (req, res) => {

    let emailExist = false;

    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message)

    mysqlConnection.query(
        "SELECT * FROM user WHERE email = ?",
        [req.body.Email], (err, rows, fields) => {
            rows.length ? emailExist=true : emailExist=false;
        }

    );

    //salting
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.Password, salt);

    if(!emailExist){
        mysqlConnection.query(
            "INSERT INTO user (email, password) VALUES (?,?)",
            [req.body.Email, hashedPassword], (err, rows, fields) => {
                !err ? res.json(rows) : console.log(err);
            }
        );
    }else{
        res.send('email already exist!');
    }
});


//Login using form
router.post("/login", async (req, res) => {

    let user={};

    const {error} = loginValidation(req.body);
    if(error) return res.redirect('/?error=' + encodeURIComponent(error.details[0].message));

    mysqlConnection.query(
        "SELECT * FROM user WHERE email = ?",
        [req.body.Email], (err, rows, fields) => {
            rows.length ? user=rows[0] : user={};
        }

    );

    const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
    await sleep(1000);

    if(!user.email) return res.redirect('/?error=' + encodeURIComponent('Email doesnot exists'));

    const validPass = await bcrypt.compare(req.body.Password, user.password);
    if(!validPass) return res.redirect('/?error=' + encodeURIComponent('Invalid Password'));

    const token = jwt.sign({id: user.id}, process.env.TOKEN_SECRET);

    res.cookie('auth-token', token, { maxAge: 360000, httpOnly: true });

    res.redirect('/view');

});

//Login using end-point API
router.post("/restlogin", async (req, res) => {

    let user={};

    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    mysqlConnection.query(
        "SELECT * FROM user WHERE email = ?",
        [req.body.Email], (err, rows, fields) => {
            rows.length ? user=rows[0] : user={};
        }

    );

    const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
    await sleep(1000);

    if(!user.email) return res.status(400).send('Email doesnt exist');

    const validPass = await bcrypt.compare(req.body.Password, user.password);
    if(!validPass) return res.status(400).send('Invalid password');

    const token = jwt.sign({id: user.id}, process.env.TOKEN_SECRET, {expiresIn: "10h"});

    res.header('auth-token', token).send(token);

    //res.json({message: token});

});

//Fetch using form
router.get("/view", verify, (req, res) => {
    mysqlConnection.query("SELECT * FROM employee", (err, rows, fields) => {
        !err ? res.render(path.join(__dirname , '../view.html'), { data: rows }) : console.log(err);
    });
});


//Fetch using endpoint api
router.get("/restview", verifyrest, (req, res) => {
    mysqlConnection.query("SELECT * FROM employee", (err, rows, fields) => {
        !err ? res.json(rows) : console.log(err);
    });
});

//Insert using form
router.post("/create", verify, (req, res) => {
    mysqlConnection.query(
        "INSERT INTO employee (Name, EmpCode, Salary) VALUES (?,?,?)",
        [req.body.Name, req.body.EmpCode, req.body.Salary], (err, rows, fields) => {
            !err ? res.redirect("/view") : console.log(err);
        }
    );
});

//Insert using end-point API
router.post("/restcreate", verifyrest, (req, res) => {
    mysqlConnection.query(
        "INSERT INTO employee (Name, EmpCode, Salary) VALUES (?,?,?)",
        [req.body.Name, req.body.EmpCode, req.body.Salary], (err, rows, fields) => {
            !err ? res.json(rows) : console.log(err);
        }
    );
});

//Logout for form
router.post("/logout", verify, (req, res) => {
    res.clearCookie('auth-token');
    res.json({'loggedout': "logged out"});
});

module.exports = router;
