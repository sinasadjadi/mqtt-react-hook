import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({

    resolve: { alias: { "@": path.resolve('src/') } },
    build: {
        outDir: "lib",
        // manifest: true,
        // minify: true,
        // // reportCompressedSize: true,
        emptyOutDir: true,
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "ReactMqtt",
            formats: ["es", "cjs", "umd"],
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: ["react", "react-dom", "./src/test"],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                },
            },
        },
    },
    plugins: [react(), dts()]
})
