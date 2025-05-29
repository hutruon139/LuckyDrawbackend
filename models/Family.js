const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema({
  // Basic info
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  employeeId: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Timestamps
  checkInTime: { 
    type: Date, 
    default: Date.now 
  },
  
  // Spin results
  spinResult: {
    type: String,
    enum: ['group_1', 'group_2', 'group_3', 'group_4'],
    default: null
  },
  requiredChallenges: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  
  // Challenge tracking (for groups 2, 3, 4)
  challengesCompleted: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  challengesDone: [{
    challengeNumber: Number,
    completedAt: { type: Date, default: Date.now }
  }],
  
  // Prize status
  prizeEligible: {
    type: Boolean,
    default: false
  },
  prizeAwarded: {
    type: Boolean,
    default: false
  },
  
  // Admin notes
  notes: String,
  
}, {
  timestamps: true
});

// Indexes for better performance
FamilySchema.index({ name: 1, employeeId: 1 });
FamilySchema.index({ employeeId: 1 }, { unique: true }); // Employee ID should be unique
FamilySchema.index({ spinResult: 1 });
FamilySchema.index({ checkInTime: -1 });

// Method to check prize eligibility
FamilySchema.methods.checkPrizeEligibility = function() {
  if (this.spinResult === 'group_1') {
    // Free gift - always eligible
    this.prizeEligible = true;
  } else {
    // Check if completed required challenges
    this.prizeEligible = this.challengesCompleted >= this.requiredChallenges;
  }
  return this.prizeEligible;
};

// Static method to get families by spin result
FamilySchema.statics.findBySpinResult = function(group) {
  return this.find({ spinResult: group });
};

module.exports = mongoose.model('Family', FamilySchema);