import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineFolder,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineArrowRight,
  HiOutlineX,
} from 'react-icons/hi';
import './Projects.css';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res.projects);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createProject(form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '', color: '#6366f1' });
      loadProjects();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="projects-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage and organize your team's work.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          id="create-project-btn"
        >
          <HiOutlinePlus />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="projects-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project, idx) => (
            <Link
              to={`/projects/${project._id}`}
              key={project._id}
              className="project-card glass-card"
              style={{ animationDelay: `${idx * 0.05}s`, animation: 'fadeIn 0.4s ease-out both' }}
            >
              <div className="project-card-header">
                <div
                  className="project-card-color"
                  style={{ background: project.color }}
                />
                <h3 className="project-card-name">{project.name}</h3>
              </div>
              {project.description && (
                <p className="project-card-desc">{project.description}</p>
              )}
              <div className="project-card-footer">
                <div className="project-card-stat">
                  <HiOutlineUsers />
                  <span>{project.members?.length || 0}</span>
                </div>
                <div className="project-card-stat">
                  <HiOutlineClipboardList />
                  <span>{project.taskCount || 0} tasks</span>
                </div>
                <HiOutlineArrowRight className="project-card-arrow" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3 className="empty-state-title">No projects yet</h3>
          <p className="empty-state-desc">
            Create your first project to start organizing tasks.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            style={{ marginTop: 16 }}
          >
            <HiOutlinePlus />
            Create Project
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Create Project</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <HiOutlineX />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label" htmlFor="project-name">
                  Project Name
                </label>
                <input
                  id="project-name"
                  className="form-input"
                  type="text"
                  placeholder="e.g., Mobile App Redesign"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="project-desc">
                  Description (optional)
                </label>
                <textarea
                  id="project-desc"
                  className="form-input"
                  placeholder="Brief description of the project..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div className="color-picker">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-swatch ${form.color === color ? 'color-swatch-active' : ''}`}
                      style={{ background: color }}
                      onClick={() => setForm({ ...form, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                  id="submit-project"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
