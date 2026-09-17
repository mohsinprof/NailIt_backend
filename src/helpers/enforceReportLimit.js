const interviewReportModel = require('../models/interviewReport.model');

const MAX_REPORTS_PER_USER = 6;

/**
 * Keeps DB load low: after a new report is created, if the user has more
 * than MAX_REPORTS_PER_USER, delete the oldest ones (FIFO).
 * Runs in the background - failures are logged but never break the request.
 */
async function enforceReportLimit(userId) {
    try {
        // Only fetch the ids of extra (oldest) reports - minimal DB work
        const extraReports = await interviewReportModel
            .find({ user: userId })
            .sort({ createdAt: 1 }) // oldest first
            .skip(MAX_REPORTS_PER_USER)
            .select('_id')
            .lean();

        if (extraReports.length === 0) return;

        const idsToDelete = extraReports.map((r) => r._id);
        const result = await interviewReportModel.deleteMany({ _id: { $in: idsToDelete } });

        console.log(`[ReportLimit] Deleted ${result.deletedCount} oldest report(s) for user ${userId} (limit: ${MAX_REPORTS_PER_USER})`);
    } catch (error) {
        // Never let cleanup break report generation
        console.error('[ReportLimit] Failed to enforce report limit:', error);
    }
}

module.exports = { enforceReportLimit, MAX_REPORTS_PER_USER };
