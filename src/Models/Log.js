'use strict';
import { Schema, model } from "mongoose";
import Exercise from "./Exercise";
import User from "./User";

const logSchema = new Schema({
    user: {
        type: User,
        required: true
    },
    count: {
        type: Number,
        default: 1
    },
    log: [Exercise]
},
    { collection: 'logs' }
);

logSchema.virtual('username').get(function () { return this.user.username; });

logSchema.pre('update', function (next) {
    this.count++;
    next();
});

export default model('log', logSchema);