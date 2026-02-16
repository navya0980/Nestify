const mongoose=require("mongoose");
const {Schema}=mongoose;
const passportLocalMongoose=require("passport-local-mongoose")

const userSchema=new Schema({
    email:{
        type:String,
        unique:true,
        sparse:true
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true,
    },
    avatar:String,

})
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);

