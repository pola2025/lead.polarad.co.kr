import { defineConfig } from 'vite';
import motionCanvas from '@motion-canvas/vite-plugin';
import ffmpeg from '@motion-canvas/ffmpeg';

export default defineConfig({
  plugins: [
    motionCanvas({
      project: [
        './src/project.ts',        // 4K 버전
        './src/project-mobile.ts', // 모바일 9:16 버전
      ],
    }),
    ffmpeg(),
  ],
});
