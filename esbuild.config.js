const esbuild = require('esbuild');
const { sassPlugin } = require('esbuild-sass-plugin');
const path = require('path');
const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const sharedConfig = {
  minify: production,
  sourcemap: !production,
  sourcesContent: false,
  logLevel: 'warning',
  target: ['es2020'],
};

async function build() {
  try {
    const reactAlias = {
      react: path.resolve(__dirname, 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
    };

    // 构建 VSCode 扩展（CommonJS 格式，用于 Node.js 环境）
    const extensionConfig = {
      ...sharedConfig,
      entryPoints: ['src/extension.ts'],
      bundle: true,
      format: 'cjs',
      platform: 'node',
      packages: 'external',
      outfile: 'dist/extension.js',
      external: ['vscode'],
    };

    // 构建 React WebView（ESM 格式，用于浏览器环境）
    const webviewConfig = {
      ...sharedConfig,
      entryPoints: ['webview/src/main.tsx'],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: 'dist/webview.js',
      alias: reactAlias,
      plugins: [sassPlugin()],
      loader: {
        '.tsx': 'tsx',
        '.css': 'css',
        '.svg': 'dataurl',
        '.eot': 'file',
        '.woff': 'file',
        '.woff2': 'file',
        '.ttf': 'file',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    };

    if (watch) {
      const ctxExtension = await esbuild.context(extensionConfig);
      const ctxWebview = await esbuild.context(webviewConfig);
      console.log('👀 Watching for changes...');
      await Promise.all([ctxExtension.watch(), ctxWebview.watch()]);
    } else {
      await Promise.all([
        esbuild.build(extensionConfig),
        esbuild.build(webviewConfig),
      ]);
      console.log('✅ Build completed successfully');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
