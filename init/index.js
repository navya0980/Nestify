const mongoose=require("mongoose");
const list=require("../models/listings.js");
const initData=require("./data.js")
console.log(list);
main().then(()=>{
    console.log("connected");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nestify');

}
const initDB=async()=>{
   await list.deleteMany();
   await list.insertMany(initData.data,);
}
initDB();