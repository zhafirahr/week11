const express = require('express');
const router = express.Router({mergeParams: true});
const mysqlConnection = require('../database');
const verify = require("../verifyToken");
const verifyrest = require("../verifyTokenRest");

//update using form
router.post("/update", verify, (req, res) => {
    mysqlConnection.query(
        "UPDATE blog set title = ?, description = ? WHERE blog_id= ?",
        [req.body.Title, req.body.description, req.params.blog_id], (err, rows, fields) => {
            !err ? res.redirect("/view") : console.log(err);
        }
    );
});

//update using endpoint api
router.patch("/update", verifyrest, (req, res) => {
    mysqlConnection.query(
        "UPDATE blog set title = ?, description = ? WHERE blog_id= ?",
        [req.body.title, req.body.description, req.params.blog_id], (err, rows, fields) => {
            !err ? res.json(rows) : res.json({message: err});
        }
    );
});



//Delete using form
router.get("/delete", verify, (req, res) => {
    mysqlConnection.query(
        "DELETE FROM blog WHERE blog_id = ?", [req.params.blog_id], (err, rows, fields) => {
            !err ? res.redirect("/view") : console.log(err);
        }
    );
});

//Delete using endpoint api
router.delete("/delete", verifyrest, (req, res) => {
    mysqlConnection.query(
        "DELETE FROM blog WHERE blog_id = ?", [req.params.blog_id], (err, rows, fields) => {
            !err ? res.json(rows) : res.json({message: err});
        }
    );
});

module.exports = router;
