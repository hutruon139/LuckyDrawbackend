const Family = require('../models/Family');

exports.getStats = async (req, res) => {
  try {
    const total = await Family.countDocuments();
    const group1 = await Family.countDocuments({ spinResult: 'group_1' });
    const group2 = await Family.countDocuments({ spinResult: 'group_2' });
    const group3 = await Family.countDocuments({ spinResult: 'group_3' });
    const group4 = await Family.countDocuments({ spinResult: 'group_4' });
    const prizeEligible = await Family.countDocuments({ prizeEligible: true });
    const prizeAwarded = await Family.countDocuments({ prizeAwarded: true });
    
    res.status(200).json({
      total,
      groups: { group1, group2, group3, group4 },
      prizes: { eligible: prizeEligible, awarded: prizeAwarded }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy thống kê', error: err.message });
  }
};