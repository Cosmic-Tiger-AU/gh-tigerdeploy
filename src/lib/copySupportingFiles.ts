import { getInput } from '@actions/core';
import * as fs from 'node:fs';

const copyDir = (src: string, dest: string) => {
  const listDirectory = fs.readdirSync(src);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest);

  listDirectory.forEach((file) => {
    const srcFile = `${src}/${file}`;
    const destFile = `${dest}/${file}`;
    const fileStats = fs.statSync(srcFile);
    if (fileStats.isFile()) {
      fs.copyFileSync(srcFile, destFile, fs.constants.COPYFILE_FICLONE_FORCE); // Use COPYFILE_FICLONE_FORCE flag to overwrite existing files
    } else if (fileStats.isDirectory()) {
      fs.mkdirSync(destFile);
      copyDir(srcFile, destFile);
    }
  });
};

export const copyScriptFolderIfExists = async () => {
  const path = getInput('codedeploy_scripts_path');
  const distPath = getInput('dist_path');

  try {
    copyDir(path, distPath);

    process.env.DEBUG &&
      console.log(`Copied scripts folder to ${distPath}/scripts`);

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error(`Error copying scripts folder: ${err}`));
  }
};
