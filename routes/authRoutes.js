const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const User=mongoose.model("User");
const jwt=require('jsonwebtoken');
require('dotenv').config();
const nodemailer=require('nodemailer');
const bcrypt=require("bcrypt")
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

 //forgot password

 router.post('/verifyfp',(req,res)=>{
    console.log('sent by client',req.body);
    const {email}=req.body;
    if(!email){
        return res.status(422).json({error:"Please add all the fields"})

    }
    User.findOne({email:email}).then( 
        async (savcedUser)=>{
            if(savcedUser){
                try {
                    let VerificationCode=Math.floor(100000+Math.random()*900000);
                    await mailer(email,VerificationCode);
                    res.send({message:"Verification Code Sent to your Email",VerificationCode,email})
                } 
                catch (error) {
                    console.log(error)
                    
                }
                
            }
            else{
                return res.status(422).json({error:"Invalid Credentials"})

            }
        })
   
})

router.post('/resetpassword',(req,res)=>{
    const{email,password}=req.body
    if(!email||!password){
        return res.status(422).json({error:"Please add all the fields"})
    }
    else{
        User.findOne({email:email})
        .then(async(savedUser)=>{
            if(savedUser){
            savedUser.password=password
            savedUser.save()
            .then(user=>{
                res.json({message:"Password Changed Successfully"})

            })
            .catch(err=>{
                console.log(err)
            })
        }
        else{
            return res.status(422).json({error:"Invalid Credentials"})
        }
        })
    }
})
router.post('/signin',(req,res)=>{
    const{ email,password}=req.body;
    if(!email||!password){
        return res.status(422).json({error:"Please add all the fields"})
    }
    else{
        User.findOne({email:email})
        .then(savedUser=>{
            if(!savedUser){
                return res.status(422).json({error:"Invalid Credentials"})
            }
            else{
                console.log(savedUser)
                bcrypt.compare(password,savedUser.password)
                .then(doMatch=>{
                    if(doMatch){
                        const token=jwt.sign({_id:savedUser._id},process.env.JWT_SECRET)
                        const{_id,username,email}=savedUser
                        res.json({message:"Successfully Signed In",token,user:{_id,username,email}})

                    }
                    else{
                        return res.status(422).json({error:"Invalid Credentials"})
                    }
                })
                // res.status(200).json({message:"User Logged In Successfully",savedUser})
            }
        })
        .catch(error=>{
            console.log(error)

        })
            
    }

})
// userdata
// router.post('/userdata',(req,res)=>{
//     const {email}=req.body
//     User.findOne({email:email}).then(savedUser=>{
//         if(!savedUser){
//             return res.status(422).json({error:"Invalid Credentials"})


//         }
//         else{
//             console.log(savedUser);
//             res.status(200).json({message:"User Found",user:savedUser})
//         }
//     })
// })
router.post('/userdata',(req,res)=>{
    const {authorization}=req.headers;
    if(!authorization){
        return res.status(401).json({error:"You must be logged in,token not given"})

    }
    const token=authorization.replace("Bearer ","")
    console.log(token)
    jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
       
        if(err){
            return res.status(401).json({error:"You must be logged in,token invalid"});
        }
       
        const {_id}=payload
        User.findById(_id).then(userdata=>{
            res.status(200).send({
                message:"User Found",
                user:userdata})
    })
    })
   
   

})

router.post('/changepassword',(req,res)=>{
    const {oldpassword,newpassword,email}=req.body
    if(!oldpassword||!newpassword||!email){
        return res.status(422).json({error:"Please add all the  fileds"})
    }
    else{
        User.findOne({email:email})
        .then(async savedUser=>{
            if(savedUser){
                bcrypt.compare(oldpassword,savedUser.password)
                .then(doMatch=>{
                    if(doMatch){
                        savedUser.password=newpassword
                        savedUser.save()
                        .then(user=>{
                            res.json({message:"Password Changed Successfully"})
                        })
                        .catch(err=>{
                            // console.log(err)
                        return res.status(422).json({error:"Server Error"})

                        })
                    }
                    else{
                        return res.status(422).json({error:"Invalid Credentials"})
                    }
                })
            }
        })
    }
})
// "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDliZjdkNzUyYjQ3ZTU3MzU4NzNlMGIiLCJpYXQiOjE2ODg1NDY1NDF9.sykmEOIewfePO8PWhyjbYdZWuU1e2CHZeUoL9XVviik"
router.post('/setusername',(req,res)=>{
    const {username,email}=req.body
    if(!username||!email){
        return res.status(422).json({error:"Please add all the fileds"})
    }
    User.find({username}).then(async (savedUser)=>{
        if(savedUser.length>0){
            return res.status(422).json({error:"Username already exists"})
        }
        else{
            User.findOne({email:email})
            .then(async savedUser=>{
                if(savedUser){
                    savedUser.username=username
                    savedUser.save()
                    .then(user=>{
                        res.json({message:"Username Updated Successfully"})
                    })
                    .catch(err=>{
                        return res.status(422).json({error:"Server Error"})
                    })
                }
                else{
                    return res.status(422).json({error:"Invalid Credentials"})
                }
            })

        }

    })

})
router.post('/setdescription',(req,res)=>{
    const {description,email}=req.body
    if(!description||!email){
        return res.status(422).json({error:"Please add all the fields"})
    }
    User.findOne({email:email}).then(async savedUser=>{
        if(savedUser){
            savedUser.description=description
            savedUser.save()
            .then(user=>{
            return res.json({message:"Description Updated Successfully"})
            
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
    // user search
    router.post('/searchuser',(req,res)=>{
        const {keyword}=req.body
        if(!keyword){
            res.status(422).json({error:"Please search a username"})
        }
        User.find({username:{$regex:keyword,$options:'i'}})
        .then(user=>{
            // console.log(user)
            // res.status(200).send({
            //     message:"User Found",
            //     user:user
            // })
            let data=[]
            user.map(item=>{
                data.push(
                    {
                        _id:item._id,
                        username:item.username,
                        email:item.email,
                        description:item.description,
                        profilepic:item.profilepic
                    }
                )
            })
            console.log(data)
            if(data.length==0){
                return res.status(422).json({error:"No User Found"})
            }
            res.status(200).send({
                message:"User Found",
                user:data
            })
        }).catch(err=>{
            res.status(422).json({error:"Server Error"})
        })
    })
// other userdata
    router.post('/otheruserdata',(req,res)=>{
        const {email}=req.body;

            User.findOne({email:email}).then(userdata=>{
                if(!userdata){
                    return res.status(422).json({error:"Invalid Credentials"})
                }
                let data={
                    _id:userdata._id,
                    username:userdata.username,
                    email:userdata.email,
                    description:userdata.description,
                    profilepic:userdata.profilepic,
                    posts:userdata.posts,
                    followers:userdata.followers,
                    following:userdata.following
                }
                res.status(200).send({
                    message:"User Found",
                    user:data
                })
        })
        })
       
       
    
  


module.exports=router;


// "$2b$08$c9l6OQA6I.6dgAcktFi/seLMER6.Cq1tLTihgWjiifq6Znv.HrWQS"