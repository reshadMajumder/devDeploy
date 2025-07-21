import { useState, useEffect } from 'react';
import { useDeployments } from '../contexts/DeploymentContext';
import { Plus, Github, ExternalLink, Trash2, Clock, CheckCircle, AlertCircle, Activity, Calendar, Globe } from 'lucide-react';
import NewDeploymentModal from '../components/NewDeploymentModal';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api/django';

const Dashboard = () => {
  const { deployments, deleteDeployment } = useDeployments();
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
      const res = await axios.get(`${API_BASE}/connect-vps/`);
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
        headers: { 'Content-Type': 'multipart/form-data' }
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
      const res = await axios.post(`${API_BASE}/install-dependencies/`, { ip });
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

        {/* Deployments List */}
        {deployments.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Github className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No deployments yet</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Get started by deploying your first project from GitHub. It only takes a few seconds!
            </p>
            <button
              onClick={() => setShowNewDeployment(true)}
              className="btn-primary"
            >
              Deploy your first project
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Deployments</h2>
            <div className="grid gap-6">
              {deployments.map((deployment) => (
                <div key={deployment.id} className="card-hover p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{deployment.name}</h3>
                        <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
                          {deployment.type}
                        </span>
                        <div className={`${getStatusBadge(deployment.status)} flex items-center space-x-2`}>
                          {getStatusIcon(deployment.status)}
                          <span>{getStatusText(deployment.status)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-4">
                        <a
                          href={deployment.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 hover:text-gray-900 transition-colors duration-200"
                        >
                          <Github className="h-4 w-4" />
                          <span>View Repository</span>
                        </a>
                        {deployment.url && (
                          <a
                            href={deployment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 hover:text-gray-900 transition-colors duration-200"
                          >
                            <Globe className="h-4 w-4" />
                            <span>Visit Site</span>
                          </a>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {formatDate(deployment.createdAt)}</span>
                        </div>
                        {deployment.lastDeployed && (
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4" />
                            <span>Last deployed: {formatDate(deployment.lastDeployed)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {deployment.url && (
                        <a
                          href={deployment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary flex items-center space-x-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Visit</span>
                        </a>
                      )}
                      <button
                        onClick={() => deleteDeployment(deployment.id)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete deployment"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add VPS Modal */}
        {showAddVps && (
          <div className="modal">
            <form onSubmit={handleAddVps} className="card p-6 space-y-4">
              <h3 className="text-lg font-bold">Add New VPS</h3>
              <input
                type="text"
                placeholder="VPS Name"
                value={newVps.name}
                onChange={e => setNewVps({ ...newVps, name: e.target.value })}
                required
                className="input"
              />
              <input
                type="text"
                placeholder="VPS IP"
                value={newVps.ip}
                onChange={e => setNewVps({ ...newVps, ip: e.target.value })}
                required
                className="input"
              />
              <input
                type="file"
                accept=".pem"
                onChange={e => setNewVps({ ...newVps, pem_file: e.target.files[0] })}
                required
                className="input"
              />
              {vpsError && <div className="text-red-500">{vpsError}</div>}
              <div className="flex space-x-2">
                <button type="submit" className="btn-primary">Add VPS</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddVps(false)}>Cancel</button>
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