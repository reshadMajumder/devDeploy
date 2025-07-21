import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

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

  useEffect(() => {
    axios.get(`${API_BASE}/connect-vps/`).then(res => {
      const found = (res.data.vps || []).find(v => String(v.id) === String(vpsId));
      setVps(found);
    });
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
    } catch (err) {
      setError(err.response?.data?.message || 'Deployment failed');
    }
    setLoading(false);
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
      </div>
    </div>
  );
};

export default DeployProject;
