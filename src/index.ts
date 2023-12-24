import { getInput, setFailed } from '@actions/core';
import { readFile } from 'fs-extra';
import {
  copyAppSpecIfExists,
  copyScriptFolderIfExists,
} from './lib/copySupportingFiles';
import { invokeLambda } from './lib/invokeLambda';
import { upload } from './lib/s3';
import { zipDistFolder } from './lib/zip';
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
    await copyAppSpecIfExists();
    const zipPathPrefix = getBucketPrefix();
    const zipPath = zipPathPrefix + new Date().getTime().toString() + '.zip';
    const zipFile = await readFile('dist.zip');
    const uploadResult = await upload(zipFile, zipPath);
    process.env.DEBUG && console.log('Upload result', uploadResult);

    // lambda invoke
    const lambda = await invokeLambda(
      getInput('lambda_function_name'),
      JSON.stringify({
        artifact: zipPath,
      })
    );

    process.env.DEBUG && console.log('Lambda invoke result', lambda);

    console.log('Deployment successfully initiated');
  } catch (err) {
    console.error(err);
    setFailed(err.message);
  }
};

perform();
