import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import user from './models/register-model.js';
// import { verifyToken } from './middlewares/verifyToken.js';
 
const app = express();

app.use((express.json()));
app.use((express.urlencoded({
    extended : true
})))

app.use((cors('*')));

let PORT = 5600;
let DATABASE_URI = 'mongodb+srv://vishnumothukuru:shopLane123@cluster0.bzxq47e.mongodb.net/shopLane?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(DATABASE_URI).then(()=>{
    app.listen(PORT, ()=>{
        console.log('Server connected to DB')
    })
}).catch(()=>{
    console.log('Server error')
})


app.post("/register", async (request, response) => {
    try {
        let { username, password, confirmPassword, email, mobile, location } = request.body;
        let exists = await user.findOne({ $or: [{ email }, { mobile }] });
        console.log(exists)
        if (exists) {
            return response.status(400).json({ message: 'user Already exists' })
        }
        else {
            let newuser = new user({
                email,
                username,
                mobile,
                password,
                confirmPassword,
                location : {
                    stateName : location.stateName,
                    cityName : location.cityName,
                    pincode : location.pincode
                }
            });
            await newuser.save();
            response.json({ message : 'Registered successfully' })
        }
    } catch (error) {
        console.log(error)
        response.status(400).json({ message : 'Registration error | Server Low !'})
    }
});

app.post("/login", async (request, response) => {
    try {
        let { email, password } = request.body;
        let exists = await user.findOne({email})
        if (!exists) {
            return response.status(400).json({ message: 'User Not found' })
        }
        if (exists.password != password) {
            response.status(400).json({ message: 'Password is incorrect ' })
        }
        let payload = {
            userid: exists.id,
            username: exists.username
        }

        let key = '9132b677f83c35b341e056a84e0c53b5d568e43b8005eed030c2a60c3cd6498c10df2312b7c428d7cb9126876d985a43b2b1d0f3fe3d23163531f9fb67e8019b';
        jwt.sign(payload, key, (err, token) => {
            if (err) {
                console.log('token error', err)
            }
            else {
                response.status(200).json({ 
                    message : 'Logged in successfully',
                    jwt : token,
                    username : exists.username })
            }
        })
    }
    catch (error) {
        console.log(error.data)
    }
})

export async function verifyToken(req, res, next) {
    try {
        let key = '9132b677f83c35b341e056a84e0c53b5d568e43b8005eed030c2a60c3cd6498c10df2312b7c428d7cb9126876d985a43b2b1d0f3fe3d23163531f9fb67e8019b';
        let token = req.headers.authorization;
        if (!token || token == undefined || token == null) {
            res.status(400).json({ tokenError: "token not found for verification" })
        }
        else {
            jwt.verify(token, key, (err, payload) => {
                if (err) {
                    console.log('verification error', err)
                }
                else {
                    req.payload = payload;
                    next();
                }
            })
        }
    }
    catch (error) {
        console.log(error, 'Decode error')
    }
}

app.get('/myprofile', verifyToken, async (request, response) => {
    try {
        let currentUser = await user.findOne({ _id: request.payload.userid })
        return response.status(200).json(currentUser)
    }
    catch (error) {
        console.log('user-Error', error)
    }

})

app.delete('/delete-account', verifyToken, async (request, response) => {
    try {
        await user.findByIdAndDelete(request.payload.userid)
        response.status(200).json({ deleteAccount: 'Account deleted successfully ' })
    }
    catch (error) {
        response.status(400).json({ error: 'sever error ! try after some time' })
    }
})
