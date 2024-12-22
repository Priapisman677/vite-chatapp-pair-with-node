import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        chat: './chat.html', // Add your additional HTML files here
      },
    },
  },
});
