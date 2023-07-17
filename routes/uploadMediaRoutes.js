const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const User=mongoose.model("User");
const jwt=require('jsonwebtoken');
require('dotenv').config();
const nodemailer=require('nodemailer');
const bcrypt=require("bcrypt")


router.post('/setprofilepic',(req,res)=>{
    const {email,profilepic}=req.body
    console.log("email",email)
    console.log("profilepic",profilepic)
    User.findOne({email:email}).then(async savedUser=>{
        if(savedUser){
            savedUser.profilepic=profilepic
            savedUser.save()
            .then(user=>{
            return res.json({message:"Profile pic updated successfully"})
            
            })
            .catch(err=>{
            return res.status(422).json({error:"Server Error"})

            })
            

        }
        else{
            return res.status(422).json({error:"Invalid Credentials"})
        }
    }) .catch(err=>{
        return res.status(422).json({error:"Server Error"})


    })

})
router.post('/addpost',(req,res)=>{
    const {email,post,postdescription}=req.body
    User.findOne({email:email}).then((savedUser)=>{
        if(!savedUser){
            return res.status(422).json({error:"Invalid Credentials"})
        }
        savedUser.posts.push({post,postdescription,likes:[],comments:[]})
        savedUser.save().then(user=>{
            res.json({message:"Post added successfully"})
        }).catch(err=>{
            res.json({error:"Error adding post"})
        })
        
    }).catch(err=>{
        console.log(err)
    })
})

module.exports=router