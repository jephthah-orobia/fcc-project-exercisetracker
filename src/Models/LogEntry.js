'use strict';
import { Schema, model } from "mongoose";

const logEntrySchema = new Schema({
    description: String,
    duration: Number,
    date: Date,
},
    { collection: 'logsEntries' }
);

export default model('logEntry', logEntrySchema);
