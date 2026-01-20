import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listR2() {
  console.log('버킷 이름:', process.env.R2_BUCKET_NAME);
  console.log('Public URL:', process.env.R2_PUBLIC_URL);
  console.log('Endpoint:', process.env.R2_ENDPOINT);

  const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  try {
    const result = await client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 10,
    }));

    console.log('\n버킷 내 파일 목록:');
    if (result.Contents) {
      result.Contents.forEach(obj => {
        console.log('-', obj.Key, '(' + obj.Size + ' bytes)');
      });
    } else {
      console.log('(비어있음)');
    }
  } catch (error) {
    console.error('버킷 조회 실패:', error);
  }
}

listR2();
