import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('React Native Appwrite Expo 57 compatibility', () => {
  it('loads legacy file upload helpers from Expo FileSystem’s explicit legacy entrypoint', () => {
    const sdkRoot = path.dirname(require.resolve('react-native-appwrite/package.json'));
    const esm = readFileSync(path.join(sdkRoot, 'dist/esm/sdk.js'), 'utf8');
    const cjs = readFileSync(path.join(sdkRoot, 'dist/cjs/sdk.js'), 'utf8');

    expect(esm).toContain("from 'expo-file-system/legacy'");
    expect(cjs).toContain("require('expo-file-system/legacy')");
    expect(esm).not.toContain("from 'expo-file-system';");
    expect(cjs).not.toContain("require('expo-file-system');");
  });
});
