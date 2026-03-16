const Account = require('../models/Account');

exports.createAccount = async (req, res) => {
  try {
    const { accountId, name, type, balance } = req.body;

    const account = new Account({
      accountId,
      name,
      type,
      balance: balance || 0
    });

    await account.save();
    res.status(201).json({ success: true, account });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().sort({ accountId: 1 }); 
    res.status(200).json({ success: true, accounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get single account by ID
exports.getAccountById = async (req, res) => {
  try {
    const account = await Account.findOne({ accountId: req.params.id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.status(200).json({ success: true, account });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update account
exports.updateAccount = async (req, res) => {
  try {
    const { name, type, balance } = req.body;

    const account = await Account.findOneAndUpdate(
      { accountId: req.params.id },
      { name, type, balance },
      { new: true }
    );

    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    res.status(200).json({ success: true, account });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({ accountId: req.params.id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    res.status(200).json({ success: true, message: 'Account deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};