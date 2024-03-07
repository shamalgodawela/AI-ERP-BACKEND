const OfficeInventory = require('../models/officeIn');

const addOfficeInventory = async (req, res) => {
  try {
    const {
      codeNumber,
      model,
      type,
      dateOfPurchase,
      value,
      warrantyPeriod,
      usedBy
    } = req.body;

    // Check if the codeNumber already exists
    const existingInventory = await OfficeInventory.findOne({ codeNumber });
    if (existingInventory) {
      return res.status(400).json({ error: 'Inventory with the same code number already exists' });
    }

    // Create a new Office Inventory document
    const newInventory = new OfficeInventory({
      codeNumber,
      model,
      type,
      dateOfPurchase,
      value,
      warrantyPeriod,
      usedBy
    });

    // Save the new Office Inventory document to the database
    await newInventory.save();

    res.status(201).json({ message: 'Office Inventory added successfully', inventory: newInventory });
  } catch (error) {
    console.error('Error adding Office Inventory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  addOfficeInventory
};
