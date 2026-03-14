const Doctor = require('../models/Doctor');
const AdminActivityLog = require('../models/AdminActivityLog');

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { action, targetType, limit = 50, skip = 0, startDate, endDate } = req.query;

    let filter = {};
    
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;
    
    if (startDate || endDate) {
      filter.timestamp = {};

      if (startDate) {
        const [y, m, d] = String(startDate).split('-').map(Number);
        if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
          filter.timestamp.$gte = new Date(y, m - 1, d, 0, 0, 0, 0);
        }
      }

      if (endDate) {
        const [y, m, d] = String(endDate).split('-').map(Number);
        if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
          filter.timestamp.$lte = new Date(y, m - 1, d, 23, 59, 59, 999);
        }
      }

      if (Object.keys(filter.timestamp).length === 0) {
        delete filter.timestamp;
      }
    }

    const logs = await AdminActivityLog
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await AdminActivityLog.countDocuments(filter);

    console.log('✅ Activity logs fetched:', logs.length, 'of', total);
    res.json({
      data: logs,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching logs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Clear old logs (flexible timeframe)
exports.clearOldLogs = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await AdminActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    // Log the activity
    try {
      await AdminActivityLog.create({
        adminId: req.user?._id || 'admin',
        action: 'SETTINGS_CHANGED',
        targetType: 'SYSTEM',
        details: { 
          action: 'LOG_PURGE',
          days,
          logsDeleted: result.deletedCount,
          cutoff: cutoffDate
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'SUCCESS'
      });
    } catch (logErr) {
      console.error('Failed to log activity:', logErr.message);
    }

    console.log(`✅ Logs older than ${days} days cleared:`, result.deletedCount);
    res.json({
      message: `${result.deletedCount} logs older than ${days} days deleted`,
      deleted: result.deletedCount,
      days
    });
  } catch (error) {
    console.error('❌ Error clearing logs:', error);
    res.status(500).json({ error: error.message });
  }
};


// Get system statistics
exports.getSystemStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const approvedDoctors = await Doctor.countDocuments({ isApproved: true });
    const pendingDoctors = await Doctor.countDocuments({ isApproved: false });
    const rejectedDoctors = await Doctor.countDocuments({ status: 'rejected' });

    const logsToday = await AdminActivityLog.countDocuments({
      timestamp: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    console.log('✅ System stats fetched');
    res.json({
      data: {
        totalDoctors,
        approvedDoctors,
        pendingDoctors,
        rejectedDoctors,
        logsToday,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
};
