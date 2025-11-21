import React, { useState, useEffect, useMemo } from 'react';
import { parseAllSubscriptions } from './services/clashService';
import { ClashProxy, NodeStats } from './types';
import { StatCard } from './components/StatCard';
import { NodeTable } from './components/NodeTable';

const DEFAULT_SUBSCRIPTIONS = [
  'https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/clash.yml',
  'https://nodefree.me/dy/2025/02/20250220.yaml', // Example dated URL, might expire, used for demo structure
];

const App: React.FC = () => {
  const [urls, setUrls] = useState<string[]>(DEFAULT_SUBSCRIPTIONS);
  const [newUrl, setNewUrl] = useState('');
  const [nodes, setNodes] = useState<ClashProxy[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setErrors([]);
    try {
      // Filter out empty lines
      const validUrls = urls.filter(u => u.trim().length > 0);
      const result = await parseAllSubscriptions(validUrls);
      setNodes(result.nodes);
      setErrors(result.errors);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Global fetch error", error);
      setErrors(prev => [...prev, "An unexpected error occurred while fetching."]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUrl && !urls.includes(newUrl)) {
      setUrls([...urls, newUrl]);
      setNewUrl('');
    }
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    setUrls(urls.filter(u => u !== urlToRemove));
  };

  // Computed properties for stats and filtering
  const filteredNodes = useMemo(() => {
    if (!filter) return nodes;
    const lowerFilter = filter.toLowerCase();
    return nodes.filter(node => 
      node.name.toLowerCase().includes(lowerFilter) ||
      node.type.toLowerCase().includes(lowerFilter) ||
      node.server.toLowerCase().includes(lowerFilter)
    );
  }, [nodes, filter]);

  const stats: NodeStats = useMemo(() => {
    const typeCount: Record<string, number> = {};
    nodes.forEach(node => {
      typeCount[node.type] = (typeCount[node.type] || 0) + 1;
    });
    return {
      total: nodes.length,
      byType: typeCount
    };
  }, [nodes]);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-indigo-600 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <i className="fas fa-network-wired text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Clash Node Viewer</h1>
              <p className="text-indigo-100 text-xs">YAML Parser & Visualizer</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {lastUpdated && (
              <span className="text-indigo-200 text-xs hidden sm:inline">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-medium shadow hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className={`fas fa-sync-alt mr-2 ${loading ? 'animate-spin' : ''}`}></i>
              {loading ? 'Refreshing...' : 'Refresh Nodes'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Nodes" 
            value={stats.total} 
            icon="fas fa-server" 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Vmess Nodes" 
            value={stats.byType['vmess'] || 0} 
            icon="fas fa-shield-alt" 
            color="bg-purple-500" 
          />
          <StatCard 
            title="Trojan Nodes" 
            value={stats.byType['trojan'] || 0} 
            icon="fas fa-horse-head" 
            color="bg-orange-500" 
          />
          <StatCard 
            title="SS/SSR Nodes" 
            value={(stats.byType['ss'] || 0) + (stats.byType['ssr'] || 0)} 
            icon="fas fa-paper-plane" 
            color="bg-pink-500" 
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar: Config */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <i className="fas fa-link mr-2 text-indigo-500"></i> Subscriptions
              </h2>
              
              <form onSubmit={handleAddUrl} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Paste Clash YAML URL..."
                    className="flex-1 rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button 
                    type="submit"
                    className="bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </form>

              <ul className="space-y-3">
                {urls.map((url, idx) => (
                  <li key={idx} className="flex items-start justify-between group p-2 hover:bg-slate-50 rounded-md transition-colors">
                    <div className="flex items-center overflow-hidden">
                      <i className="fas fa-rss text-slate-400 mr-2 text-xs flex-shrink-0"></i>
                      <span className="text-xs text-slate-600 truncate block w-full" title={url}>
                        {url}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleRemoveUrl(url)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-circle text-red-500"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Fetch Errors</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Data Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-slate-400"></i>
                </div>
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Filter by name, server, or type..."
                />
              </div>
              <div className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-800">{filteredNodes.length}</span> of {nodes.length} nodes
              </div>
            </div>

            {/* The Table */}
            <NodeTable nodes={filteredNodes} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;