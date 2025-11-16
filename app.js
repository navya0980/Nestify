const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const list=require("./models/listings.js")
const methodOverride=require("method-override");
const engine=require("ejs-mate")

app.listen(8080,()=>{
    console.log("server is listening.....");
})
app.use(express.urlencoded({extended:true}))
app.set("views","ejs");
app.set("views",path.join(__dirname,"views"))
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(methodOverride('_method'))
app.engine('ejs', engine);
app.use(express.static(path.join(__dirname,"public")))

main().then(()=>{
    console.log("conected...")
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nestify');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
//INDEX ROUTE
app.get("/listings",async(req,res)=>{
    const allListings=await list.find({});
    res.render("../views/listings/index.ejs",{allListings})
})
//NEW ROUTE
app.get("/listings/new",(req,res)=>{
    res.render("../views/listings/new.ejs");
})

//EDIT ROUTE
app.get("/listings/edit/:id",async(req,res)=>{
    let {id}=req.params;
    let listing=await list.findById(id);
    res.render("listings/edit.ejs",{listing})
})

//READ ROUTE
app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let singleList=await list.findById(id);
    res.render("../views/listings/singleList.ejs",{singleList})
})



//CREATE ROUTE
app.post("/listings",async(req,res)=>{
  let newListing=req.body;
  await list.insertOne(newListing);
  res.redirect("/listings");
  
})

//UPDATE ROUTE
app.put("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let listing=req.body;
    let newListing=await list.findByIdAndUpdate(id,listing,{runValidators:true,new:true})
   
    res.redirect("/listings")
})
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    await list.findByIdAndDelete(id);
    res.redirect("/listings");

})