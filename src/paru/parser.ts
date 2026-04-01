// src/paru/parser.ts

import type { Package } from '../types';

export function parseSearchOutput(output: string): Package[] {
  const packages: Package[] = [];
  const lines = output.split('\n').filter(line => line.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Parse lines like: "aur/package-name 1.0.0-1 (+123 4.56%) - Package description"
    // or: "extra/package-name 1.0.0-1 - Package description"
    // Support all repository names (aur, extra, core, community, multilib, testing, staging, custom repos)
    const aurMatch = line.match(/^([\w-]+)\/(\S+)\s+(\S+)\s+(.+)$/);
    
    if (aurMatch) {
      const [, repo, name, version, rest] = aurMatch;
      
      // Check if installed (version in parentheses)
      const installed = rest.includes('[installed]');
      
      // Parse description (same line old format, or next indented line modern format)
      const descMatch = rest.match(/-\s+(.+)$/);
      let description = descMatch ? descMatch[1] : '';

      if (!description && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (/^\s+/.test(nextLine)) {
          description = nextLine.trim();
          i++;
        }
      }
      
      // Parse votes and popularity for AUR
      let votes: number | undefined;
      let popularity: number | undefined;
      
      if (repo === 'aur') {
        const oldVoteMatch = rest.match(/\(\+(\d+)\s+([\d.]+)%\)/);
        const modernVoteMatch = rest.match(/\[\+(\d+)\s+~([\d.]+)\]/);
        const voteMatch = oldVoteMatch ?? modernVoteMatch;

        if (voteMatch) {
          votes = Number.parseInt(voteMatch[1], 10);
          popularity = Number.parseFloat(voteMatch[2]);
        }
      }
      
      packages.push({
        name,
        version,
        description,
        repository: repo,
        installed,
        isAur: repo === 'aur',
        votes,
        popularity,
      });
    }
  }
  
  return packages;
}

export function parseInfoOutput(output: string): Partial<Package> {
  const info: Partial<Package> = {};
  const lines = output.split('\n');
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();
    
    switch (key.trim()) {
      case 'Name':
        info.name = value;
        break;
      case 'Version':
        info.version = value;
        break;
      case 'Description':
        info.description = value;
        break;
      case 'Repository':
        info.repository = value;
        break;
      case 'Licenses':
        info.license = value;
        break;
      case 'URL':
        info.url = value;
        break;
      case 'Depends On':
        info.dependencies = value.split(' ').filter(Boolean);
        break;
      case 'Optional Deps':
        info.optionalDependencies = value.split(' ').filter(Boolean);
        break;
      case 'Conflicts With':
        info.conflicts = value.split(' ').filter(Boolean);
        break;
      case 'Provides':
        info.provides = value.split(' ').filter(Boolean);
        break;
      case 'Installed Size':
        info.size = value;
        break;
    }
  }
  
  return info;
}

export function parseListOutput(output: string): Package[] {
  const packages: Package[] = [];
  const lines = output.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Parse lines like: "package-name 1.0.0-1"
    const match = line.match(/^(\S+)\s+(\S+)$/);
    
    if (match) {
      const [, name, version] = match;
      packages.push({
        name,
        version,
        description: '',
        repository: 'local',
        installed: true,
        isAur: false, // Will be determined later
      });
    }
  }
  
  return packages;
}

export function parseUpdatesOutput(output: string): Package[] {
  const packages: Package[] = [];
  const lines = output.split('\n').filter(line => line.trim() && !line.startsWith('::'));
  
  for (const line of lines) {
    // Parse lines like: "package1 1.0.0-1 -> 1.1.0-1"
    const match = line.match(/^(\S+)\s+(\S+)\s+->\s+(\S+)$/);
    
    if (match) {
      const [, name, oldVersion, newVersion] = match;
      packages.push({
        name,
        version: newVersion,
        description: `Update from ${oldVersion}`,
        repository: 'update',
        installed: true,
        isAur: false,
      });
    }
  }
  
  return packages;
}
