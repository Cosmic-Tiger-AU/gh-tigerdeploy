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
      if (!fs.existsSync(destFile)) fs.rmSync(destFile);
      fs.copyFileSync(srcFile, destFile);
    } else if (fileStats.isDirectory()) {
      fs.mkdirSync(destFile);
      copyDir(srcFile, destFile);
    }
  });
};

const copyFile = async (src: string, dest: string) => {
  try {
    await fs.promises.copyFile(src, dest);
    process.env.DEBUG && console.log(`Copied ${src} to ${dest}`);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error(`Error copying ${src} to ${dest}: ${err}`));
  }
};

export const copyScriptFolderIfExists = async () => {
  const path = getInput('scripts_path');
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

export const copyAppSpecIfExists = async () => {
  if (!getInput('appspec_path')) return Promise.resolve();
  const path = getInput('appspec_path');

  const distPath =
    getInput('dist_path').charAt(-1) === '/'
      ? getInput('dist_path').slice(0, -1)
      : getInput('dist_path');

  try {
    await copyFile(path, `${distPath}/appspec.yml`);

    process.env.DEBUG &&
      console.log(`Copied appspec.yml to ${distPath}/appspec.yml`);

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error(`Error copying appspec.yml: ${err}`));
  }
};
