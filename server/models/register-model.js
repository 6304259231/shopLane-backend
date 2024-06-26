import mongoose from "mongoose";

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    mobile : {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    location: {
        stateName : {
           type : 'String',
           required : true
        },
        cityName : {
            type : 'String',
            required : true
        }, 
        pincode :{
            type : 'Number',
            required : true
        }
    },
})

export default mongoose.model('user' , userSchema)