const mongoose = require("mongoose");

/**
 * Create a Mongoose Schema.
 */
const schemaInfo = new mongoose.Schema({
  version: String,
  load_date_time: { type: Date, default: Date.now },
});

/**
 * Create a Mongoose Model.
 */
const SchemaInfo = mongoose.model("SchemaInfo", schemaInfo);

/**
 * Make this available to our application.
 */
module.exports = SchemaInfo;

// await User.find();
// await User.find({}, { password: 0 })
// await User.findOne({ username: "duck" });
// await User.findById(userId);
// await User.find().select("_id first_name last_name");
// await User.deleteOne({ email: 'spam@gmail.com' });

