import * as fs from 'fs';
import * as crypto from 'crypto';
import { getInput } from '@actions/core';

const readAppSpec = (appSpecPath: string): string => {
  try {
    const appSpec = fs.readFileSync(appSpecPath, 'utf8');
    return appSpec;
  } catch (err) {
    throw new Error(`Error reading appspec file: ${err}`);
  }
};

const getSHA256 = (appSpec: string): string => {
  const hash = crypto.createHash('sha256');
  hash.update(appSpec);
  return hash.digest('hex');
};

export const handleAppSpec = () => {
  const appSpecPath = getInput('codedeploy_appspec_path');
  const appSpec = readAppSpec(appSpecPath);
  const sha256 = getSHA256(appSpec);

  process.env.DEBUG && console.log(`AppSpec SHA256: ${sha256}`);

  return {
    appSpec,
    sha256,
  };
};
