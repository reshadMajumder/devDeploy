import { useState } from 'react';
import { useDeployments } from '../contexts/DeploymentContext';
import { X, Github, Rocket, AlertCircle } from 'lucide-react';

const NewDeploymentModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    githubUrl: '',
    type: 'React'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { createDeployment } = useDeployments();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate GitHub URL
      if (!formData.githubUrl.includes('github.com')) {
        setError('Please enter a valid GitHub repository URL');
        setLoading(false);
        return;
      }

      // Validate project name
      if (formData.name.length < 3) {
        setError('Project name must be at least 3 characters long');
        setLoading(false);
        return;
      }

      await createDeployment(formData);
      onClose();
    } catch (err) {
      setError('Failed to create deployment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">New Deployment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Project Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="input-field"
              placeholder="my-awesome-app"
              value={formData.name}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used in your deployment URL
            </p>
          </div>

          <div>
            <label htmlFor="githubUrl" className="block text-sm font-semibold text-gray-900 mb-2">
              GitHub Repository URL
            </label>
            <div className="relative">
              <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="githubUrl"
                name="githubUrl"
                type="url"
                required
                className="input-field pl-12"
                placeholder="https://github.com/username/repository"
                value={formData.githubUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-gray-900 mb-2">
              Framework
            </label>
            <select
              id="type"
              name="type"
              className="input-field"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="React">React</option>
              <option value="Django">Django</option>
            </select>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Rocket className="h-4 w-4 mr-2 text-blue-600" />
              Deployment Process
            </h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Clone repository from GitHub
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Build Docker container
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Deploy to production environment
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Generate unique deployment URL
              </li>
            </ul>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deploying...
                </span>
              ) : (
                'Deploy Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDeploymentModal;