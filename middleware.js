const list=require("./models/listings.js")
const Review=require("./models/reviews.js")
module.exports.isLoggedIn=(req,res,next)=>{
      
        if(!req.isAuthenticated()){
            console.log(req.originalUrl)
            req.session.redirectUrl=req.originalUrl;
            req.flash("error","You need to log in!!");
            return res.redirect("/login");
    }
    next();
}
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        console.log(req.session.redirectUrl)
       
        res.locals.redirectUrl=req.session.redirectUrl 
    }else{
        res.locals.redirectUrl="/listings";
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
    let { id } = req.params;
    let listing = await list.findById(id);
    if(!(res.locals.currUser&&res.locals.currUser._id.equals(listing.owner._id))){
        req.flash("error","You are not permitted to make changes");
       return res.redirect(`/listings/${id}`);

    }
    next();
}

module.exports.isReviewOwner=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(!(res.locals.currUser&&res.locals.currUser._id.equals(review.owner._id))){
        req.flash("error","You are not authorized to delete review");
        return res.redirect(`/listings/${id}`);

    }
    next();

}