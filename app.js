const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const engine = require("ejs-mate");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/users.js");

const reviewRoute=require("./routes/review.js")
const listingRoute=require("./routes/listing.js")
const userRoute=require("./routes/user.js")

app.listen(8080, () => {
  console.log("server is listening.....");
});
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("X-HTTP-Method-Override"));
app.use(methodOverride("_method"));
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions={
  secret:"nestify0980",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expiry:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
  }
}

app.use(session(sessionOptions));
app.use(flash());

//passport middlewares
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())


app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
    next();
})

//ROUTES
app.use("/listings",listingRoute);
app.use("/listings/:id/reviews",reviewRoute)
app.use("/",userRoute);

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


