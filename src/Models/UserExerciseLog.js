'use strict';
import mongoose, { Schema, model } from "mongoose";

const UserExerciseLogSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    log: [new Schema({
        description: String,
        duration: Number,
        date: {
            type: Date,
            default: Date.now
        }
    }, { _id: false })]
},
    {
        collection: 'UserExerciseLogs',
        virtuals: {
            last_exercise: {
                get() {
                    return {
                        _id: this._id,
                        username: this.username,
                        description: this.log[this.log.length - 1].description,
                        duration: this.log[this.log.length - 1].duration,
                        date: this.log[this.log.length - 1].date.toDateString(),
                    };
                }
            }
        }
    }
);

export default model('log', UserExerciseLogSchema);