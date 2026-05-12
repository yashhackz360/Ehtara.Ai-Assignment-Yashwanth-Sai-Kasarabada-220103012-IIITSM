import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineX, HiOutlineTrash, HiOutlinePencil, HiOutlineUsers, HiOutlineUserAdd, HiOutlineUserRemove, HiOutlineCalendar, HiOutlineArrowLeft } from 'react-icons/hi';
import './ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditTask, setShowEditTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee: '', priority: 'medium', status: 'todo', dueDate: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadProject(); loadTasks(); }, [id]);

  const loadProject = async () => {
    try {
      const res = await api.getProject(id);
      setProject(res.project);
      setTaskStats(res.taskStats);
    } catch (err) { toast.error(err.message); navigate('/projects'); }
    finally { setLoading(false); }
  };

  const loadTasks = async () => {
    try { const res = await api.getTasks({ project: id }); setTasks(res.tasks); }
    catch (err) { console.error(err); }
  };

  const isAdmin = () => {
    if (!project || !user) return false;
    const m = project.members?.find(m => (m.user?._id || m.user) === user._id);
    return m?.role === 'admin';
  };

  const handleCreateTask = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.createTask({ ...taskForm, project: id, assignee: taskForm.assignee || undefined, dueDate: taskForm.dueDate || undefined });
      toast.success('Task created!'); setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignee: '', priority: 'medium', status: 'todo', dueDate: '' });
      loadTasks(); loadProject();
    } catch (err) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.updateTask(showEditTask._id, { ...taskForm, assignee: taskForm.assignee || null, dueDate: taskForm.dueDate || null });
      toast.success('Task updated!'); setShowEditTask(null); loadTasks(); loadProject();
    } catch (err) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const handleDeleteTask = async (taskId) => {
    try { await api.deleteTask(taskId); toast.success('Task deleted'); setShowDeleteConfirm(null); loadTasks(); loadProject(); }
    catch (err) { toast.error(err.message); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try { await api.updateTask(taskId, { status: newStatus }); loadTasks(); loadProject(); }
    catch (err) { toast.error(err.message); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.addMember(id, { email: memberEmail }); toast.success('Member added!'); setMemberEmail(''); setShowMemberModal(false); loadProject(); }
    catch (err) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const handleRemoveMember = async (userId) => {
    try { await api.removeMember(id, userId); toast.success('Member removed'); loadProject(); }
    catch (err) { toast.error(err.message); }
  };

  const handleDeleteProject = async () => {
    try { await api.deleteProject(id); toast.success('Project deleted'); navigate('/projects'); }
    catch (err) { toast.error(err.message); }
  };

  const openEditTask = (task) => {
    setTaskForm({ title: task.title, description: task.description || '', assignee: task.assignee?._id || '', priority: task.priority, status: task.status, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '' });
    setShowEditTask(task);
  };

  const getInitials = (n) => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const getAvatarColor = (n) => { const c = ['#6366f1','#8b5cf6','#ec4899','#06b6d4','#f59e0b','#10b981','#f43f5e','#3b82f6']; let h=0; for(let i=0;i<n.length;i++) h=n.charCodeAt(i)+((h<<5)-h); return c[Math.abs(h)%c.length]; };
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '';
  const isOverdue = (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done';
  const columns = [
    { key:'todo',        label:'To Do',       color:'#8c7164' },
    { key:'in-progress', label:'In Progress',  color:'#f97316' },
    { key:'done',        label:'Done',         color:'#006b5f' }
  ];

  if (loading) return <div className="project-detail animate-fade-in"><div className="skeleton" style={{width:300,height:40,marginBottom:32}}/><div style={{display:'flex',gap:16}}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{flex:1,height:400,borderRadius:16}}/>)}</div></div>;
  if (!project) return null;

  const renderTaskForm = (onSubmit, isEdit) => (
    <form onSubmit={onSubmit}>
      <div className="form-group"><label className="form-label">Title</label><input className="form-input" type="text" placeholder="Task title" value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})} required minLength={2} autoFocus/></div>
      <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" placeholder="Optional description..." value={taskForm.description} onChange={e=>setTaskForm({...taskForm,description:e.target.value})} rows={3}/></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={taskForm.status} onChange={e=>setTaskForm({...taskForm,status:e.target.value})}><option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option></select></div>
        <div className="form-group"><label className="form-label">Priority</label><select className="form-select" value={taskForm.priority} onChange={e=>setTaskForm({...taskForm,priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Assignee</label><select className="form-select" value={taskForm.assignee} onChange={e=>setTaskForm({...taskForm,assignee:e.target.value})}><option value="">Unassigned</option>{project.members?.map(m=><option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" type="date" value={taskForm.dueDate} onChange={e=>setTaskForm({...taskForm,dueDate:e.target.value})}/></div>
      </div>
      <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={()=>{setShowTaskModal(false);setShowEditTask(null);}}>Cancel</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting?'Saving...':(isEdit?'Update Task':'Create Task')}</button></div>
    </form>
  );

  return (
    <div className="project-detail animate-fade-in">
      <button className="btn btn-ghost" onClick={()=>navigate('/projects')} style={{marginBottom:16}}><HiOutlineArrowLeft/> Back to Projects</button>
      <div className="project-detail-header">
        <div className="project-detail-info">
          <div className="project-detail-title-row"><div className="project-detail-dot" style={{background:project.color}}/><h1 className="project-detail-name">{project.name}</h1></div>
          {project.description && <p className="project-detail-desc">{project.description}</p>}
        </div>
        <div className="project-detail-actions">
          {isAdmin() && <><button className="btn btn-secondary btn-sm" onClick={()=>setShowMemberModal(true)}><HiOutlineUserAdd/> Add Member</button><button className="btn btn-danger btn-sm" onClick={()=>setShowDeleteConfirm('project')}><HiOutlineTrash/> Delete</button></>}
          <button className="btn btn-primary btn-sm" onClick={()=>{setTaskForm({title:'',description:'',assignee:'',priority:'medium',status:'todo',dueDate:''});setShowTaskModal(true);}}><HiOutlinePlus/> New Task</button>
        </div>
      </div>

      <div className="project-quick-stats">
        <div className="quick-stat"><span className="quick-stat-value">{taskStats.total||0}</span><span className="quick-stat-label">Total</span></div>
        <div className="quick-stat"><span className="quick-stat-value" style={{color:'#94a3b8'}}>{taskStats.todo||0}</span><span className="quick-stat-label">To Do</span></div>
        <div className="quick-stat"><span className="quick-stat-value" style={{color:'#6366f1'}}>{taskStats.inProgress||0}</span><span className="quick-stat-label">In Progress</span></div>
        <div className="quick-stat"><span className="quick-stat-value" style={{color:'#22c55e'}}>{taskStats.done||0}</span><span className="quick-stat-label">Done</span></div>
        {taskStats.overdue>0 && <div className="quick-stat"><span className="quick-stat-value" style={{color:'#ef4444'}}>{taskStats.overdue}</span><span className="quick-stat-label">Overdue</span></div>}
      </div>

      <div className="project-tabs">
        <button className={`project-tab ${activeTab==='board'?'project-tab-active':''}`} onClick={()=>setActiveTab('board')}>Board View</button>
        <button className={`project-tab ${activeTab==='members'?'project-tab-active':''}`} onClick={()=>setActiveTab('members')}><HiOutlineUsers/> Members ({project.members?.length||0})</button>
      </div>

      {activeTab === 'board' && (
        <div className="kanban-board">
          {columns.map(col => {
            const colTasks = tasks.filter(t=>t.status===col.key);
            return (
              <div key={col.key} className="kanban-column">
                <div className="kanban-column-header"><div className="kanban-column-title"><span className="kanban-column-dot" style={{background:col.color}}/><span>{col.label}</span><span className="kanban-column-count">{colTasks.length}</span></div></div>
                <div className="kanban-cards">
                  {colTasks.map(task => (
                    <div key={task._id} className={`kanban-card ${isOverdue(task)?'kanban-card-overdue':''}`}>
                      <div className="kanban-card-top"><span className={`badge badge-${task.priority}`}>{task.priority}</span><div className="kanban-card-actions"><button className="btn btn-ghost btn-sm" onClick={()=>openEditTask(task)} title="Edit"><HiOutlinePencil/></button><button className="btn btn-ghost btn-sm" onClick={()=>setShowDeleteConfirm(task._id)} title="Delete"><HiOutlineTrash/></button></div></div>
                      <h4 className="kanban-card-title">{task.title}</h4>
                      {task.description && <p className="kanban-card-desc">{task.description}</p>}
                      <div className="kanban-card-footer">
                        {task.dueDate && <span className={`kanban-card-date ${isOverdue(task)?'overdue-text':''}`}><HiOutlineCalendar/>{formatDate(task.dueDate)}</span>}
                        {task.assignee && <div className="avatar avatar-sm" style={{background:getAvatarColor(task.assignee.name)}} title={task.assignee.name}>{getInitials(task.assignee.name)}</div>}
                      </div>
                      <div className="kanban-card-status-row">{columns.filter(c=>c.key!==task.status).map(c=><button key={c.key} className="kanban-status-btn" onClick={()=>handleStatusChange(task._id,c.key)} style={{borderColor:c.color,color:c.color}}>→ {c.label}</button>)}</div>
                    </div>
                  ))}
                  {colTasks.length===0 && <div className="kanban-empty"><span>No tasks</span></div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="members-list animate-fade-in">
          {project.members?.map(member => {
            const mu = member.user;
            return (
              <div key={mu?._id||member._id} className="member-row">
                <div className="member-info"><div className="avatar" style={{background:getAvatarColor(mu?.name||'U')}}>{getInitials(mu?.name||'U')}</div><div className="member-details"><span className="member-name">{mu?.name}</span><span className="member-email">{mu?.email}</span></div></div>
                <div className="member-actions"><span className={`badge badge-${member.role}`}>{member.role}</span>{isAdmin()&&member.role!=='admin'&&mu?._id!==user._id&&<button className="btn btn-ghost btn-sm" onClick={()=>handleRemoveMember(mu._id)} title="Remove"><HiOutlineUserRemove/></button>}</div>
              </div>
            );
          })}
        </div>
      )}

      {(showTaskModal||showEditTask) && <div className="modal-overlay" onClick={()=>{setShowTaskModal(false);setShowEditTask(null);}}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">{showEditTask?'Edit Task':'Create Task'}</h2><button className="modal-close" onClick={()=>{setShowTaskModal(false);setShowEditTask(null);}}><HiOutlineX/></button></div>{renderTaskForm(showEditTask?handleUpdateTask:handleCreateTask,!!showEditTask)}</div></div>}

      {showMemberModal && <div className="modal-overlay" onClick={()=>setShowMemberModal(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Add Member</h2><button className="modal-close" onClick={()=>setShowMemberModal(false)}><HiOutlineX/></button></div><form onSubmit={handleAddMember}><div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="Enter team member's email" value={memberEmail} onChange={e=>setMemberEmail(e.target.value)} required autoFocus/><p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:8}}>The user must already have a TaskFlow account.</p></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={()=>setShowMemberModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting?'Adding...':'Add Member'}</button></div></form></div></div>}

      {showDeleteConfirm && <div className="modal-overlay" onClick={()=>setShowDeleteConfirm(null)}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Confirm Delete</h2><button className="modal-close" onClick={()=>setShowDeleteConfirm(null)}><HiOutlineX/></button></div><p style={{color:'var(--text-secondary)',marginBottom:24}}>{showDeleteConfirm==='project'?'Are you sure you want to delete this project and all its tasks? This cannot be undone.':'Are you sure you want to delete this task? This cannot be undone.'}</p><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setShowDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" onClick={()=>{if(showDeleteConfirm==='project') handleDeleteProject(); else handleDeleteTask(showDeleteConfirm);}}>Delete</button></div></div></div>}
    </div>
  );
}

export default ProjectDetail;
