const express=require("express");
const app=express();
const session=require("express-session");
app.listen(3000,()=>{
    
})
app.use(session({
    secret:"navya"
}))


app.get("/test",(req,res)=>{
    res.send("success")
})

app.get("/abc",(req,res)=>{
    res.send("success")
})
