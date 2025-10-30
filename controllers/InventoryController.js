const Inventory = require('../models/Inventory'); // adjust path

// Add or update inventory by area+owner, aggregating product quantities
const addInventory = async (req, res) => {
  try {
    const { area, owner, products } = req.body;

    if (!area || !owner || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Area, owner, and products are required" });
    }

    // Normalize incoming products: ensure numbers and trimmed identifiers
    const incomingProducts = products.map((p) => ({
      productName: (p.productName || p.name || '').trim(),
      productCode: (p.productCode || p.code || '').trim(),
      quantity: Number(p.quantity) || 0,
      labelPrice: p.labelPrice,
      discount: p.discount,
      unitPrice: p.unitPrice,
    })).filter((p) => p.productName || p.productCode);

    if (incomingProducts.length === 0) {
      return res.status(400).json({ message: "At least one valid product is required" });
    }

    // Find existing inventory for the area+owner using normalized keys
    const areaKey = String(area).trim().toLowerCase();
    const ownerKey = String(owner).trim().toLowerCase();
    let inventory = await Inventory.findOne({ areaKey, ownerKey });

    if (!inventory) {
      // Create new inventory document
      inventory = new Inventory({ area: String(area).trim(), owner: String(owner).trim(), products: incomingProducts });
      await inventory.save();
      return res.status(201).json({ message: "Inventory added successfully", inventory });
    }

    // Merge quantities into existing inventory
    for (const inc of incomingProducts) {
      const incCode = (inc.productCode || '').trim().toLowerCase();
      const incName = (inc.productName || '').trim().toLowerCase();
      const idx = inventory.products.findIndex((ep) => {
        const epCode = (ep.productCode || '').trim().toLowerCase();
        const epName = (ep.productName || '').trim().toLowerCase();
        const codeMatch = incCode && epCode && epCode === incCode;
        const nameMatch = incName && epName && epName === incName;
        return codeMatch || nameMatch;
      });

      if (idx >= 0) {
        // Update quantity (sum) and optionally refresh price fields
        inventory.products[idx].quantity = Number(inventory.products[idx].quantity || 0) + Number(inc.quantity || 0);
        if (inc.labelPrice !== undefined) inventory.products[idx].labelPrice = inc.labelPrice;
        if (inc.discount !== undefined) inventory.products[idx].discount = inc.discount;
        if (inc.unitPrice !== undefined) inventory.products[idx].unitPrice = inc.unitPrice;
      } else {
        inventory.products.push(inc);
      }
    }

    await inventory.save();
    return res.status(200).json({ message: "Inventory updated successfully", inventory });
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
