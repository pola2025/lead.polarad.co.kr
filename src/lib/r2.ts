import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

let _client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!_client) {
    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      throw new Error("R2 환경변수가 설정되지 않았습니다.");
    }

    _client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return _client;
}

function getBucketName(): string {
  if (!process.env.R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME 환경변수가 설정되지 않았습니다.");
  }
  return process.env.R2_BUCKET_NAME;
}

function getPublicUrl(): string {
  if (!process.env.R2_PUBLIC_URL) {
    throw new Error("R2_PUBLIC_URL 환경변수가 설정되지 않았습니다.");
  }
  return process.env.R2_PUBLIC_URL;
}

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const bucket = getBucketName();
  const publicUrl = getPublicUrl();

  // 파일명에 타임스탬프 추가하여 중복 방지
  const timestamp = Date.now();
  const ext = fileName.split(".").pop();
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const key = `polarlead/logos/${baseName}-${timestamp}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return `${publicUrl}/${key}`;
}

export async function deleteFromR2(url: string): Promise<void> {
  const client = getR2Client();
  const bucket = getBucketName();
  const publicUrl = getPublicUrl();

  // URL에서 key 추출
  const key = url.replace(`${publicUrl}/`, "");

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (error) {
    console.error("R2 파일 삭제 실패:", error);
  }
}
