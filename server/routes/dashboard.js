const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get dashboard stats for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get all projects user is a member of
    const projects = await Project.find({
      'members.user': req.user._id,
    })
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email avatar');

    const projectIds = projects.map((p) => p._id);

    // Get all tasks across user's projects
    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');

    // My tasks (assigned to me)
    const myTasks = allTasks.filter(
      (t) => t.assignee && t.assignee._id.toString() === req.user._id.toString()
    );

    // Task stats
    const now = new Date();
    const stats = {
      totalProjects: projects.length,
      totalTasks: allTasks.length,
      myTasks: myTasks.length,
      todo: allTasks.filter((t) => t.status === 'todo').length,
      inProgress: allTasks.filter((t) => t.status === 'in-progress').length,
      done: allTasks.filter((t) => t.status === 'done').length,
      overdue: allTasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
      ).length,
      highPriority: allTasks.filter((t) => t.priority === 'high' && t.status !== 'done').length,
    };

    // Recent tasks (last 5 updated)
    const recentTasks = [...allTasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    // Overdue tasks
    const overdueTasks = allTasks
      .filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Tasks due soon (next 3 days)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const dueSoon = allTasks
      .filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) >= now &&
          new Date(t.dueDate) <= threeDaysFromNow &&
          t.status !== 'done'
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Project summaries
    const projectSummaries = projects.map((p) => {
      const projectTasks = allTasks.filter(
        (t) => t.project._id.toString() === p._id.toString()
      );
      return {
        _id: p._id,
        name: p.name,
        color: p.color,
        memberCount: p.members.length,
        taskCount: projectTasks.length,
        doneCount: projectTasks.filter((t) => t.status === 'done').length,
        progress:
          projectTasks.length > 0
            ? Math.round(
                (projectTasks.filter((t) => t.status === 'done').length /
                  projectTasks.length) *
                  100
              )
            : 0,
      };
    });

    res.json({
      success: true,
      stats,
      recentTasks,
      overdueTasks,
      dueSoon,
      projectSummaries,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
