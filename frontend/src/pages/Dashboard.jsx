import { useState, useEffect } from 'react';
import { useDeployments } from '../contexts/DeploymentContext';
import { Plus, Github, ExternalLink, Trash2, Clock, CheckCircle, AlertCircle, Activity, Calendar, Globe } from 'lucide-react';
import NewDeploymentModal from '../components/NewDeploymentModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://127.0.0.1:8000/api/django';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Dashboard = () => {
  const { deployments, deleteDeployment } = useDeployments();
  const navigate = useNavigate();
  const [showNewDeployment, setShowNewDeployment] = useState(false);
  // VPS state
  const [vpsList, setVpsList] = useState([]);
  const [showAddVps, setShowAddVps] = useState(false);
  const [newVps, setNewVps] = useState({ ip: '', name: '', pem_file: null });
  const [vpsLoading, setVpsLoading] = useState(false);
  const [vpsError, setVpsError] = useState('');
  const [installStatus, setInstallStatus] = useState({}); // { [ip]: { loading, success, error, message } }

  useEffect(() => { fetchVpsList(); }, []);

  const fetchVpsList = async () => {
    setVpsLoading(true);
    setVpsError('');
    try {
      const res = await axios.get(`${API_BASE}/connect-vps/`, {
        headers: { ...getAuthHeaders() }
      });
      setVpsList(res.data.vps || []);
    } catch (err) {
      setVpsError('Failed to fetch VPS list');
    }
    setVpsLoading(false);
  };

  const handleAddVps = async (e) => {
    e.preventDefault();
    setVpsError('');
    const formData = new FormData();
    formData.append('ip', newVps.ip);
    formData.append('name', newVps.name);
    formData.append('pem_file', newVps.pem_file);
    try {
      await axios.post(`${API_BASE}/connect-vps/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', ...getAuthHeaders() }
      });
      setShowAddVps(false);
      setNewVps({ ip: '', name: '', pem_file: null });
      fetchVpsList();
    } catch (err) {
      setVpsError('Failed to add VPS');
    }
  };

  // Install dependencies for a VPS
  const handleInstallDependencies = async (ip) => {
    setInstallStatus(prev => ({ ...prev, [ip]: { loading: true, success: false, error: false, message: '' } }));
    try {
      const res = await axios.post(`${API_BASE}/install-dependencies/`, { ip }, {
        headers: { ...getAuthHeaders() }
      });
      setInstallStatus(prev => ({
        ...prev,
        [ip]: { loading: false, success: true, error: false, message: res.data.message || 'Dependencies installed!' }
      }));
    } catch (err) {
      setInstallStatus(prev => ({
        ...prev,
        [ip]: { loading: false, success: false, error: true, message: err.response?.data?.message || 'Failed to install dependencies' }
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'building':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'deployed':
        return 'status-deployed';
      case 'building':
        return 'status-building';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-badge bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'deployed':
        return 'Deployed';
      case 'building':
        return 'Building';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: deployments.length,
    deployed: deployments.filter(d => d.status === 'deployed').length,
    building: deployments.filter(d => d.status === 'building').length,
    failed: deployments.filter(d => d.status === 'failed').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage and monitor your deployments</p>
          </div>
          <button
            onClick={() => setShowNewDeployment(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Deployment</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deployed</p>
                <p className="text-3xl font-bold text-green-600">{stats.deployed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Building</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.building}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>



        {/* VPS Section */}
        <div className="my-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your VPSs</h2>
            <button className="btn-primary" onClick={() => setShowAddVps(true)}>
              Add VPS
            </button>
          </div>
          {vpsLoading ? (
            <div>Loading...</div>
          ) : vpsError ? (
            <div className="text-red-500">{vpsError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vpsList.map((vps) => (
                <div key={vps.id} className="card p-6 flex flex-col space-y-2">
                  <div className="font-bold text-lg">{vps.name}</div>
                  <div className="text-gray-600 text-sm">IP: {vps.ip_address}</div>
                  <div className="text-xs text-gray-400">PEM: {vps.pem_file_name}</div>
                  <div className={`text-xs ${vps.connected ? 'text-green-600' : 'text-red-600'}`}>{vps.connected ? 'Connected' : 'Not Connected'}</div>
                  <button
                    className="btn-secondary mt-2"
                    onClick={() => handleInstallDependencies(vps.ip_address)}
                    disabled={installStatus[vps.ip_address]?.loading}
                  >
                    {installStatus[vps.ip_address]?.loading ? 'Installing...' : 'Install Dependencies'}
                  </button>
                  {installStatus[vps.ip_address]?.success && (
                    <div className="text-green-600 text-xs">{installStatus[vps.ip_address].message}</div>
                  )}
                  {installStatus[vps.ip_address]?.error && (
                    <div className="text-red-600 text-xs">{installStatus[vps.ip_address].message}</div>
                  )}
                  <button
                    className="btn-primary mt-2"
                    type="button"
                    onClick={e => { e.stopPropagation(); navigate(`/deploy-project/${vps.id}`); }}
                  >
                    Deploy Project
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add VPS Modal */}
        {showAddVps && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <form
              onSubmit={handleAddVps}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-100 animate-fade-in"
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2v20m10-10H2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                </span>
                Add New VPS
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="vps-name">VPS Name</label>
                  <input
                    id="vps-name"
                    type="text"
                    placeholder="e.g. dev-server-1"
                    value={newVps.name}
                    onChange={e => setNewVps({ ...newVps, name: e.target.value })}
                    required
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="vps-ip">VPS IP</label>
                  <input
                    id="vps-ip"
                    type="text"
                    placeholder="e.g. 13.53.177.68"
                    value={newVps.ip}
                    onChange={e => setNewVps({ ...newVps, ip: e.target.value })}
                    required
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="pem-file">PEM File</label>
                  <input
                    id="pem-file"
                    type="file"
                    accept=".pem"
                    onChange={e => setNewVps({ ...newVps, pem_file: e.target.files[0] })}
                    required
                    className="input-field w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                {vpsError && <div className="text-red-500 text-sm mt-2">{vpsError}</div>}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-3 text-base font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-150"
                  >
                    Add VPS
                  </button>
                  <button
                    type="button"
                    className="flex-1 btn-secondary py-3 text-base font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-150"
                    onClick={() => setShowAddVps(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {showNewDeployment && (
          <NewDeploymentModal onClose={() => setShowNewDeployment(false)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;