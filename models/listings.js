const mongoose=require("mongoose");
const listingSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    image:{
        
        filename:String,
        url:{
            type:String,
            default:"https://unsplash.com/photos/3d-render-modern-building-exterior-2MA8dFvOMec"

        }
        
    },
    price:{
        type:Number
    },
    location:{
        type:String
    },
    country:{
        type:String
    }
})
const list=mongoose.model("list",listingSchema);
module.exports=list;