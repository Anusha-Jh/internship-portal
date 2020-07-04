var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt= require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    regno: {type: Number, require: true},
	options: {
		type: Number, possibleValues: ['100503','100507','100511','100959','101296']},
	email: {type: String, require:true}
});
//hashing password using bcrypt
UserSchema.methods.hashPassword = function (password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(10))
}
UserSchema.methods.comparePassword = function (password,hash){
    return bcrypt.compareSync(password,hash)
}


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);