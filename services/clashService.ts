import yaml from 'https://esm.sh/js-yaml';
import { ClashConfig, ClashProxy } from '../types';

// Use a CORS proxy to allow fetching external subscriptions from the browser
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const fetchSubscription = async (url: string): Promise<ClashProxy[]> => {
  try {
    // Encode the URL component to ensure special characters don't break the proxy URL
    const targetUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${url}: ${response.statusText}`);
    }

    const text = await response.text();
    
    // Parse YAML content
    // Explicitly casting as unknown first for safety with external lib types
    const data = yaml.load(text) as unknown as ClashConfig;

    if (data && Array.isArray(data.proxies)) {
      return data.proxies;
    } else {
      console.warn(`No 'proxies' array found in ${url}. Trying to detect if it's a raw list.`);
      // Fallback: sometimes raw base64 or text lists are returned, but for this assignment
      // we strictly handle Clash YAML structure as requested.
      return [];
    }
  } catch (error) {
    console.error(`Error processing subscription ${url}:`, error);
    throw error;
  }
};

export const parseAllSubscriptions = async (urls: string[]): Promise<{ nodes: ClashProxy[], errors: string[] }> => {
  let allNodes: ClashProxy[] = [];
  const errors: string[] = [];

  const promises = urls.map(async (url) => {
    try {
      const nodes = await fetchSubscription(url);
      return nodes;
    } catch (e: any) {
      errors.push(`Failed ${url}: ${e.message}`);
      return [];
    }
  });

  const results = await Promise.all(promises);
  results.forEach(nodes => {
    allNodes = [...allNodes, ...nodes];
  });

  return { nodes: allNodes, errors };
};