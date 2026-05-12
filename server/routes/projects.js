const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { protect, projectAdmin, projectMember } = require('../middleware/auth');

const router = express.Router();

// Middleware to load project and attach to req
const loadProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }
    req.project = project;
    next();
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route   GET /api/projects
// @desc    Get all projects for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id,
    })
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email avatar')
      .populate('taskCount')
      .sort({ updatedAt: -1 });

    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post(
  '/',
  protect,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be 2-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
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

      const { name, description, color } = req.body;

      const project = await Project.create({
        name,
        description: description || '',
        owner: req.user._id,
        color: color || '#6366f1',
        members: [{ user: req.user._id, role: 'admin' }],
      });

      await project.populate('members.user', 'name email avatar');
      await project.populate('owner', 'name email avatar');

      res.status(201).json({ success: true, project });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// @route   GET /api/projects/:id
// @desc    Get project details
// @access  Private (project members)
router.get('/:id', protect, loadProject, projectMember, async (req, res) => {
  try {
    await req.project.populate('members.user', 'name email avatar');
    await req.project.populate('owner', 'name email avatar');

    // Get task stats
    const tasks = await Task.find({ project: req.project._id });
    const taskStats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
      ).length,
    };

    res.json({
      success: true,
      project: req.project,
      taskStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (admin only)
router.put(
  '/:id',
  protect,
  loadProject,
  projectAdmin,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('description').optional().isLength({ max: 500 }),
  ],
  async (req, res) => {
    try {
      const { name, description, color } = req.body;

      if (name) req.project.name = name;
      if (description !== undefined) req.project.description = description;
      if (color) req.project.color = color;

      await req.project.save();
      await req.project.populate('members.user', 'name email avatar');
      await req.project.populate('owner', 'name email avatar');

      res.json({ success: true, project: req.project });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// @route   DELETE /api/projects/:id
// @desc    Delete project and all tasks
// @access  Private (admin only)
router.delete('/:id', protect, loadProject, projectAdmin, async (req, res) => {
  try {
    // Delete all tasks in the project
    await Task.deleteMany({ project: req.project._id });
    await Project.findByIdAndDelete(req.project._id);

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private (admin only)
router.post(
  '/:id/members',
  protect,
  loadProject,
  projectAdmin,
  [body('email').isEmail().withMessage('Please provide a valid email')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
        });
      }

      const { email, role } = req.body;

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No user found with this email. They need to sign up first.',
        });
      }

      // Check if already a member
      const alreadyMember = req.project.members.some(
        (m) => m.user.toString() === user._id.toString()
      );

      if (alreadyMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this project.',
        });
      }

      req.project.members.push({
        user: user._id,
        role: role || 'member',
      });

      await req.project.save();
      await req.project.populate('members.user', 'name email avatar');
      await req.project.populate('owner', 'name email avatar');

      res.json({ success: true, project: req.project });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Private (admin only)
router.delete(
  '/:id/members/:userId',
  protect,
  loadProject,
  projectAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Cannot remove the owner
      if (req.project.owner.toString() === userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the project owner.',
        });
      }

      req.project.members = req.project.members.filter(
        (m) => m.user.toString() !== userId
      );

      // Unassign tasks from removed member
      await Task.updateMany(
        { project: req.project._id, assignee: userId },
        { assignee: null }
      );

      await req.project.save();
      await req.project.populate('members.user', 'name email avatar');
      await req.project.populate('owner', 'name email avatar');

      res.json({ success: true, project: req.project });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

module.exports = router;
