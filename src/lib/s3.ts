import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getInput } from '@actions/core';
import type { Readable } from 'node:stream';

const getClient = () => {
  const region = getInput('s3_bucket_region');
  const accessKeyId = getInput('aws_access_key_id');
  const secretAccessKey = getInput('aws_secret_access_key');
  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

const uploadFile = async (
  body: string | Readable | Uint8Array | Buffer,
  key: string
) => {
  const client = getClient();
  const bucket = getInput('s3_bucket_name');
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
  });
  const result = await client.send(command);
  // Error handle

  if (result.$metadata.httpStatusCode !== 200) {
    return Promise.reject(
      `Error uploading file to S3: ${result.$metadata.httpStatusCode} - cfid: ${result.$metadata.cfId}`
    );
  }

  return result;
};

/**
 * Upload a file to S3
 * @param body The file body to upload
 * @param key The key to use for the file
 * @returns The result of the upload
 * @throws Error if the upload fails
 * @example const result = await upload(BODY_AS_FORMAT_REQUIRED, 'hello.txt');
 */
export const upload = async (
  body: string | Readable | Uint8Array | Buffer,
  key: string
) => {
  try {
    const result = await uploadFile(body, key);

    process.env.DEBUG &&
      console.log(
        `Uploaded file to S3: ${result.$metadata.httpStatusCode} - cfid: ${result.$metadata.cfId}`
      );

    return Promise.resolve({
      statusCode: result.$metadata.httpStatusCode,
      cfId: result.$metadata.cfId,
      file: key,
    });
  } catch (err) {
    return Promise.reject(new Error(`Error uploading file to S3: ${err}`));
  }
};
