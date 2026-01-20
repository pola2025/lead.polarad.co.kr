import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testFresh() {
  const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const timestamp = Date.now();
  const key = 'test-fresh-' + timestamp + '.txt';
  const content = 'Hello R2 ' + timestamp;

  console.log('업로드 중...');
  console.log('Bucket:', process.env.R2_BUCKET_NAME);
  console.log('Key:', key);

  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(content),
    ContentType: 'text/plain',
  }));

  const url = process.env.R2_PUBLIC_URL + '/' + key;
  console.log('\n업로드 완료!');
  console.log('Public URL:', url);

  // 2초 대기 후 접근 테스트
  console.log('\n2초 대기 후 접근 테스트...');
  await new Promise(r => setTimeout(r, 2000));

  const response = await fetch(url);
  console.log('HTTP Status:', response.status);

  if (response.ok) {
    const text = await response.text();
    console.log('Content:', text);
  } else {
    console.log('Response:', await response.text());
  }
}

testFresh().catch(console.error);
