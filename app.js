const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const list = require("./models/listings.js");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const wrapAsync = require("./utils/WrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema ,reviewSchema, validate}= require("./schema.js");
const Review=require("./models/reviews.js");

app.listen(8080, () => {
  console.log("server is listening.....");
});
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("X-HTTP-Method-Override"));
app.use(methodOverride("_method"));
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "public")));

main()
  .then(() => {
    console.log("conected...");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/nestify");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


const validateListing=(req,res,next)=>{
  let {error}=listingSchema.validate(req.body);
  if(error){
    let errMsg=error.details.map((er)=>er.message).join(",");
   next(new ExpressError(400,errMsg)) ;
  }else{
    next();

  }
  

}

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
//INDEX ROUTE
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await list.find({});
    
    res.render("../views/listings/index.ejs", { allListings });
  })
);
//NEW ROUTE
app.get(
  "/listings/new",
  wrapAsync((req, res) => {
    res.render("../views/listings/new.ejs");
  })
);

//EDIT ROUTE
app.get(
  "/listings/edit/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await list.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

//READ ROUTE
app.get(
  "/listings/:id",
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
app.post(
  "/listings",validateListing,
  wrapAsync(async (req, res) => {
    let newListing = new list(req.body);
    
   
  
    await newListing.save();
 
    res.redirect("/listings");
  }
   
  )
);

//UPDATE ROUTE
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let listing = req.body;
  let newListing = await list.findByIdAndUpdate(id, listing, {
    runValidators: true,
    new: true,
  });

  res.redirect("/listings");
});
//DELETE LISTING
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;

 
 await list.findByIdAndDelete(id);
  res.redirect("/listings");
});

//POST REVIEWS
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
  let listing=await list.findById(req.params.id);
  let newReview=new Review(req.body);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${req.params.id}`)
}));

//DELETE REVIEW ROUTE
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
  let{id,reviewId}=req.params;
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`)
}))


//ERROR MIDDLEWARE
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!!" } = err;
 
 
  res.status(status).render("../views/error.ejs", { message });
});


