const express = require("express");
const bodyparser = require("body-parser");
const cookieParser = require('cookie-parser')


var app = express();

app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);

app.use(bodyparser.json());
app.use(cookieParser());

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set("views", __dirname);

const createViewRoute = require('./Routes/create-view');

app.use('/', createViewRoute);

const updateDeleteRoute = require('./Routes/update-delete');

app.use('/:id', updateDeleteRoute);


app.listen(5000, () => {
  console.log("Express Server started at 5000");
});
