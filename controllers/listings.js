const list = require("../models/listings");
const cloudinary = require("../cloudConfig.js");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res, next) => {
  try {
    const allListings = await list.find({});
    res.render("listings/index.ejs", { allListings });
  } catch (error) {
    next(error);
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.renderEditForm = async (req, res, next) => {
  try {
    let { id } = req.params;
    let listing = await list.findById(id);
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace(
      "/upload/",
      "/upload/h_100,w_100/",
    );
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  } catch (error) {
    next(error);
  }
};

module.exports.showSingleListing = async (req, res, next) => {
  try {
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
      return next(new Error("Listing not found"));
    }
    res.render("listings/singleList.ejs", { singleList });
  } catch (error) {
    next(error);
  }
};

// module.exports.createNewListing = async (req, res, next) => {
//   const city=req.body.location;
//   const country=req.body.country;
//   let geometry=[];
//   var config = {
//   method: 'get',
//   url: `https://api.geoapify.com/v1/geocode/search?city=${city}&country=${country}&type=locality&apiKey=${process.env.MAP_TOKEN}`,
//   headers: { }
// };

// axios(config)
// .then(function (response) {
//  geometry=response.data.features[0].geometry.coordinates;
//  console.log(geometry);
// })
// .catch(function (error) {
//   next(new ExpressError(400,error));
// });
//   const result = await cloudinary.uploader.upload_stream(
//     { folder: "Nestify_uploads" },
//     async (error, result) => {

//       if (error) {
//         next(new ExpressError(500, error));
//       }
//       let newListing = new list(req.body);
//       newListing.owner = req.user._id;

//       newListing.image = {
//         url: result.secure_url,
//         filename: result.display_name,
//       };
//       newListing.geometry=geometry;
//       console.log(newListing.geometry);
//       let saved=await newListing.save();
//       console.log(saved);
//       // res.json({ url: result.secure_url });
//     }
//   );

//   result.end(req.file.buffer);

//   req.flash("success", "Listing is added");

//   res.redirect("/listings");
// };

module.exports.createNewListing = async (req, res, next) => {
  try {
    const city = req.body.location;
    const country = req.body.country;

    // 1️⃣ Get coordinates from Geoapify
    const geoResponse = await axios.get(
      `https://api.geoapify.com/v1/geocode/search`,
      {
        params: {
          city,
          country,
          type: "locality",
          apiKey: process.env.MAP_TOKEN,
        },
      },
    );

    const geometry = geoResponse.data.features?.[0]?.geometry?.coordinates;
    if (!geometry) throw new ExpressError(400, "Location not found");

    // 2️⃣ Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "Nestify_uploads" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      stream.end(req.file.buffer);
    });

    // 3️⃣ Create and save the new listing
    const newListing = new list(req.body);
    newListing.owner = req.user._id;
    newListing.image = {
      url: uploadResult.secure_url,
      filename: uploadResult.original_filename,
    };
    newListing.geometry = geometry;

    const saved = await newListing.save();

    req.flash("success", "Listing added successfully");
    res.redirect("/listings");
  } catch (error) {
    next(new ExpressError(500, error.message || "Failed to create listing"));
  }
};

module.exports.updateListing = async (req, res, next) => {
  try {
    let { id } = req.params;
    let listing = req.body;

    if (req.file) {
      // Upload image to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Nestify_uploads" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(req.file.buffer);
      });

      // Update listing with new image
      let newListing = await list.findByIdAndUpdate(id, listing, {
        runValidators: true,
        new: true,
      });
      newListing.image = {
        url: uploadResult.secure_url,
        filename: uploadResult.original_filename,
      };
      await newListing.save();
    } else {
      // Update listing without image
      let newListing = await list.findByIdAndUpdate(id, listing, {
        runValidators: true,
        new: true,
      });
      await newListing.save();
    }

    req.flash("success", "Listing is updated");
    res.redirect("/listings");
  } catch (error) {
    next(new ExpressError(500, error.message || "Failed to update listing"));
  }
};

module.exports.deleteListing = async (req, res, next) => {
  try {
    let { id } = req.params;
    await list.findByIdAndDelete(id);
    req.flash("success", "Listing is deleted");
    res.redirect("/listings");
  } catch (error) {
    next(error);
  }
};

module.exports.getCategory = async (req, res, next) => {
  try {
    let { category } = req.params;
    let allListings = await list.find({ category });
    if (allListings.length != 0) {
      return res.render("listings/index.ejs", { allListings });
    }
    req.flash("error", "No data found");
    allListings = await list.find();
    res.render("listings/index.ejs", { allListings });
  } catch (error) {
    next(error);
  }
};

module.exports.searchListing=async(req,res,next)=>{
  try {
   let query=req.query.q;
    if (!query) {
      return res.redirect("/listings");
    }
    query=query.trim();

    // Case-insensitive regex search
    const allListings = await list.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { country: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ],
    });
    if (allListings.length != 0) {
      return res.render("listings/index.ejs", { allListings });
    }
    req.flash("error", "No data found");
    allListings = await list.find();
    res.render("listings/index.ejs", { allListings });
   
  } catch (err) {
   next(err);
  }
}
