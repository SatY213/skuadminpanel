const mongoose = require("mongoose");
const subCollectionSchema = new mongoose.Schema({
  title: { type: String },
  picture: { type: String },
});

const collectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    picture: { type: String, default: "logo.png" },
    sub_collections: [subCollectionSchema],
    shop_ref: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  },
  { timestamps: true }
);

const Collection = mongoose.model("Collection", collectionSchema);

module.exports = Collection;
