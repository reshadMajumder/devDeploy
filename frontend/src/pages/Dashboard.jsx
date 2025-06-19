import { useState } from 'react';
import { useDeployments } from '../contexts/DeploymentContext';
import { Plus, Github, ExternalLink, Trash2, Clock, CheckCircle, AlertCircle, Activity, Calendar, Globe } from 'lucide-react';
import NewDeploymentModal from '../components/NewDeploymentModal';

const Dashboard = () => {
  const { deployments, deleteDeployment } = useDeployments();
  const [showNewDeployment, setShowNewDeployment] = useState(false);

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

        {showNewDeployment && (
          <NewDeploymentModal onClose={() => setShowNewDeployment(false)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;