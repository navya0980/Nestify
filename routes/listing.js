const express=require("express");
const router=express.Router({mergeParams:true});
const list = require("../models/listings.js");
const wrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema }= require("../schema.js");
const {isLoggedIn,isOwner}=require("../middleware.js");

const validateListing=(req,res,next)=>{
  let {error}=listingSchema.validate(req.body);
  if(error){
    let errMsg=error.details.map((er)=>er.message).join(",");
   next(new ExpressError(400,errMsg)) ;
  }else{
    next();

  }
  

}


//INDEX ROUTE
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await list.find({});
    
    res.render("../views/listings/index.ejs", { allListings });
  })
);
//NEW ROUTE
router.get(
  "/new",isLoggedIn,
  wrapAsync((req, res) => {
   
      res.render("../views/listings/new.ejs");
    
   
  })
);

//EDIT ROUTE
router.get(
  "/edit/:id",isLoggedIn,isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await list.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

//READ ROUTE
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let singleList = await list.findById(id).populate("reviews").populate("owner");
    if(!singleList){
     req.flash("error","Listing you are looking for does not exist");
     res.redirect("/listings");
    }else{
      res.render("../views/listings/singleList.ejs", { singleList });
    }
        
    
  
    
  })
);

//CREATE ROUTE
router.post(
  "/",validateListing,
  wrapAsync(async (req, res) => {
    let newListing = new list(req.body);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","Listing is added");
    
    res.redirect("/listings");
  }
   
  )
);

//UPDATE ROUTE
router.put("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let listing = req.body;
  let newListing = await list.findByIdAndUpdate(id, listing, {
    runValidators: true,
    new: true,
  });

  req.flash("success","Listing is updated");
  res.redirect("/listings");
}));
//DELETE LISTING
router.delete("/:id",isLoggedIn,isOwner, async (req, res) => {
  let { id } = req.params;

 
 await list.findByIdAndDelete(id);
 req.flash("success","Listing is deleted");
  res.redirect("/listings");
});


module.exports=router