const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema({
  firstname: { type: String },
  lastname: { type: String },
  phonenumber: { type: String, required: true },
  // email: {type: String}
});

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
