import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listBuckets() {
  console.log('R2 설정:');
  console.log('Endpoint:', process.env.R2_ENDPOINT);
  console.log('Access Key:', process.env.R2_ACCESS_KEY_ID);

  const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  try {
    const result = await client.send(new ListBucketsCommand({}));
    console.log('\n버킷 목록:');
    if (result.Buckets && result.Buckets.length > 0) {
      result.Buckets.forEach(bucket => {
        console.log('-', bucket.Name);
      });
    } else {
      console.log('(버킷 없음)');
    }
  } catch (error) {
    console.error('버킷 조회 실패:', error);
  }
}

listBuckets();
