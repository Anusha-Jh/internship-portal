//importing dependencies
var express  = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var User = require("./models/user");
var Task = require("./models/task");
var passport = require('passport');
var LocalStrategy  = require('passport-local');
var passportLocalMongoose  = require('passport-local-mongoose');
var bcrypt= require('bcrypt-nodejs');
const { use } = require('passport');
const jwt = require("jsonwebtoken");

/*********************************************************************************************************************************************************** */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//database connection
//mongoose.connect("mongodb://localhost/portaldata",{ useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect("mongodb+srv://admindb:admindatabase@cluster0-vlwic.mongodb.net/portaldata", { useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());



/*********************************************************************************************************************************************************** */

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/*********************************************************************************************************************************************************** */
//routes
/*
app.get('/',(req,res)=>{
  res.send("working");
});
app.get("/signup", function(req, res){
  res.render("signup");
});*/
//SIGNUP 
app.post("/signup", function(req, res){
  var newuser = new User({
    username: req.body.username,
    regno: req.body.regno,
    options: req.body.options,
    email:req.body.email
  })
  User.register(newuser, req.body.password, function(err, user){
      if(err){
        res.json(err);         
      }
      passport.authenticate("local")(req, res, function(){
        res.json(user);
      });
  });
  
 
});

/*app.post("/signup", verifyToken,(req,res)=>{
  res.json({message:'token created'});
});
*/

// LOGIN ROUTES
//render login form
/*
app.get("/login", function(req, res){
  res.json("login"); 
});*/

//login logic
//middleware
// app.post("/login", passport.authenticate("local", {
//    successRedirect: "/dashboard",
//    failureRedirect: "/login"
// }) ,function(req, res){ŚŚ
// });

//to send the data as the payload
/*jwt.sign({User},'secretkey',(err,token)=>{
  res.json({
    token
  });

});*/
//format of the token will be Authorisation:Bearer <token>
//verify token
function verifyToken(req,res,next){
  const token= req.headers['authorization'];
  if(typeof token !=='undefined'){
    jwt.verify(token,'secretkey',(err,payload) => {
      if(err) return res.sendStatus(400)

      console.log(payload)
      req.user = payload
      next()
    })
  } else{
    res.sendStatus(403);
  }
}


app.post("/login",(req,res)=>{
  var username= req.body.username;
  var password= req.body.password;

  
  //password is correct
  jwt.sign({username,password},'secretkey',(err,token)=>{
    res.json({
      token
    });
  
  });
 // console.log(username,password);
  /*if(username=="gp"&&password=="gp")
  {
    res.json({
      status:200,
      success:true,
      token:"gaifgdsdbsdfbdsfudsbfudb"
    })
  }
  else{
    res.json({
      status:400,
      success:false
    })
  }*/
})

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

app.get("/profile",verifyToken,(req, res)=>{
//   var token= req.body.token;
//   //if(token=="gaifgdsdbsdfbdsfudsbfudb")
// /*{	User.find({},(err, result)=>{
// 	if (err) {
//       res.json({
//         status:400,
//         success:false,
//         message:err
//       })
//     }
//     else{
//           res.json(result);
//     }
//   });}
// else{
//   res.json({
//     status:"404",
//     message:"Token Expired"
//   })
// }
 res.send(req.user.username)
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


/*********************************************************************************************************************************************************** */
var port = process.env.PORT || 3300;
app.listen(port, function(){
	console.log("server started");
});