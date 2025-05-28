const express = require('express');
const router = express.Router();
const { 
  getAllFamilies, 
  getFamilyById, 
  updateFamilySpin,
  updateChallengeProgress,
  deleteFamily, 
  markPrizeAwarded,
  resetFamily 
} = require('../controllers/familyController');

router.get('/', getAllFamilies);
router.get('/:id', getFamilyById);
router.patch('/:id', updateFamilySpin);  // For updating spin results
router.patch('/:id/challenge', updateChallengeProgress);  // For challenge updates
router.delete('/:id', deleteFamily);
router.patch('/:id/reset', resetFamily);
router.patch('/:id/prize', markPrizeAwarded); 

module.exports = router;