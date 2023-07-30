import S3 from "aws-sdk/clients/s3";

export const getPresignedUrl = async (key: string) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: `${key}.webm`,
    Expires: 60 * 5, // five minutes expiration
    ContentType: "audio/webm",
    //TODO: add maxlength
    ContentLength: 1000000,
  };
  if (!process.env.AWS_ACCES_KEY) {
    throw new Error("AWS_ACCES_KEY not set");
  }
  if (!process.env.AWS_SECRET) {
    throw new Error("AWS_SECRET not set");
  }
  const s3Client = new S3({
    apiVersion: "latest",
    region: "eu-central-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCES_KEY,
      secretAccessKey: process.env.AWS_SECRET,
    },
  });
  const url = await s3Client.getSignedUrlPromise("putObject", params);
  return url;
};
