const User = require('../models/User');
const WorkerTask = require('../models/WorkerTask');

exports.getWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' });
    
    // Attach stats to each worker
    let workerStats = await Promise.all(workers.map(async (worker) => {
      const tasks = await WorkerTask.find({ worker: worker._id });
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const totalTasks = tasks.length;
      const performance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
      const areas = [...new Set(tasks.map(t => t.area))];

      return {
        _id: worker._id,
        worker: { name: worker.name, email: worker.email },
        areasCovered: areas,
        uploadsCount: completedTasks,
        performance: performance,
        lastActive: worker.createdAt // Mocking last active
      };
    }));

    workerStats.sort((a, b) => b.performance - a.performance || b.uploadsCount - a.uploadsCount);
    workerStats = workerStats.map((w, index) => ({ ...w, ranking: index + 1 }));

    res.status(200).json({ success: true, data: workerStats });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await WorkerTask.find({ worker: req.user.id })
      .populate('complaint')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.acceptTask = async (req, res) => {
  try {
    const { estimatedTime } = req.body;
    const task = await WorkerTask.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (task.worker.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });

    task.status = 'Accepted';
    task.estimatedTime = estimatedTime;
    task.estimatedArrival = new Date(Date.now() + estimatedTime * 60000); // add minutes
    await task.save();

    // Notify public user
    const io = req.app.get('io');
    const complaint = await require('../models/Complaint').findById(task.complaint);
    if (complaint) {
      complaint.status = 'Assigned';
      await complaint.save();
      
      const Notification = require('../models/Notification');
      const notification = await Notification.create({
        user: complaint.reportedBy,
        title: 'Worker Accepted Task',
        message: `Worker will arrive in approx ${estimatedTime} minutes.`,
        type: 'Info'
      });
      io.to(complaint.reportedBy.toString()).emit('newNotification', notification);
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'In Progress', 'Completed', 'Failed'
    const task = await WorkerTask.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (task.worker.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });

    task.status = status;
    if (status === 'Completed') {
      task.completedAt = Date.now();
      
      // Update Analytics
      const WorkerAnalytics = require('../models/WorkerAnalytics');
      let analytics = await WorkerAnalytics.findOne({ worker: req.user.id });
      if (!analytics) analytics = await WorkerAnalytics.create({ worker: req.user.id });
      analytics.completedTasks += 1;
      await analytics.save();

      // Update complaint
      const complaint = await require('../models/Complaint').findById(task.complaint);
      if (complaint) {
        complaint.status = 'Resolved';
        await complaint.save();

        const io = req.app.get('io');
        const Notification = require('../models/Notification');
        const notification = await Notification.create({
          user: complaint.reportedBy,
          title: 'Task Completed',
          message: `Your complaint in ${complaint.area} has been resolved!`,
          type: 'Success'
        });
        io.to(complaint.reportedBy.toString()).emit('newNotification', notification);
      }
    }

    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getWorkerHistory = async (req, res) => {
  try {
    const tasks = await WorkerTask.find({ worker: req.params.workerId, status: 'Completed' })
      .populate('complaint')
      .sort('-completedAt');
      
    const formattedHistory = tasks.map(task => ({
      _id: task._id,
      image: task.complaint ? task.complaint.image : null,
      area: task.area,
      status: task.complaint ? (task.complaint.aiAnalysis?.wasteLevel || 'Cleaned') : 'Cleaned',
      createdAt: task.completedAt || task.updatedAt,
      verified: true
    }));

    res.status(200).json({ success: true, data: formattedHistory });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
