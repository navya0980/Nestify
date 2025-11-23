const express=require("express");
const router=express.Router({mergeParams:true});
const User=require("../models/users.js")
const passport=require("passport");
const list=require("../models/listings.js")

router.get("/signup",(req,res)=>{
    res.render("../views/users/signup.ejs");
})
router.post("/signup",async(req,res)=>{
    try{
        let {username,email,password}=req.body;
        let newUser=new User({email,username});
        await User.register(newUser,password);
        req.flash("success","Welcome to nestify");
        res.redirect("/listings");
    }
    catch(e){
       req.flash("error",e.message);
        res.redirect("/signup");
    }  
})

router.get("/login",(req,res)=>{
    res.render("../views/users/login.ejs");
})
router.post("/login",passport.authenticate('local', { failureRedirect: '/login' ,failureFlash:true}),(req,res)=>{
    req.flash("success","Welcome Back!!");
    res.redirect("listings");
})

router.get("/logout",(req,res,next)=>{
 req.logout(async(err)=>{
    if(err){
        next(err);
    }
    req.flash("success","You are loged out!!");
    let allListings=await list.find({});
    res.render("../views/listings/index.ejs",{allListing})
 })
})
module.exports=router;