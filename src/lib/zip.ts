import { getInput } from '@actions/core';
import { exec } from 'node:child_process';

export const zipDistFolder = async () => {
  // zip using native commands
  const distPath = getInput('dist_path');
  const zipPath = 'dist.zip';

  // Handle zip on linux, windows, mac
  const zipCommand =
    process.platform === 'win32' ? 'powershell Compress-Archive' : 'zip';
  const zipArgs =
    process.platform === 'win32'
      ? `-Path ${distPath} -DestinationPath ${zipPath}`
      : `-r ${zipPath} ${distPath}`;

  try {
    await exec(`${zipCommand} ${zipArgs}`);
    process.env.DEBUG && console.log(`Zipped dist folder to ${zipPath}`);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error(`Error zipping dist folder: ${err}`));
  }
};
