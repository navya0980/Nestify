const express=require("express");
const router=express.Router({mergeParams:true});
const list = require("../models/listings.js");
const wrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema}= require("../schema.js");
const Review=require("../models/reviews.js");
const {isLoggedIn,isReviewOwner}=require("../middleware.js");




const validateReview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
  console.log(error);
  if(error){
    let errMsg=error.details.map((er)=>er.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();

  }
  
}


//POST REVIEWS
router.post("/",isLoggedIn,validateReview,wrapAsync(async(req,res)=>{
  let listing=await list.findById(req.params.id);
  let newReview=new Review(req.body);
  newReview.owner=req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success","Review is added");
  res.redirect(`/listings/${req.params.id}`)
}));

//DELETE REVIEW ROUTE
router.delete("/:reviewId",isLoggedIn,isReviewOwner,wrapAsync(async(req,res)=>{
  let{id,reviewId}=req.params;
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","Review is deleted");
  res.redirect(`/listings/${id}`)
}))

module.exports=router;