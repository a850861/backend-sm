const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const User=mongoose.model("User");
const jwt=require('jsonwebtoken');
require('dotenv').config();
const nodemailer=require('nodemailer');
async function mailer(recieveremail,code){
    // console.log("Mailer function called")
    let transporter=nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:process.env.NodeMailer_email,
            pass:process.env.NodeMailer_password,
        },
    })

    let info=await transporter.sendMail({
        from:"SM",
        to:`${recieveremail}`,
        subject:"Email Verification",
        text:`Your verification code is${code}`,
        html:`<b>Your Verification Code is ${code}</b>`

    })
    console.log("Message sent:%s",info.messageId);
    console.log("Preview URL:%s",nodemailer.getTestMessageUrl(info));
}
// router.post('/verify',(req,res)=>{
//     console.log(req.body);
//     const {email}=req.body;
//     if(!email){
//         return res.status(422).json({error:"Please add all the fields"});

//     }
//     else{
//         User.findOne({email:email})
//         .then(async(saveduser)=>{
//             // console.log(saveduser)
//             // return res.status(200).json({message:"email sent"})
//             if(saveduser){
//                 return res.status(200).json({error:"invalid credentials"})

//             }
//             try {
//                 let VerificationCode=Math.floor(1000000+Math.random()*9000000)
//                 await mailer(email,VerificationCode);
//                 return res.status(200).json({message:"email sent",VerificationCode,email})
//             } catch (error) {
//                 return res.status(422).json({erro:"Error sending email"})
//             }
//         })
//         // return res.status(200).json({message:"email sent"})
//     }
  

// })
router.post('/verify',(req,res)=>{
    console.log('sent by client',req.body);
    const {email}=req.body;
    if(!email){
        return res.status(422).json({error:"Please add all the fields"})

    }
    User.findOne({email:email}).then( 
        async (savcedUser)=>{
            if(savcedUser){
                return res.status(422).json({error:"Invalid Credentials"})
            }
            try {
                let VerificationCode=Math.floor(100000+Math.random()*900000);
                await mailer(email,VerificationCode);
                res.send({message:"Verification Code Sent to your Email",VerificationCode,email})
            } catch (error) {
                console.log(error)
                
            }
        })
   
})
 router.post('/changeusername',(req,res)=>{
    const {username,email}=req.body;
    User.find({username}).then(async (savedUser)=>{
        if(savedUser.length>0 ){
            return res.status(422).json({error:'Username already exists'});
        }
        else{
            return res.status(200).json({message:'Username Available',username,email});

        }
    })
 })
 router.post('/signup',async(req,res)=>{
    const{username,password,email}=req.body
    if(!username||!password||!email){
        return res.status(422).json({error:"please add all the fileds"})
    }
    else{
        const user=new User({
            username,
            email,
            password,

        })
        try{
            await user.save();
            const token=jwt.sign({_id:user._id},process.env.JWT_SECRET)
            return res.status(200).json({message:"User Registered Succesfully",token})

        }
        catch(err){
            console.log(err)
            return res.status(422).json({error:"User Not Registered"})
        }
    }
 })

module.exports=router;