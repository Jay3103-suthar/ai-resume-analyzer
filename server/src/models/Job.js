
const mongoose = require('mongoose');
const { Schema } = mongoose;

const JobSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  title: String,
  jdText: String,
  matchScore: Number,
  suggestions: Array
},{ timestamps:true });

module.exports = mongoose.model('Job', JobSchema);
