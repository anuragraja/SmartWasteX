const WasteUpload = require('../models/WasteUpload');
const WorkerTracking = require('../models/WorkerTracking');
const { analyzeWasteImage } = require('../services/aiService');

const FILL_TO_STATUS = { Empty: 'Empty', Low: 'Empty', Medium: 'Medium', Full: 'Full', Overflow: 'Overflow' };
const FILL_TO_QTY   = { Empty: 5, Low: 20, Medium: 50, Full: 80, Overflow: 100 };

exports.uploadWaste = async (req, res) => {
  try {
    const { area, lat, lng } = req.body;
    // Mock image URL for now
    let image = "https://images.unsplash.com/photo-1605600659873-d808a1d85715?w=500&auto=format&fit=crop&q=60";
    let aiResult = { fillLevel: 'Medium', confidence: null, reason: null };

    if (req.file) {
      image = `http://localhost:5000/uploads/${req.file.filename}`;
      aiResult = await analyzeWasteImage(req.file.path, req.file.mimetype);
    }

    const status   = FILL_TO_STATUS[aiResult.fillLevel] ?? 'Medium';
    const quantity = FILL_TO_QTY[aiResult.fillLevel]   ?? 50;

    const upload = await WasteUpload.create({
      image,
      area,
      status,
      quantity,
      uploadedBy: req.user.id,
      location: { lat, lng }
    });

    // Update worker tracking
    let tracking = await WorkerTracking.findOne({ worker: req.user.id });
    if (!tracking) {
      tracking = await WorkerTracking.create({
        worker: req.user.id,
        areasCovered: [area],
        uploadsCount: 1
      });
    } else {
      if (!tracking.areasCovered.includes(area)) {
        tracking.areasCovered.push(area);
      }
      tracking.uploadsCount += 1;
      tracking.lastActive = Date.now();
      await tracking.save();
    }

    res.status(201).json({
      success: true,
      data: upload,
      aiAnalysis: { status, quantity, confidence: aiResult.confidence, reason: aiResult.reason }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllUploads = async (req, res) => {
  try {
    const uploads = await WasteUpload.find().populate('uploadedBy', 'name');
    res.status(200).json({ success: true, data: uploads });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getWorkerUploads = async (req, res) => {
  try {
    const uploads = await WasteUpload.find({ uploadedBy: req.params.workerId }).populate('uploadedBy', 'name');
    res.status(200).json({ success: true, data: uploads });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAreaUploads = async (req, res) => {
  try {
    const uploads = await WasteUpload.find({ area: req.params.area }).populate('uploadedBy', 'name');
    res.status(200).json({ success: true, data: uploads });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
