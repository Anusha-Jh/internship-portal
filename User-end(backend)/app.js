//importing dependencies
var express  = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var User = require("./models/user");
var passport = require('passport');
var LocalStrategy  = require('passport-local');
var localStrategy = require('passport-local').Strategy;
var passportLocalMongoose  = require('passport-local-mongoose');
var session= require('express-session');
var createError = require('http-errors');

/*********************************************************************************************************************************************************** */

//database connection
mongoose.connect("mongodb://localhost/portaldata",{ useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));


/*********************************************************************************************************************************************************** */

app.use(session({
  secret:'thesecret',
  saveUninitialized:false,
  resave:false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(function(req, res, next) {
  next(createError(404));
});


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStrategy(function(username,password,done){
  User.findOne({username:username},function(err,doc){
      if(err) { done(err)}
      else {
          if(doc)  {
              var valid= doc.comparePassword(password,doc.password)
              if(valid){
                  done(null,{
                      username:doc.username,
                      password:doc.password
                  })
              }
              else{
               done(null,false) 
              }

          }
          else {
              done(null,false)
          }
      }
  })

}
))

//Setting Schemas

/******************************************* */
//setting up schema 2
var schema2 = new mongoose.Schema({
  taskname:{type: String},
  taskdetails:{type: String}
});

var Task = mongoose.model("Task",schema2);


/*********************************************************************************************************************************************************** */
//routes
app.get('/',(req,res)=>{
  res.send("Working");
});

/*SIGNUP MIGHT BE WRONG*/
app.post("/signup", function(req, res){
  User.register(new User({username: req.body.username}), req.body.password, function(err, user){
      if(err){
          console.log(err);
          return res.json('signup');
      }
      passport.authenticate("local")(req, res, function(){
         res.redirect("/dashboard");
      });
  });
});

// LOGIN ROUTES
//render login form
app.get("/login", function(req, res){
  res.json("login"); 
});
//login logic
//middleware
app.post("/login", passport.authenticate("local", {
   successRedirect: "/secret",
   failureRedirect: "/login"
}) ,function(req, res){
});

app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/");
});


function isLoggedIn(req, res, next){
   if(req.isAuthenticated()){
       return next();
   }
   res.redirect("/login");
}

app.get("/profile",(req, res)=>{
	User.find({},(err, result)=>{
	if (err) {
      res.json({
        status:400,
        success:false,
        message:err
      })
    }
    else{
          res.json(result);
    }
	});
});

app.get("/dashboard",(req,res)=>{
  Task.find({},(err,result)=>{
    if(err){
      res.json({
        status:400,
        success:false,
        message:err
      })
    }
    else{
      res.json(result);
    }
  })
})

app.get('/taskone', (req, res) => {
  var id=req.query.id;
  Task.findOne({"_id":id},(err, result) => {
    if (err) {
      res.json({
        status:400,
        success:false,
        message:err
      })
    }
    else{
    res.json(result);
    }
  })
})


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


/*********************************************************************************************************************************************************** */
var port = process.env.PORT || 4500;
app.listen(port, function(){
	console.log("server started");
});