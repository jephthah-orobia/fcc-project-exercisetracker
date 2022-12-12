'use strict';
import { Schema, model } from "mongoose";
import User from "./User";

const exerciseSchema = new Schema({
    user: User,
    description: String,
    duration: Number,
    date: Date,
},
    { collection: 'exercises' }
);

export default model('exercise', exerciseSchema);
