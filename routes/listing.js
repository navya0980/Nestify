const express=require("express");
const router=express.Router({mergeParams:true});
const list = require("../models/listings.js");
const wrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema }= require("../schema.js");

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
  "/new",
  wrapAsync((req, res) => {
    res.render("../views/listings/new.ejs");
  })
);

//EDIT ROUTE
router.get(
  "/edit/:id",
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
    let singleList = await list.findById(id).populate("reviews");
    if(!singleList){
      next(new ExpressError(404,"Page Not Found"))
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
    
   
  
    await newListing.save();
 
    res.redirect("/listings");
  }
   
  )
);

//UPDATE ROUTE
router.put("/:id", async (req, res) => {
  let { id } = req.params;
  let listing = req.body;
  let newListing = await list.findByIdAndUpdate(id, listing, {
    runValidators: true,
    new: true,
  });

  res.redirect("/listings");
});
//DELETE LISTING
router.delete("/:id", async (req, res) => {
  let { id } = req.params;

 
 await list.findByIdAndDelete(id);
  res.redirect("/listings");
});


module.exports=router