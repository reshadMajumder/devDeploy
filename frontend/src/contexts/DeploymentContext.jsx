import { createContext, useContext, useState } from 'react';

const DeploymentContext = createContext();

export const useDeployments = () => {
  const context = useContext(DeploymentContext);
  if (!context) {
    throw new Error('useDeployments must be used within a DeploymentProvider');
  }
  return context;
};

export const DeploymentProvider = ({ children }) => {
  const [deployments, setDeployments] = useState([
    {
      id: 1,
      name: 'my-react-portfolio',
      type: 'React',
      status: 'deployed',
      url: 'https://my-react-portfolio-abc123.deploy-platform.app',
      githubUrl: 'https://github.com/user/my-react-portfolio',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lastDeployed: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      name: 'django-blog-api',
      type: 'Django',
      status: 'building',
      url: null,
      githubUrl: 'https://github.com/user/django-blog-api',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      lastDeployed: null
    },
    {
      id: 3,
      name: 'ecommerce-frontend',
      type: 'React',
      status: 'deployed',
      url: 'https://ecommerce-frontend-xyz789.deploy-platform.app',
      githubUrl: 'https://github.com/user/ecommerce-frontend',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      lastDeployed: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const createDeployment = async (deploymentData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newDeployment = {
      id: Date.now(),
      ...deploymentData,
      status: 'building',
      url: null,
      createdAt: new Date().toISOString(),
      lastDeployed: null
    };
    
    setDeployments(prev => [newDeployment, ...prev]);
    
    // Simulate build process
    setTimeout(() => {
      setDeployments(prev => prev.map(dep => 
        dep.id === newDeployment.id 
          ? { 
              ...dep, 
              status: 'deployed', 
              url: `https://${dep.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substr(2, 6)}.deploy-platform.app`,
              lastDeployed: new Date().toISOString()
            }
          : dep
      ));
    }, 10000);
    
    return newDeployment;
  };

  const deleteDeployment = (id) => {
    setDeployments(prev => prev.filter(dep => dep.id !== id));
  };

  const value = {
    deployments,
    createDeployment,
    deleteDeployment
  };

  return (
    <DeploymentContext.Provider value={value}>
      {children}
    </DeploymentContext.Provider>
  );
};