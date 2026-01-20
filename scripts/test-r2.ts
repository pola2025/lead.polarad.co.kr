import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testR2() {
  console.log('R2 환경변수 확인:');
  console.log('- R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? '설정됨' : '없음');
  console.log('- R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? '설정됨' : '없음');
  console.log('- R2_ENDPOINT:', process.env.R2_ENDPOINT);
  console.log('- R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME);
  console.log('- R2_PUBLIC_URL:', process.env.R2_PUBLIC_URL);

  const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  // 테스트 업로드
  const testContent = Buffer.from('test content');
  const timestamp = Date.now();
  const key = 'test/test-' + timestamp + '.txt';

  try {
    await client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: testContent,
      ContentType: 'text/plain',
    }));

    const url = process.env.R2_PUBLIC_URL + '/' + key;
    console.log('\n✅ R2 업로드 성공!');
    console.log('URL:', url);
  } catch (error) {
    console.error('\n❌ R2 업로드 실패:', error);
  }
}

testR2();
