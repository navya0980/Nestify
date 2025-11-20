const express=require("express");
const router=express.Router({mergeParams:true});
const list = require("../models/listings.js");
const wrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema}= require("../schema.js");
const Review=require("../models/reviews.js");



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
router.post("/",validateReview,wrapAsync(async(req,res)=>{
  let listing=await list.findById(req.params.id);
  let newReview=new Review(req.body);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${req.params.id}`)
}));

//DELETE REVIEW ROUTE
router.delete("/:reviewId",wrapAsync(async(req,res)=>{
  let{id,reviewId}=req.params;
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`)
}))

module.exports=router;