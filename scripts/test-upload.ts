import * as fs from 'fs';
import * as path from 'path';

async function testUpload() {
  // 테스트용 이미지 생성 (1x1 PNG)
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(base64Png, 'base64');
  
  // FormData 생성
  const formData = new FormData();
  const blob = new Blob([buffer], { type: 'image/png' });
  formData.append('file', blob, 'test-logo.png');
  
  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testUpload();
