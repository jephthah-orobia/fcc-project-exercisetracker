'use strict';
import { Schema, model } from "mongoose";
import LogEntry from "./LogEntry";
import User from "./User";

const logSchema = new Schema({
    user: {
        type: User,
        required: true
    },
    count: {
        type: Number,
        required: true,
    },
    log: [LogEntry]
},
    { collection: 'logs' }
);

logSchema.virtual('username').get(function () { return this.user.username; });

logSchema.pre('update', function (next) {
    this.count++;
    next();
});

export default model('log', logSchema);