const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Friend = mongoose.model.Friends || mongoose.model("Friends", FriendSchema);

module.exports = mongoose.model("Friend", FriendSchema);