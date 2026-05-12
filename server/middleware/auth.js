const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.',
    });
  }
};

// Check if user is project admin
const projectAdmin = (req, res, next) => {
  const project = req.project;
  if (!project) {
    return res.status(500).json({
      success: false,
      message: 'Project not loaded.',
    });
  }

  const member = project.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!member || member.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only project admins can perform this action.',
    });
  }

  next();
};

// Check if user is project member
const projectMember = (req, res, next) => {
  const project = req.project;
  if (!project) {
    return res.status(500).json({
      success: false,
      message: 'Project not loaded.',
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

  next();
};

module.exports = { protect, projectAdmin, projectMember };
