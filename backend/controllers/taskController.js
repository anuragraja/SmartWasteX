const WorkerTask = require('../models/WorkerTask');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const SocietyRanking = require('../models/SocietyRanking');

exports.getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'worker') {
      query.worker = req.user.id;
    } else if (req.user.role === 'society_head') {
      if (req.user.area) {
        query.area = { $regex: new RegExp(`^${req.user.area}$`, 'i') };
      }
    }

    const tasks = await WorkerTask.find(query).populate('complaint worker assignedBy').sort('-createdAt');
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await WorkerTask.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    // Allow worker to update own task, or admin to update any
    if (req.user.role === 'worker' && task.worker.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this task' });
    }

    task.status = status;
    if (status === 'Completed') {
      task.completedAt = Date.now();
      
      // Update linked complaint
      if (task.complaint) {
        const complaint = await Complaint.findById(task.complaint);
        if (complaint) {
          complaint.status = 'Resolved';
          await complaint.save();

          // Improve society score slightly
          const ranking = await SocietyRanking.findOne({ area: { $regex: new RegExp(`^${task.area}$`, 'i') } });
          if (ranking) {
            ranking.cleanlinessReports += 1;
            ranking.score += 2;
            await ranking.save();
          }

          // Notify reporter
          const io = req.app.get('io');
          const notification = await Notification.create({
            user: complaint.reportedBy,
            title: 'Issue Resolved',
            message: `Your complaint for ${task.area} has been resolved by our worker.`,
            type: 'System'
          });
          io.to(complaint.reportedBy.toString()).emit('newNotification', notification);
        }
      }
    }

    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
