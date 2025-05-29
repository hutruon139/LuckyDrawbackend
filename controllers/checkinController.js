const Family = require('../models/Family');

exports.checkinFamily = async (req, res) => {
  try {
    const { name, phone: employeeId } = req.body; // phone field contains employeeId from frontend
    
    // Check if employee already exists
    const existingFamily = await Family.findOne({ employeeId });
    if (existingFamily) {
      return res.status(400).json({ message: 'Nhân viên này đã check-in rồi!' });
    }
    
    const newFamily = new Family({ name, employeeId });
    await newFamily.save();
    res.status(201).json({ message: 'Check-in thành công', data: newFamily });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi check-in', error: err.message });
  }
};  