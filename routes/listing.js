const express=require("express");
const router=express.Router({mergeParams:true});
const list = require("../models/listings.js");
const wrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema }= require("../schema.js");
const {isLoggedIn,isOwner, saveRedirectUrl}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer')
const cloudinary=require("../cloudConfig.js")
const storage=multer.memoryStorage();
const upload = multer({ storage :storage});


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
  wrapAsync(listingController.index)
);
//NEW ROUTE
router.get(
  "/new",isLoggedIn,
  wrapAsync(listingController.renderNewForm)
);

//EDIT ROUTE
router.get(
  "/edit/:id",isLoggedIn,isOwner,
  wrapAsync(listingController.renderEditForm)
);

//READ ROUTE
router.get(
  "/:id",
  wrapAsync(listingController.showSingleListing)
);

//CREATE ROUTE
router.post(
  "/",isLoggedIn,validateListing,upload.single("image"),
  wrapAsync( listingController.createNewListing)
);




//UPDATE ROUTE
router.put("/:id", wrapAsync(listingController.updateListing));
//DELETE LISTING
router.delete("/:id",isLoggedIn,isOwner,listingController.deleteListing );


module.exports=router