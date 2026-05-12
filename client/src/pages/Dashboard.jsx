import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineFire,
  HiOutlineSparkles,
} from 'react-icons/hi';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Burning the midnight oil';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Working late';
  };

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙';
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    if (hour < 21) return '🌇';
    return '🌙';
  };

  const getMotivation = () => {
    const hour = new Date().getHours();
    const totalTasks = data?.stats?.totalTasks || 0;
    const done = data?.stats?.done || 0;
    const overdue = data?.stats?.overdue || 0;

    if (totalTasks === 0) return "No active tasks. Create a new project to get started.";
    if (overdue > 0) return `Attention: ${overdue} task${overdue > 1 ? 's are' : ' is'} overdue.`;
    if (done > 0 && done === totalTasks) return "All tasks are complete. Excellent progress.";
    if (hour < 12) return "Good morning. Here is your current task overview.";
    if (hour < 17) return "Good afternoon. Here is your current task overview.";
    return "Good evening. Review your end-of-day task status.";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      todo: 'badge-todo',
      'in-progress': 'badge-in-progress',
      done: 'badge-done',
    };
    const labels = {
      todo: 'To Do',
      'in-progress': 'In Progress',
      done: 'Done',
    };
    return <span className={`badge ${map[status]}`}>{labels[status]}</span>;
  };

  const getPriorityBadge = (priority) => {
    const map = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
    };
    return <span className={`badge ${map[priority]}`}>{priority}</span>;
  };

  if (loading) {
    return (
      <div className="dashboard animate-fade-in">
        <div className="dashboard-header">
          <div className="skeleton" style={{ width: 350, height: 44 }} />
          <div className="skeleton" style={{ width: 220, height: 20, marginTop: 8 }} />
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  const statCards = [
    {
      icon: HiOutlineFolder,
      label: 'Projects',
      value: stats.totalProjects || 0,
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.12)',
    },
    {
      icon: HiOutlineClipboardList,
      label: 'Total Tasks',
      value: stats.totalTasks || 0,
      color: '#14b8a6',
      bg: 'rgba(20, 184, 166, 0.12)',
    },
    {
      icon: HiOutlineCheckCircle,
      label: 'Completed',
      value: stats.done || 0,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.12)',
    },
    {
      icon: HiOutlineFire,
      label: 'Overdue',
      value: stats.overdue || 0,
      color: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.12)',
    },
  ];

  return (
    <div className="dashboard animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            {getGreeting()}, {user?.name?.split(' ')[0]} {getGreetingEmoji()}
          </h1>
          <p className="dashboard-subtitle">
            {getMotivation()}
          </p>
        </div>
        <Link to="/projects" className="btn btn-primary" id="dashboard-new-project">
          <HiOutlineSparkles />
          View Projects
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Status Distribution */}
      {stats.totalTasks > 0 && (
        <div className="dashboard-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="section-title">📊 Task Distribution</h2>
          <div className="distribution-card">
            <div className="distribution-bar">
              {stats.todo > 0 && (
                <div
                  className="distribution-segment segment-todo"
                  style={{ width: `${(stats.todo / stats.totalTasks) * 100}%` }}
                  title={`To Do: ${stats.todo}`}
                />
              )}
              {stats.inProgress > 0 && (
                <div
                  className="distribution-segment segment-progress"
                  style={{ width: `${(stats.inProgress / stats.totalTasks) * 100}%` }}
                  title={`In Progress: ${stats.inProgress}`}
                />
              )}
              {stats.done > 0 && (
                <div
                  className="distribution-segment segment-done"
                  style={{ width: `${(stats.done / stats.totalTasks) * 100}%` }}
                  title={`Done: ${stats.done}`}
                />
              )}
            </div>
            <div className="distribution-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#94a3b8' }} />
                <span>To Do ({stats.todo})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#f97316' }} />
                <span>In Progress ({stats.inProgress})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#14b8a6' }} />
                <span>Done ({stats.done})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Overdue Tasks */}
        {data?.overdueTasks?.length > 0 && (
          <div className="dashboard-section animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="section-title">
              🚨 Overdue — Needs Attention!
            </h2>
            <div className="task-list">
              {data.overdueTasks.slice(0, 5).map((task) => (
                <Link
                  to={`/projects/${task.project?._id}`}
                  key={task._id}
                  className="task-list-item"
                >
                  <div className="task-list-info">
                    <span className="task-list-title">{task.title}</span>
                    <span className="task-list-meta">
                      {task.project?.name} · Due {formatDate(task.dueDate)}
                    </span>
                  </div>
                  <div className="task-list-badges">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Due Soon */}
        {data?.dueSoon?.length > 0 && (
          <div className="dashboard-section animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h2 className="section-title">
              ⏰ Coming Up Soon
            </h2>
            <div className="task-list">
              {data.dueSoon.slice(0, 5).map((task) => (
                <Link
                  to={`/projects/${task.project?._id}`}
                  key={task._id}
                  className="task-list-item"
                >
                  <div className="task-list-info">
                    <span className="task-list-title">{task.title}</span>
                    <span className="task-list-meta">
                      {task.project?.name} · Due {formatDate(task.dueDate)}
                    </span>
                  </div>
                  <div className="task-list-badges">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Project Summaries */}
      {data?.projectSummaries?.length > 0 && (
        <div className="dashboard-section animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="section-header">
            <h2 className="section-title">
              🚀 Project Progress
            </h2>
            <Link to="/projects" className="btn btn-ghost btn-sm">
              View all <HiOutlineArrowRight />
            </Link>
          </div>
          <div className="projects-summary-grid">
            {data.projectSummaries.map((project) => (
              <Link
                to={`/projects/${project._id}`}
                key={project._id}
                className="project-summary-card"
              >
                <div className="project-summary-header">
                  <div
                    className="project-summary-dot"
                    style={{ background: project.color }}
                  />
                  <span className="project-summary-name">{project.name}</span>
                </div>
                <div className="project-summary-stats">
                  <span>{project.taskCount} tasks</span>
                  <span>·</span>
                  <span>{project.memberCount} members</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="project-summary-progress">{project.progress}% complete</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data?.projectSummaries?.length && !loading && (
        <div className="empty-state animate-fade-in">
          <div className="empty-state-icon">🎯</div>
          <h3 className="empty-state-title">Welcome to TaskFlow!</h3>
          <p className="empty-state-desc">
            Your workspace is ready. Create your first project to start collaborating with your team and tracking progress.
          </p>
          <Link to="/projects" className="btn btn-primary" style={{ marginTop: 20 }}>
            <HiOutlineSparkles />
            Create Your First Project
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
