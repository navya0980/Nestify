const express = require("express");
const app = express();
require("dotenv").config();

// Clean environment variables (remove quotes that might be in .env file)
const ATLASDB_URL = (process.env.ATLASDB_URL || "").trim().replace(/^"|"$/g, '');
const SESSION_SECRET = (process.env.SESSION_SECRET || "").trim();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;



const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const axios=require("axios");




const engine = require("ejs-mate");
const session=require("express-session");
const MongoStore = require('connect-mongo');

const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/users.js");
const list=require("./models/listings.js")
const configurePassport = require("./config/passportConfig.js");

const reviewRoute=require("./routes/review.js")
const listingRoute=require("./routes/listing.js")
const userRoute=require("./routes/user.js")

app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("X-HTTP-Method-Override"));
app.use(methodOverride("_method"));
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB first, then set up session
main()
  .catch((err) => {
    console.error("Server setup error:", err);
    process.exit(1);
  });

async function main() {
  if (!ATLASDB_URL) {
    console.error("ATLASDB_URL is not set!");
    process.exit(1);
  }
  await mongoose.connect(ATLASDB_URL);
  console.log("Connected to MongoDB");
  await setupServer();
}

async function setupServer() {
  // Validate required environment variables
  if (!ATLASDB_URL || !SESSION_SECRET) {
    console.error("Missing required environment variables!");
    process.exit(1);
  }
  
  let mongoStore;
  try {
    mongoStore = await MongoStore.create({
      client: mongoose.connection.getClient(),
      touchAfter: 24*3600
    });
  } catch (err) {
    console.error("Error creating MongoStore:", err.message);
    throw err;
  }
  
  const sessionOptions={
    store: mongoStore,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
      expiry: Date.now()+7*24*60*60*1000,
      maxAge: 7*24*60*60*1000,
    }
  }
  
  app.use(session(sessionOptions));
  app.use(flash());

  //passport middlewares
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport strategies
  configurePassport(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  
  app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
      next();
  })
  
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
      // Manually log the user in
      req.login(req.user, (err) => {
        if (err) {
          req.flash("error", "Failed to create session");
          return res.redirect("/login");
        }
        
        req.flash("success", "Welcome to Nestify!");
        res.redirect("/listings");
      });
    }
  );

  //ROUTES
  app.use("/listings",listingRoute);
  app.use("/listings/:id/reviews",reviewRoute)
  app.use("/",userRoute);

  //HOME ROUTE
  app.get("/",async(req,res)=>{
    const allListings=await list.find({});
    res.render("../views/listings/index.ejs",{allListings});  
  })

  //ERROR MIDDLEWARE
  app.use((err, req, res, next) => {
    // Check if headers have already been sent
    if (res.headersSent) {
      return next(err);
    }
    
    let { status = 500, message = "Something went wrong!!" } = err;
    
    res.status(status).render("error.ejs", { message }, (renderErr) => {
      if (renderErr) {
        res.status(status).send(`<h1>${status}</h1><p>${message}</p>`);
      }
    });
  });

  app.listen(8080, () => {
    console.log("Server is listening on port 8080");
  });
}






