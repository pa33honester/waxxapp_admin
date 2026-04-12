const Attributes = require("./attributes.model");

const mongoose = require("mongoose");

const fs = require("fs");

const { deleteFile } = require("../../util/deleteFile");

//create Subcategory-wise Attributes
exports.insertAttributes = async (req, res) => {
  try {
    console.log("req.body : ", req.body);

    const { subCategoryIds, name, fieldType, values, minLength, maxLength, isRequired, isActive } = req.body;

    if (!Array.isArray(subCategoryIds) || subCategoryIds.length === 0) {
      deleteFile(req.file);
      return res.status(200).json({
        status: false,
        message: "Please provide valid subCategoryIds and attribute details.",
      });
    }

    for (let id of subCategoryIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        deleteFile(req.file);
        return res.status(200).json({ status: false, message: `Invalid ObjectId: ${id}` });
      }
    }

    if (!name || typeof name !== "string") {
      deleteFile(req.file);
      return res.status(200).json({
        status: false,
        message: "Attribute name is required and must be a string.",
      });
    }

    const fieldTypeNum = Number(fieldType);
    const validFieldTypes = [1, 2, 3, 4, 5, 6];

    if (!validFieldTypes.includes(fieldTypeNum)) {
      deleteFile(req.file);
      return res.status(200).json({
        status: false,
        message: "Invalid fieldType. Must be one of 1–6.",
      });
    }

    const existing = await Attributes.find({
      subCategory: { $in: subCategoryIds },
      "attributes.name": name.trim(),
    }).lean();

    if (existing.length > 0) {
      deleteFile(req.file);
      return res.status(200).json({
        status: false,
        message: `Attribute "${name}" already exists for some subcategories.`,
      });
    }

    const preparedAttr = {
      name: name.trim(),
      image: req.file ? req.file.path : "",
      fieldType: fieldTypeNum,
      isRequired: String(isRequired).toLowerCase() === "true",
      isActive: String(isActive).toLowerCase() === "true",
      values: [],
      minLength: 0,
      maxLength: 0,
    };

    // For Dropdown/Radio/Checkboxes → expect values
    if ([4, 5, 6].includes(fieldTypeNum)) {
      if (!Array.isArray(values)) {
        deleteFile(req.file);
        return res.status(200).json({
          status: false,
          message: "Values array is required for selectable fieldTypes (4, 5, 6).",
        });
      }

      preparedAttr.values = values.map((v) => v.trim());
    }

    // For Text Input / Number Input → expect min/max length
    if ([1, 2].includes(fieldTypeNum)) {
      if (Number(minLength) > Number(maxLength) && Number(maxLength) > 0) {
        deleteFile(req.file);
        return res.status(200).json({
          status: false,
          message: `In attribute "${preparedAttr.name}", minLength cannot be greater than maxLength.`,
        });
      }

      preparedAttr.minLength = minLength;
      preparedAttr.maxLength = maxLength;
    }

    console.log("preparedAttr: ", preparedAttr);

    const insertOps = subCategoryIds.map((id) => ({
      subCategory: id,
      attributes: [preparedAttr],
      isActive: true,
    }));

    await Attributes.insertMany(insertOps);

    const result = await Attributes.find()
      .populate({
        path: "subCategory",
        select: "name category",
        populate: {
          path: "category",
          select: "name _id",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      message: "Attribute added successfully to selected subcategories.",
      attributes: result,
    });
  } catch (error) {
    deleteFile(req.file);
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update Subcategory-wise Attributes
exports.updateAttributes = async (req, res) => {
  try {
    console.log("req.body : ", req.body);

    const { attributeId, subCategoryId, name, fieldType, values, minLength, maxLength, isRequired, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(attributeId)) {
      deleteFile(req.file);
      return res.status(200).json({ status: false, message: "attributeId must be required." });
    }

    if (subCategoryId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
        return res.status(200).json({
          status: false,
          message: `Invalid subCategoryId: ${subCategoryId}`,
        });
      }
    }

    let parsedFieldType = fieldType !== undefined ? Number(fieldType) : undefined;
    const validFieldTypes = [1, 2, 3, 4, 5, 6];

    if (parsedFieldType !== undefined && !validFieldTypes.includes(parsedFieldType)) {
      deleteFile(req.file);
      return res.status(200).json({
        status: false,
        message: "Invalid fieldType. Must be one of: 1–6.",
      });
    }

    const existingAttr = await Attributes.findOne({
      "attributes._id": attributeId,
    });
    if (!existingAttr) {
      deleteFile(req.file);
      return res.status(200).json({ status: false, message: `Attribute not found.` });
    }

    const attributeIndex = existingAttr.attributes.findIndex((attr) => attr._id.toString() === attributeId);
    if (attributeIndex === -1) {
      deleteFile(req.file);
      return res.status(200).json({
        status: false,
        message: `Attribute not found in the array.`,
      });
    }

    const attribute = existingAttr.attributes[attributeIndex];

    if (name !== undefined) attribute.name = name.trim();
    if (parsedFieldType !== undefined) attribute.fieldType = parsedFieldType;

    // ✅ Fixed boolean conversion
    if (typeof isRequired !== "undefined") {
      attribute.isRequired = String(isRequired).toLowerCase() === "true";
    }
    if (typeof isActive !== "undefined") {
      attribute.isActive = String(isActive).toLowerCase() === "true";
    }

    if (req.file) {
      if (attribute.image) {
        const image = attribute?.image?.split("storage");
        if (image && fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }
      attribute.image = req.file.path;
    }

    if ([4, 5, 6].includes(attribute.fieldType)) {
      if (Array.isArray(values)) {
        attribute.values = values.map((v) => v.trim());
      }
    }

    if ([1, 2].includes(attribute.fieldType)) {
      if (minLength !== undefined && !isNaN(minLength)) {
        attribute.minLength = Number(minLength);
      }
      if (maxLength !== undefined && !isNaN(maxLength)) {
        attribute.maxLength = Number(maxLength);
      }
    }

    await existingAttr.save();

    return res.status(200).json({
      status: true,
      message: "Attribute and subcategory updated successfully.",
      existingAttr,
    });
  } catch (error) {
    deleteFile(req.file);
    console.error("updateAttributes error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//fetch attributes
exports.listAllAttributes = async (req, res) => {
  try {
    const { subCategoryId, fieldType } = req.query;

    const filter = {};

    if (subCategoryId && subCategoryId !== "All" && mongoose.Types.ObjectId.isValid(subCategoryId)) {
      filter.subCategory = subCategoryId;
    }

    if (fieldType && fieldType !== "All" && !isNaN(Number(fieldType))) {
      filter["attributes"] = {
        $elemMatch: { fieldType: Number(fieldType) },
      };
    }

    const attributes = await Attributes.find(filter)
      .populate({
        path: "subCategory",
        select: "name category",
        populate: {
          path: "category",
          select: "name _id",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      message: "Attributes retrieved successfully.",
      attributes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete particular attribute
exports.destroyAttribute = async (req, res) => {
  try {
    const { attributeId } = req.query;

    const deletedAttribute = await Attributes.findByIdAndDelete(attributeId);

    if (!deletedAttribute) {
      return res.status(200).json({ status: false, message: "Attribute not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Attribute deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
