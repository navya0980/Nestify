const express=require("express");
const app=express();
const mongoose=require("mongoose");
const list=require("./models/listings.js")

app.listen(8080,()=>{
    console.log("server is listening.....");
})

main().then(()=>{
    console.log("conected...")
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nestify');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.get("/",(req,res)=>{
    res.send("working");
})