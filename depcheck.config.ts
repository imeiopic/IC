import depcheck from 'depcheck';
import pkg from './package.json';

// Automatically extract peerDependencies to ensure they are ignored by the protocol audit
const peerDeps = pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : [];

/**
 * Custom parser for Iopic Protocol files (.protocol)
 * Logic: Extracts dependencies defined via 'import-protocol: "name"'
 */
const protocolParser = (content) => {
  const dependencies = [];
  // Improved regex: ensures it doesn't match lines starting with //
  const regex = /^(?!\s*\/\/).*import-protocol:\s*["']([^"']+)["']/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    dependencies.push(match[1]);
  }

  return dependencies;
};

export default {
  pkg, // Exporting the manifest for version mismatch validation

  /**
   * isTestFile: Shared utility to determine if a file path belongs 
   * to the testing substrate.
   */
  isTestFile: (path) => 
    // Matches files ending in .test.ts, .spec.js, or simply test.ts/spec.js
    /[\/\.](test|spec)\.[jt]sx?$/.test(path) || 
    // Matches any directory named 'tests' or '__tests__'
    /([\/\\]|^)(__tests__|tests)([\/\\]|$)/.test(path),

  /**
   * isIgnoredFile: Logic to exclude specific utility or configuration files 
   * from the dependency audit.
   */
  isIgnoredFile: (path) => /([\/\\]|^)(__tests__|tests)[\/\\].*(utils|helpers|setup|fixtures)\.[jt]sx?$/.test(path),

  /**
   * experimentalPackages: Substrate entities that are exempt from major version enforcement.
   */
  experimentalPackages: [],

  ignores: [
    'sass',
    'vite-plugin-sass-dts',
    ...peerDeps,
  ],
  ignoreDirs: [
    'dist',
    'public',
  ],
  parsers: {
    '**/*.vue': depcheck.parser.vue,
    '**/*.protocol': protocolParser,
  },
};