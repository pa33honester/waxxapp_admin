const mongoose = require("mongoose");

const attributeFieldSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", required: true },
    image: { type: String, default: "", required: true },
    fieldType: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6],
      required: true,
    }, //1."Text Input", 2."Number Input", 3."File Input", 4."Radio", 5."Dropdown", 6."Checkboxes"
    values: {
      type: [String],
      default: [],
      // Only for: Dropdown, Radio, Checkboxes
    },
    minLength: {
      type: Number,
      default: 0,
      // Only for: Text Input, Number Input
    },
    maxLength: {
      type: Number,
      default: 0,
      // Only for: Text Input, Number Input
    },
    isRequired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
);

const attributesSchema = new mongoose.Schema(
  {
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", default: null },
    attributes: [attributeFieldSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Attributes", attributesSchema);
