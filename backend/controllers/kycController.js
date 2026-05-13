const KYC = require('../models/KYC');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route POST /api/kyc/submit
// @access Private (Worker / Society Head)
exports.submitKYC = async (req, res) => {
  try {
    const { fullName, aadhaarNumber, address, mobile, area, profilePhotoUrl, documentUrl } = req.body;

    // Check if already submitted
    let existingKyc = await KYC.findOne({ user: req.user.id });
    if (existingKyc && existingKyc.status !== 'rejected') {
      return res.status(400).json({ success: false, error: 'KYC already submitted' });
    }

    if (existingKyc && existingKyc.status === 'rejected') {
      // update existing
      existingKyc.fullName = fullName;
      existingKyc.aadhaarNumber = aadhaarNumber;
      existingKyc.address = address;
      existingKyc.mobile = mobile;
      existingKyc.area = area;
      existingKyc.profilePhotoUrl = profilePhotoUrl;
      existingKyc.documentUrl = documentUrl;
      existingKyc.status = 'pending';
      existingKyc.submittedAt = Date.now();
      await existingKyc.save();
      return res.status(200).json({ success: true, data: existingKyc });
    }

    const kyc = await KYC.create({
      user: req.user.id,
      fullName,
      aadhaarNumber,
      address,
      mobile,
      area,
      role: req.user.role,
      profilePhotoUrl,
      documentUrl
    });

    res.status(201).json({ success: true, data: kyc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @route GET /api/kyc/status
// @access Private
exports.getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user.id });
    if (!kyc) {
      return res.status(200).json({ success: true, data: null });
    }
    res.status(200).json({ success: true, data: kyc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @route GET /api/kyc/all
// @access Admin
exports.getAllKYC = async (req, res) => {
  try {
    const kycs = await KYC.find({}).populate('user', 'email name role').sort('-submittedAt');
    res.status(200).json({ success: true, data: kycs });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @route PUT /api/kyc/:id/verify
// @access Admin
exports.verifyKYC = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be approved or rejected' });
    }

    const kyc = await KYC.findById(req.params.id);
    if (!kyc) return res.status(404).json({ success: false, error: 'KYC not found' });

    kyc.status = status;
    kyc.verifiedAt = Date.now();
    await kyc.save();

    if (status === 'approved') {
      const user = await User.findById(kyc.user);
      if (user) {
        user.kycVerified = true;
        user.profileImage = kyc.profilePhotoUrl;
        await user.save();
      }
    }

    // Notify user
    const io = req.app.get('io');
    const notification = await Notification.create({
      user: kyc.user,
      title: status === 'approved' ? 'KYC Approved ✅' : 'KYC Rejected ❌',
      message: status === 'approved' ? 'Your KYC has been verified successfully.' : 'Your KYC was rejected. Please re-submit.',
      type: 'Approval'
    });
    io.to(kyc.user.toString()).emit('newNotification', notification);

    res.status(200).json({ success: true, data: kyc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
