const Family = require('../models/Family');

exports.getAllFamilies = async (req, res) => {
  try {
    const families = await Family.find().sort({ checkInTime: -1 });
    res.status(200).json(families);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách gia đình', error: err.message });
  }
};

exports.getFamilyById = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) return res.status(404).json({ message: 'Không tìm thấy gia đình' });
    res.status(200).json(family);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin gia đình', error: err.message });
  }
};

exports.updateFamilySpin = async (req, res) => {
  try {
    const { spinResult, requiredChallenges } = req.body;
    const family = await Family.findByIdAndUpdate(
      req.params.id,
      { 
        spinResult, 
        requiredChallenges,
        prizeEligible: requiredChallenges === 0 // Free gift is immediately eligible
      },
      { new: true }
    );
    
    if (!family) return res.status(404).json({ message: 'Không tìm thấy gia đình' });
    res.status(200).json({ message: 'Đã cập nhật kết quả spin', data: family });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật spin', error: err.message });
  }
};

exports.updateChallengeProgress = async (req, res) => {
  try {
    const { challengeNumber } = req.body;
    const family = await Family.findById(req.params.id);
    
    if (!family) return res.status(404).json({ message: 'Không tìm thấy gia đình' });
    
    // Check if challenge already completed
    const alreadyCompleted = family.challengesDone.some(c => c.challengeNumber === challengeNumber);
    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Thử thách này đã hoàn thành rồi' });
    }
    
    // Add challenge
    family.challengesDone.push({ challengeNumber });
    family.challengesCompleted = family.challengesDone.length;
    
    // Check prize eligibility
    family.checkPrizeEligibility();
    
    await family.save();
    res.status(200).json({ message: 'Đã cập nhật thử thách', data: family });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật thử thách', error: err.message });
  }
};

exports.deleteFamily = async (req, res) => {
  try {
    await Family.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xoá gia đình' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xoá', error: err.message });
  }
};

exports.resetFamily = async (req, res) => {
  try {
    const family = await Family.findByIdAndUpdate(
      req.params.id,
      {
        spinResult: null,
        requiredChallenges: 0,
        challengesCompleted: 0,
        challengesDone: [],
        prizeEligible: false,
        prizeAwarded: false,
        notes: ''
      },
      { new: true }
    );
    
    if (!family) return res.status(404).json({ message: 'Không tìm thấy gia đình' });
    res.status(200).json({ message: 'Đã reset thành công', data: family });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi reset', error: err.message });
  }
};

exports.markPrizeAwarded = async (req, res) => {
  try {
    const family = await Family.findByIdAndUpdate(
      req.params.id,
      { prizeAwarded: true },
      { new: true }
    );
    
    if (!family) return res.status(404).json({ message: 'Không tìm thấy gia đình' });
    res.status(200).json({ message: 'Đã đánh dấu đã trao giải', data: family });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật trao giải', error: err.message });
  }
};