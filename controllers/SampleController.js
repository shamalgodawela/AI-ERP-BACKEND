const asyncHandler = require('express-async-handler');
const Sample = require('../models/Sample');

// Add a new sample
const addSample = asyncHandler(async (req, res) => {
  const { ProductName, ProductCode, quantity, PackSize } = req.body;

  // Validation
  if (!ProductName || !ProductCode || !quantity || !PackSize) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Check if a sample with the same ProductCode already exists
  const existingSample = await Sample.findOne({ ProductCode });
  if (existingSample) {
    res.status(400);
    throw new Error("Sample with the same Product Code already exists");
  }

  // Create sample
  const sample = await Sample.create({
    ProductName,
    ProductCode,
    quantity,
    PackSize,
  });

  res.status(201).json({
    message: "Sample added successfully",
    sample
  });
});

// Get all samples
const getAllSamples = asyncHandler(async (req, res) => {
  const { ProductName, ProductCode } = req.query;
  let query = {};

  if (ProductName) {
    query.ProductName = { $regex: new RegExp(ProductName, 'i') };
  }
  if (ProductCode) {
    query.ProductCode = { $regex: new RegExp(ProductCode, 'i') };
  }

  const samples = await Sample.find(query).sort({ createdAt: -1 });
  
  res.status(200).json({
    count: samples.length,
    samples
  });
});

// Get a single sample by ID
const getSampleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sample = await Sample.findById(id);
  
  if (!sample) {
    res.status(404);
    throw new Error("Sample not found");
  }

  res.status(200).json(sample);
});

// Update a sample
const updateSample = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { ProductName, ProductCode, quantity, PackSize } = req.body;

  const sample = await Sample.findById(id);
  
  if (!sample) {
    res.status(404);
    throw new Error("Sample not found");
  }

  // Check if ProductCode is being changed and if it already exists
  if (ProductCode && ProductCode !== sample.ProductCode) {
    const existingSample = await Sample.findOne({ ProductCode });
    if (existingSample) {
      res.status(400);
      throw new Error("Sample with the same Product Code already exists");
    }
  }

  const updatedSample = await Sample.findByIdAndUpdate(
    id,
    {
      ProductName: ProductName || sample.ProductName,
      ProductCode: ProductCode || sample.ProductCode,
      quantity: quantity || sample.quantity,
      PackSize: PackSize || sample.PackSize,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "Sample updated successfully",
    sample: updatedSample
  });
});

// Delete a sample
const deleteSample = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sample = await Sample.findById(id);
  
  if (!sample) {
    res.status(404);
    throw new Error("Sample not found");
  }

  await Sample.findByIdAndDelete(id);

  res.status(200).json({
    message: "Sample deleted successfully"
  });
});

module.exports = {
  addSample,
  getAllSamples,
  getSampleById,
  updateSample,
  deleteSample
};
