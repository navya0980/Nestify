const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");


const reviewRoute=require("./routes/review.js")
const listingRoute=require("./routes/listing.js")

app.listen(8080, () => {
  console.log("server is listening.....");
});
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("X-HTTP-Method-Override"));
app.use(methodOverride("_method"));
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "public")));

//ROUTES
app.use("/listings",listingRoute);
app.use("/listings/:id/reviews",reviewRoute)

main()
  .then(() => {
    console.log("conected...");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/nestify");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}










//ERROR MIDDLEWARE
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!!" } = err;
 
 
  res.status(status).render("../views/error.ejs", { message });
});


