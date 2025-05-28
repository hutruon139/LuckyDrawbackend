const Family = require('../models/Family');

exports.checkinFamily = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    
    // Check if family already exists
    const existingFamily = await Family.findOne({ name, phone });
    if (existingFamily) {
      return res.status(400).json({ message: 'Gia đình này đã check-in rồi!' });
    }
    
    const newFamily = new Family({ name, phone, email });
    await newFamily.save();
    res.status(201).json({ message: 'Check-in thành công', data: newFamily });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi check-in', error: err.message });
  }
};
