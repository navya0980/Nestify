const list=require("../models/listings");
const cloudinary=require("../cloudConfig.js");


module.exports.index = async (req, res) => {
  const allListings = await list.find({});

  res.render("../views/listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("../views/listings/new.ejs");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await list.findById(id);
  res.render("listings/edit.ejs", { listing });
};

module.exports.showSingleListing = async (req, res, next) => {
  let { id } = req.params;
  let singleList = await list
    .findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "owner",
      },
    })
    .populate("owner");

  if (!singleList) {
    req.flash("error", "Listing you are looking for does not exist");
    res.redirect("/listings");
  } else {
    res.render("../views/listings/singleList.ejs", { singleList });
  }
};

module.exports.createNewListing=async (req, res,next) => {
  const result = await cloudinary.uploader.upload_stream(
    { folder: "Nestify_uploads" },
    async(error, result) => {
      console.log(result);
      if (error) {
           next(new ExpressError(500,error));
      }
       let newListing = new list(req.body);
    newListing.owner=req.user._id;


    newListing.image={url:result.secure_url,filename:result.display_name};
    await newListing.save();
         // res.json({ url: result.secure_url });
    },
    
   
  );
   
   result.end(req.file.buffer);
  
  
   
    req.flash("success","Listing is added");
    
    res.redirect("/listings");
  }

  module.exports.updateListing=async (req, res) => {
  let { id } = req.params;
  let listing = req.body;
  let newListing = await list.findByIdAndUpdate(id, listing, {
    runValidators: true,
    new: true,
  });

  req.flash("success","Listing is updated");
  res.redirect("/listings");
}

module.exports.deleteListing=async (req, res) => {
  let { id } = req.params;

 
 await list.findByIdAndDelete(id);
 req.flash("success","Listing is deleted");
  res.redirect("/listings");
};