const express=require("express");
const router=express.Router({mergeParams:true});
const User=require("../models/users.js")
const passport=require("passport");
const list=require("../models/listings.js");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup",(req,res)=>{
    res.render("../views/users/signup.ejs");
})
router.post("/signup",async(req,res)=>{
    try{
        let {username,email,password}=req.body;
        let newUser=new User({email,username});
        let registeredUser= await User.register(newUser,password);
        req.login(registeredUser,async(err)=>{
            if(err){
                next(err)
            }else{
                req.flash("success","Welcome to nestify");
                res.redirect("/listings");
            }
        })
    }
    catch(e){
       req.flash("error",e.message);
        res.redirect("/signup");
    }  
})

router.get("/login",(req,res)=>{
    res.render("../views/users/login.ejs");
})
router.post("/login",saveRedirectUrl,passport.authenticate('local', { failureRedirect: '/login' ,failureFlash:true}),(req,res)=>{
    req.flash("success","Welcome Back!!");
  
    res.redirect(res.locals.redirectUrl);
})

router.get("/logout",(req,res,next)=>{
 req.logout(async(err)=>{
    if(err){
        next(err);
    }
    req.flash("success","You are loged out!!");
   res.redirect("/listings");
 })
})
module.exports=router;