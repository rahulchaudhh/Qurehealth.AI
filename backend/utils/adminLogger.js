const AdminLog = require('../models/AdminLog');

const getIpAddress = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.connection?.remoteAddress || null;
};

const logAdminAction = async (req, {
    action,
    category = 'system',
    details = {}
}) => {
    try {
        await AdminLog.create({
            actor: {
                id: req.user?.id || req.user?._id || null,
                email: req.user?.email || null,
                role: req.user?.role || 'admin'
            },
            action,
            category,
            details,
            ipAddress: getIpAddress(req),
            userAgent: req.headers['user-agent'] || null
        });
    } catch (error) {
        console.error('Failed to store admin log:', error.message);
    }
};

module.exports = {
    logAdminAction
};
