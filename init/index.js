const mongoose=require("mongoose");
const list=require("../models/listings.js");
const initData=require("./data.js")

main().then(()=>{
    console.log("connected");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nestify');

}
const initDB=async()=>{
   await list.deleteMany();
   
   initData.data=initData.data.map((obj)=>({...obj,owner:"6921cd221da6f6a6e7f4e456"}))
   await list.insertMany(initData.data);

}
initDB();