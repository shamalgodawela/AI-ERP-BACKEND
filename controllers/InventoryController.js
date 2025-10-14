const Inventory = require('../models/Inventory'); // adjust path

// Add a new inventory
const addInventory = async (req, res) => {
  try {
    const { area, owner, products } = req.body;

    if (!area || !owner || !products || products.length === 0) {
      return res.status(400).json({ message: "Area, owner, and products are required" });
    }

    const newInventory = new Inventory({
      area,
      owner,
      products
    });

    await newInventory.save();

    res.status(201).json({ message: "Inventory added successfully", inventory: newInventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all inventories
const getAllInventories = async (req, res) => {
  try {
    const inventories = await Inventory.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(inventories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addInventory, getAllInventories };
