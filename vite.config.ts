import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/pages/auth/login/login.html'),
        register: resolve(__dirname, 'src/pages/auth/register/register.html'),
      },
    },
  },
  server: {
    host: true,        
    port: 5173,       
    strictPort: true,  
  },
});
