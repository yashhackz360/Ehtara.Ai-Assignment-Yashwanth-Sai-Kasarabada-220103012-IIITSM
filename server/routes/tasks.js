const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for current user (across all projects) with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, project, assignedToMe } = req.query;

    // Get all projects user is a member of
    const userProjects = await Project.find({
      'members.user': req.user._id,
    }).select('_id');

    const projectIds = userProjects.map((p) => p._id);

    const query = { project: { $in: projectIds } };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;
    if (assignedToMe === 'true') query.assignee = req.user._id;

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private (project members)
router.post(
  '/',
  protect,
  [
    body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
    body('project').notEmpty().withMessage('Project ID is required'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
        });
      }

      const { title, description, project: projectId, assignee, status, priority, dueDate } = req.body;

      // Check project exists and user is a member
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.',
        });
      }

      const isMember = project.members.some(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this project.',
        });
      }

      // If assignee is specified, validate they are a project member
      if (assignee) {
        const assigneeIsMember = project.members.some(
          (m) => m.user.toString() === assignee
        );
        if (!assigneeIsMember) {
          return res.status(400).json({
            success: false,
            message: 'Assignee must be a project member.',
          });
        }
      }

      const task = await Task.create({
        title,
        description: description || '',
        project: projectId,
        assignee: assignee || null,
        createdBy: req.user._id,
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate || null,
      });

      await task.populate('assignee', 'name email avatar');
      await task.populate('createdBy', 'name email avatar');
      await task.populate('project', 'name color');

      res.status(201).json({ success: true, task });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private (project members)
router.put(
  '/:id',
  protect,
  [
    body('title').optional().trim().isLength({ min: 2, max: 200 }),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found.',
        });
      }

      // Check user is a member of the project
      const project = await Project.findById(task.project);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.',
        });
      }

      const isMember = project.members.some(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this project.',
        });
      }

      const { title, description, assignee, status, priority, dueDate } = req.body;

      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignee !== undefined) task.assignee = assignee || null;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;

      await task.save();
      await task.populate('assignee', 'name email avatar');
      await task.populate('createdBy', 'name email avatar');
      await task.populate('project', 'name color');

      res.json({ success: true, task });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private (admin or task creator)
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    // Only admin or task creator can delete
    const isAdmin = member && member.role === 'admin';
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only project admins or the task creator can delete this task.',
      });
    }

    await Task.findByIdAndDelete(task._id);

    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
