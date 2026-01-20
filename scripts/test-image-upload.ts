import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testImageUpload() {
  const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  // 1x1 투명 PNG 이미지 (base64)
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const imageBuffer = Buffer.from(base64Png, 'base64');

  const timestamp = Date.now();
  const key = 'logos/test-logo-' + timestamp + '.png';

  try {
    await client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/png',
    }));

    const url = process.env.R2_PUBLIC_URL + '/' + key;
    console.log('✅ 이미지 업로드 성공!');
    console.log('URL:', url);

    // URL 접근 테스트
    const response = await fetch(url);
    console.log('URL 접근:', response.status === 200 ? '✅ 성공' : '❌ 실패 (' + response.status + ')');
  } catch (error) {
    console.error('❌ 업로드 실패:', error);
  }
}

testImageUpload();
