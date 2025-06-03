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

exports.assignSpinResult = async (req, res) => {
  try {
    const familyId = req.params.id;
    
    // Prize limits
    const limits = { group_1: 5, group_2: 45, group_3: 55, group_4: 15 };
    
    // Get current counts atomically
    const counts = await Promise.all([
      Family.countDocuments({ spinResult: 'group_1' }),
      Family.countDocuments({ spinResult: 'group_2' }),
      Family.countDocuments({ spinResult: 'group_3' }),
      Family.countDocuments({ spinResult: 'group_4' })
    ]);
    
    const currentCounts = {
      group_1: counts[0],
      group_2: counts[1], 
      group_3: counts[2],
      group_4: counts[3]
    };
    
    // 🎯 RIGGED SELECTION WITH WEIGHTS
    const availableGroups = [];
    
    // Add groups with remaining slots, with bias toward filling quotas
    if (currentCounts.group_1 < limits.group_1) {
      availableGroups.push(...Array(2).fill('group_1')); // Lower weight for prizes
    }
    if (currentCounts.group_2 < limits.group_2) {
      availableGroups.push(...Array(10).fill('group_2')); // Medium weight
    }
    if (currentCounts.group_3 < limits.group_3) {
      availableGroups.push(...Array(15).fill('group_3')); // Higher weight (most common)
    }
    if (currentCounts.group_4 < limits.group_4) {
      availableGroups.push(...Array(5).fill('group_4')); // Medium weight
    }
    
    // Fallback if all full
    const selectedGroup = availableGroups.length > 0 
      ? availableGroups[Math.floor(Math.random() * availableGroups.length)]
      : 'group_4';
    
    const challenges = selectedGroup === 'group_1' ? 0 
      : selectedGroup === 'group_2' ? 1
      : selectedGroup === 'group_3' ? 2 : 3;
    
    // Atomically update the family
    const family = await Family.findByIdAndUpdate(
      familyId,
      { 
        spinResult: selectedGroup,
        requiredChallenges: challenges,
        prizeEligible: challenges === 0
      },
      { new: true }
    );
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    
    res.json({ 
      message: 'Spin result assigned',
      data: family,
      group: selectedGroup,
      challenges: challenges
    });
    
  } catch (err) {
    res.status(500).json({ message: 'Error assigning spin result', error: err.message });
  }
};