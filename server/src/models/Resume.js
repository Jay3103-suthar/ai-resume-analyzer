
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ResumeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  fileUrl: String,
  text: String,
  aiScore: Number,
  aiReport: Object
},{ timestamps:true });

module.exports = mongoose.model('Resume', ResumeSchema);
