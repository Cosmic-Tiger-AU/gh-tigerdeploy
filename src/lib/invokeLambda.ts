import { getInput } from '@actions/core';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
const getClient = () => {
  return new LambdaClient({
    region: getInput('aws_region'),
    credentials: {
      accessKeyId: getInput('aws_access_key_id'),
      secretAccessKey: getInput('aws_secret_access_key'),
    },
  });
};

export const invokeLambda = async (functionName: string, payload: string) => {
  const client = getClient();
  const command = new InvokeCommand({
    FunctionName: functionName,
    Payload: payload,
  });
  const response = await client.send(command);
  return response;
};
