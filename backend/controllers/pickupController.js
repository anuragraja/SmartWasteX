const PickupRequest = require('../models/PickupRequest');

exports.createRequest = async (req, res) => {
  try {
    const { area } = req.body;
    const request = await PickupRequest.create({
      area,
      requestedBy: req.user.id
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await PickupRequest.find()
      .populate('requestedBy', 'name')
      .populate('assignedWorker', 'name');
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { status, workerId } = req.body;
    let request = await PickupRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    if (status) request.status = status;
    if (workerId) request.assignedWorker = workerId;

    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
