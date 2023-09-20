/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/ts/index.tsx'],
            refresh: true,
        }),
        react()
    ],
    test:{
        globals:true,
        environment:'jsdom'
    }
});
