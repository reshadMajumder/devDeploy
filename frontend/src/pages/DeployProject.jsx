import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Trash2 } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api/django';

const DeployProject = () => {
  const { vpsId } = useParams();
  const navigate = useNavigate();
  const [vps, setVps] = useState(null);
  const [form, setForm] = useState({
    repo_url: '',
    django_root: '',
    wsgi_path: '',
    server_name: ''
  });
  const [envFile, setEnvFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Docker containers state
  const [containers, setContainers] = useState([]);
  const [containersLoading, setContainersLoading] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState({});
  const [containersError, setContainersError] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE}/connect-vps/`).then(res => {
      const found = (res.data.vps || []).find(v => String(v.id) === String(vpsId));
      setVps(found);
      if (found) fetchContainers(found.ip_address);
    });
    // eslint-disable-next-line
  }, [vpsId]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    setError('');
    const formData = new FormData();
    formData.append('ip', vps.ip_address);
    formData.append('repo_url', form.repo_url);
    formData.append('django_root', form.django_root);
    formData.append('wsgi_path', form.wsgi_path);
    formData.append('server_name', form.server_name);
    if (envFile) formData.append('env_file', envFile);
    try {
      const res = await axios.post(`${API_BASE}/deploy-project/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus(res.data.message || 'Deployment started!');
      // Optionally refresh containers after deploy
      fetchContainers(vps.ip_address);
    } catch (err) {
      setError(err.response?.data?.message || 'Deployment failed');
    }
    setLoading(false);
  };

  // Docker containers logic
  const fetchContainers = async (ip) => {
    setContainersLoading(true);
    setContainersError('');
    try {
      const res = await axios.get(`${API_BASE}/docker-containers/?ip=${encodeURIComponent(ip)}`);
      setContainers(res.data.containers || []);
    } catch (err) {
      setContainersError('Failed to fetch containers');
    }
    setContainersLoading(false);
  };

  const handleDeleteContainer = async (containerId) => {
    setDeleteStatus(prev => ({ ...prev, [containerId]: 'loading' }));
    try {
      await axios.post(`${API_BASE}/delete-docker-container/`, {
        ip: vps.ip_address,
        container: containerId
      });
      setDeleteStatus(prev => ({ ...prev, [containerId]: 'success' }));
      fetchContainers(vps.ip_address);
    } catch (err) {
      setDeleteStatus(prev => ({ ...prev, [containerId]: 'error' }));
    }
  };

  if (!vps) return <div className="max-w-xl mx-auto p-8">Loading VPS info...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-2xl">
        <button
          className="flex items-center text-blue-600 hover:underline mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Back to Dashboard
        </button>
        <div className="card p-8 shadow-lg border border-gray-200 bg-white">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Deploy Django Project</h2>
          <p className="text-gray-600 mb-6">Deploy a Django project to <span className="font-semibold">{vps.name}</span> ({vps.ip_address})</p>
          <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-100">
            <div className="flex flex-wrap gap-6 text-sm">
              <div><span className="font-semibold">VPS Name:</span> {vps.name}</div>
              <div><span className="font-semibold">IP:</span> {vps.ip_address}</div>
              <div><span className="font-semibold">PEM:</span> {vps.pem_file_name}</div>
              <div><span className={`font-semibold ${vps.connected ? 'text-green-600' : 'text-red-600'}`}>Status: {vps.connected ? 'Connected' : 'Not Connected'}</span></div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Repository URL <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="repo_url"
                placeholder="e.g. https://github.com/youruser/yourrepo.git"
                value={form.repo_url}
                onChange={handleChange}
                required
                className="input w-full"
              />
              <p className="text-xs text-gray-400 mt-1">Public or accessible git repository</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Django Root</label>
                <input
                  type="text"
                  name="django_root"
                  placeholder="e.g. core (leave blank for repo root)"
                  value={form.django_root}
                  onChange={handleChange}
                  className="input w-full"
                />
                <p className="text-xs text-gray-400 mt-1">Path to Django project root inside repo</p>
              </div>
              <div>
                <label className="block font-medium mb-1">WSGI Path <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="wsgi_path"
                  placeholder="e.g. core/core/wsgi.py"
                  value={form.wsgi_path}
                  onChange={handleChange}
                  required
                  className="input w-full"
                />
                <p className="text-xs text-gray-400 mt-1">Relative to repo root</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Server Name</label>
                <input
                  type="text"
                  name="server_name"
                  placeholder="e.g. mydomain.com or IP"
                  value={form.server_name}
                  onChange={handleChange}
                  className="input w-full"
                />
                <p className="text-xs text-gray-400 mt-1">Domain or IP for nginx config (optional)</p>
              </div>
              <div>
                <label className="block font-medium mb-1">.env File</label>
                <input
                  type="file"
                  accept=".env"
                  onChange={e => setEnvFile(e.target.files[0])}
                  className="input w-full"
                />
                <p className="text-xs text-gray-400 mt-1">Optional environment file</p>
              </div>
            </div>
            <hr className="my-4" />
            <div className="flex items-center space-x-4">
              <button type="submit" className="btn-primary px-6 py-2 text-lg" disabled={loading}>
                {loading ? 'Deploying...' : 'Deploy Project'}
              </button>
              {status && <div className="text-green-600 font-medium">{status}</div>}
              {error && <div className="text-red-600 font-medium">{error}</div>}
            </div>
          </form>
        </div>

        {/* Docker Containers Section */}
        <div className="card p-8 shadow-lg border border-gray-200 bg-white mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Docker Containers</h2>
            <button className="btn-secondary" onClick={() => fetchContainers(vps.ip_address)}>
              Refresh
            </button>
          </div>
          <div className="mb-4 flex flex-wrap gap-6 text-sm">
            <span><b>Total containers:</b> {containers.length}</span>
            <span><b>Running:</b> {containers.filter(c => c.State === 'running').length}</span>
          </div>
          {containersLoading ? (
            <div>Loading containers...</div>
          ) : containersError ? (
            <div className="text-red-500">{containersError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {containers.map((c) => (
                <div key={c.ID} className="card p-6 flex flex-col space-y-2 shadow border">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg">{c.Names}</div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      c.State === 'running'
                        ? 'bg-green-100 text-green-700'
                        : c.State === 'exited'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {c.State}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">ID: {c.ID}</div>
                  <div className="text-xs text-gray-500">Image: {c.Image}</div>
                  <div className="text-xs text-gray-500">Command: {c.Command}</div>
                  <div className="text-xs text-gray-500">Created: {c.CreatedAt}</div>
                  <div className="text-xs text-gray-500">Status: {c.Status}</div>
                  <div className="text-xs text-gray-500">Running For: {c.RunningFor}</div>
                  <div className="text-xs text-gray-500">Ports: {c.Ports}</div>
                  <div className="text-xs text-gray-500">Mounts: {c.Mounts}</div>
                  <div className="text-xs text-gray-500">Networks: {c.Networks}</div>
                  <div className="text-xs text-gray-500">Size: {c.Size}</div>
                  <button
                    className="btn-danger mt-2 flex items-center justify-center"
                    onClick={() => handleDeleteContainer(c.ID)}
                    disabled={deleteStatus[c.ID] === 'loading'}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deleteStatus[c.ID] === 'loading'
                      ? 'Deleting...'
                      : deleteStatus[c.ID] === 'success'
                      ? 'Deleted'
                      : 'Delete'}
                  </button>
                  {deleteStatus[c.ID] === 'error' && (
                    <div className="text-red-600 text-xs">Failed to delete</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeployProject;
