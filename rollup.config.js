import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";

import { babel } from "@rollup/plugin-babel";
import bundleSize from "rollup-plugin-bundle-size";
import packageJson from "./package.json" with { type: "json" };
import path from "path";

const name = packageJson.name;
const input = "./src/index.ts";

const buildConfig = ({ es5, minifiedVersion = true, ...config }) => {
  const { file } = config.output;
  const ext = path.extname(file);
  const basename = path.basename(file, ext);
  const extArr = ext.split(".");
  extArr.shift();

  const build = ({ minified }) => ({
    input,
    ...config,
    output: {
      ...config.output,
      file: `${path.dirname(file)}/${basename}.${(minified ? ["min", ...extArr] : extArr).join(".")}`,
      sourcemap: true,

    },
    external: ["react"],
    plugins: [
      json(),
      resolve({ browser: true }),
      commonjs(),
      typescript(),
      minified && terser(),
      minified && bundleSize(),
      ...(es5 ? [babel({
        babelHelpers: "bundled",
        presets: ["@babel/preset-env"],
      })] : []),
      ...(config.plugins || []),
    ],
  });

  const configs = [
    build({ minified: false }),
  ];

  if (minifiedVersion) {
    configs.push(build({ minified: true }));
  }

  return configs;
};

export default () => {
  const year = new Date().getFullYear();
  const banner = `// ${packageJson.name} v${packageJson.version} Copyright (c) ${year} ${packageJson.author}`;

  return [
    ...buildConfig({
      output: {
        file: `dist/index.es.js`,
        format: "esm",
        banner,
      },
    }),
    ...buildConfig({
      es5: true,
      output: {
        file: `dist/index.js`,
        name,
        format: "umd",
        banner,
      },
    }),
    ...buildConfig({
      es5: false,
      minifiedVersion: false,
      output: {
        file: `dist/index.cjs`,
        name,
        format: "cjs",
        banner,
      },
    }),

  ];
};
