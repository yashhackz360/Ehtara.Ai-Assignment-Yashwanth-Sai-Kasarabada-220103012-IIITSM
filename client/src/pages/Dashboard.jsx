import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineLightningBolt,
  HiOutlineArrowRight,
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
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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
          <div className="skeleton" style={{ width: 300, height: 36 }} />
          <div className="skeleton" style={{ width: 200, height: 20, marginTop: 8 }} />
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
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
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      icon: HiOutlineClipboardList,
      label: 'Total Tasks',
      value: stats.totalTasks || 0,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.1)',
    },
    {
      icon: HiOutlineCheckCircle,
      label: 'Completed',
      value: stats.done || 0,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)',
    },
    {
      icon: HiOutlineExclamation,
      label: 'Overdue',
      value: stats.overdue || 0,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
  ];

  return (
    <div className="dashboard animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="dashboard-subtitle">
            Here's what's happening with your projects today.
          </p>
        </div>
        <Link to="/projects" className="btn btn-primary" id="dashboard-new-project">
          <HiOutlineFolder />
          View Projects
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className="stat-card glass-card"
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
          <h2 className="section-title">Task Distribution</h2>
          <div className="distribution-card glass-card">
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
                <span className="legend-dot" style={{ background: '#6366f1' }} />
                <span>In Progress ({stats.inProgress})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#22c55e' }} />
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
              <HiOutlineExclamation style={{ color: 'var(--danger-400)' }} />
              Overdue Tasks
            </h2>
            <div className="task-list">
              {data.overdueTasks.slice(0, 5).map((task) => (
                <Link
                  to={`/projects/${task.project?._id}`}
                  key={task._id}
                  className="task-list-item glass-card"
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
              <HiOutlineClock style={{ color: 'var(--warning-400)' }} />
              Due Soon
            </h2>
            <div className="task-list">
              {data.dueSoon.slice(0, 5).map((task) => (
                <Link
                  to={`/projects/${task.project?._id}`}
                  key={task._id}
                  className="task-list-item glass-card"
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
              <HiOutlineLightningBolt style={{ color: 'var(--primary-400)' }} />
              Project Progress
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
                className="project-summary-card glass-card"
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
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No projects yet</h3>
          <p className="empty-state-desc">
            Create your first project to start managing tasks and collaborating with your team.
          </p>
          <Link to="/projects" className="btn btn-primary" style={{ marginTop: 16 }}>
            <HiOutlineFolder />
            Create Project
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
