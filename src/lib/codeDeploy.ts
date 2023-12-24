import { getInput } from '@actions/core';
import {
  CodeDeployClient,
  CreateDeploymentCommand,
  type RevisionLocation,
} from '@aws-sdk/client-codedeploy';

const getClient = () => {
  const region = getInput('codedeploy_region');
  const accessKeyId = getInput('aws_access_key_id');
  const secretAccessKey = getInput('aws_secret_access_key');
  return new CodeDeployClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

const createDeployment = async (
  s3_key: string,
  appspec: string,
  appspec_signature: string
) => {
  const client = getClient();
  const applicationName = getInput('codedeploy_app_name');
  const deploymentGroupName = getInput('codedeploy_deployment_group_name');
  const revision: RevisionLocation = {
    revisionType: 'S3',
    appSpecContent: {
      content: appspec,
      sha256: appspec_signature,
    },
    s3Location: {
      bucket: getInput('s3_bucket_name'),
      bundleType: 'zip',
      key: s3_key,
    },
  };
  const command = new CreateDeploymentCommand({
    applicationName,
    deploymentGroupName,
    revision,
  });
  const result = await client.send(command);
  // Error handle

  if (result.$metadata.httpStatusCode !== 200) {
    return Promise.reject(
      `Error creating deployment: ${result.$metadata.httpStatusCode} - cfid: ${result.$metadata.cfId}`
    );
  }

  return result;
};

/**
 * Create a deployment in CodeDeploy
 * @param s3_key The key of the file to deploy
 * @param appspec The appspec file contents
 * @param appspec_signature The appspec file signature
 * @returns The result of the deployment
 * @throws Error if the deployment fails
 * @example const result = await deploy('hello.txt', 'appspec contents', 'appspec signature');
 */

export const deploy = async (
  s3_key: string,
  appspec: string,
  appspec_signature: string
) => {
  try {
    const result = await createDeployment(s3_key, appspec, appspec_signature);

    process.env.DEBUG &&
      console.log(
        `Created deployment: ${result.$metadata.httpStatusCode} - cfid: ${result.$metadata.cfId}`
      );

    return result;
  } catch (err) {
    return Promise.reject(new Error(`Error creating deployment: ${err}`));
  }
};
