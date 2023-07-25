const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const User=mongoose.model("User");
const Message=mongoose.model("Message");

const jwt=require('jsonwebtoken');
require('dotenv').config();
const nodemailer=require('nodemailer');
const bcrypt=require("bcrypt");
const { consumers } = require('nodemailer/lib/xoauth2');

router.post('/savemessagetodb', async(req,res)=>{
    const {senderid,message,roomid,recieverid}=req.body
    try {
        const newMessage=new Message({
            senderid,
            message,
            roomid,
            recieverid
        })
        await newMessage.save()
        res.send({
            message:"Message Saved Successfully"
        })
        
    } catch (error) {
        console.log('Error while saving meesage to db line 18 -',error)
        res.status(422).send(error.message)
    }
})
router.post('/getusermessage',async(req,res)=>{
    const {roomid}=req.body
    Message.find({roomid:roomid})
    .then(messages=>{
        res.send(messages)
    })
    .catch(err=>{
        console.log(err)
        res.status(422).send(err.message)
    })
})
router.post('/setusermessages',async (req,res)=>{
    const {ouruserid,fuserid,lastmessage,roomid}=req.body
    User.findOne({_id:ouruserid})
    .then(user=>{
        user.allmessages.map((item)=>{
            if(item.fuserid==fuserid){
                user.allmessages.pull(item.fuserid)
            }
        })
        const date=Date.now()
        user.allmessages.push({
            ouruserid,
            fuserid,
            lastmessage,
            roomid,
            date
        })
        user.save()
        res.status(200).send({message:"Message saved sucessfully"})
    }).catch(err=>{
        console.log('error updating all chats in line 61 -',err)
        res.status(422).send(err.message)
    })
})
router.post('/getusermessages',async(req,res)=>{
    const {userid}=req.body
    User.findOne({_id:userid})
    .then(user=>{
       res.send(user.allmessages)
    }).catch(err=>{
        console.log('error updating all chats in line 71 -',err)
        res.status(422).send(err.message)
    })
})

module.exports=router