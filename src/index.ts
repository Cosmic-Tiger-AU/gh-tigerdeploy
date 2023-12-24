import { getInput, setFailed } from '@actions/core';
import { copyScriptFolderIfExists } from './lib/copySupportingFiles';
import { zipDistFolder } from './lib/zip';
import * as fs from 'node:fs';
import { upload } from './lib/s3';
import { handleAppSpec } from './lib/handleAppSpec';
import { deploy } from './lib/codeDeploy';

const getBucketPrefix = () => {
  if (!getInput('s3_bucket_prefix')) return '';
  const s3_bucket_prefix = getInput('s3_bucket_prefix') || '';
  if (s3_bucket_prefix.charAt(s3_bucket_prefix.length - 1) !== '/') {
    return s3_bucket_prefix + '/';
  }
  return s3_bucket_prefix;
};

const perform = async () => {
  try {
    await copyScriptFolderIfExists();
    await zipDistFolder();
    const zipPathPrefix = getBucketPrefix();
    const zipPath = zipPathPrefix + new Date().getTime().toString() + '.zip';
    const zipFile = fs.readFileSync('dist.zip');
    const uploadResult = await upload(zipFile, zipPath);
    const appspec = handleAppSpec();
    const deployResult = await deploy(
      uploadResult.file,
      appspec.appSpec,
      appspec.sha256
    );
    process.env.DEBUG && console.log('Deployment result', deployResult);
    console.log('Deployment successfully initiated');
  } catch (err) {
    console.error(err);
    setFailed(err.message);
  }
};

perform();
