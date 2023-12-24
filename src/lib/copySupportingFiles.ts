import { getInput } from '@actions/core';
import { copy } from 'fs-extra';

const copyFile = async (src: string, dest: string) => {
  try {
    await copy(src, dest);
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
    await copy(path, `${distPath}/scripts`);

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
