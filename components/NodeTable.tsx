import React, { useState } from 'react';
import { ClashProxy } from '../types';

interface NodeTableProps {
  nodes: ClashProxy[];
}

export const NodeTable: React.FC<NodeTableProps> = ({ nodes }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getProtocolColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ss': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'vmess': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'trojan': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ssr': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Server
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Port
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {nodes.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                No nodes found. Try refreshing or adding valid subscriptions.
              </td>
            </tr>
          ) : (
            nodes.map((node, idx) => (
              <tr key={`${node.name}-${idx}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getProtocolColor(node.type)}`}>
                    {node.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                  {node.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {node.server}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                  {node.port}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleCopy(JSON.stringify(node, null, 2), idx)}
                    className={`text-indigo-600 hover:text-indigo-900 transition-colors ${copiedIndex === idx ? 'text-green-600' : ''}`}
                    title="Copy Node JSON"
                  >
                    {copiedIndex === idx ? (
                      <span className="flex items-center justify-end gap-1">
                        <i className="fas fa-check"></i> Copied
                      </span>
                    ) : (
                      <i className="far fa-copy text-lg"></i>
                    )}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};