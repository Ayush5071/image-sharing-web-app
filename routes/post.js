const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
  user: {
    //reference liya hai user.js ki uski id yha save ho jayegi ...samjhe
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  title: String,
  description: String,
  likes: {
    type: Number,
    default: 0
  },
  image: String
});
module.exports = mongoose.model("post",postSchema);