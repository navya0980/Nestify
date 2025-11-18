const Joi = require('joi');
const listingSchema=Joi.object({
    
        title:Joi.string().required(),
    description:Joi.string().required(),
    price:Joi.number().required(),
    location:Joi.string().required(),
    country:Joi.string().required(),
    image:{
        url:Joi.string().allow("",null)
    }
   
   
})
module.exports=listingSchema;