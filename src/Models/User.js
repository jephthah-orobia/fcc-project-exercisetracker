'use strict';
import { Schema, model } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }
},
    { collection: 'users' }
);

export default model('user', userSchema);