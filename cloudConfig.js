const cloudinary=require("cloudinary").v2;




    // Configuration
    cloudinary.config({ 
        cloud_name: 'defwuwmol', 
        api_key: '555427763498937', 
        api_secret: '7n7S6_7cEDd6CRG7-EjlcB1_xfs' // Click 'View API Keys' above to copy your API secret
    });
    
    // // Upload an image
    //  const uploadResult = await cloudinary.uploader
    //    .upload(
    //        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
    //            public_id: 'shoes',
    //        }
    //    )
    //    .catch((error) => {
    //        console.log(error);
    //    });
    
    // console.log(uploadResult);
    
    // // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url('shoes', {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });
    
    // console.log(optimizeUrl);
    
    // // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('shoes', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });
    
    // console.log(autoCropUrl);    

//     const {CloudinaryStorage} = require("multer-storage-cloudinary");
 
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params:{
//     folder:"Nestify-dev",
//     allowedFormat:["png","jpg","jpeg"]
//   }
// });

module.exports=cloudinary;

