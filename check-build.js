const fs = require('fs');
const path = require('path');

// 检查 dist/webview.js 和 webview.css 是否存在
const distPath = path.join(__dirname, 'dist');
const webviewJsPath = path.join(distPath, 'webview.js');
const webviewCssPath = path.join(distPath, 'webview.css');

console.log('Checking dist directory...');
console.log('Dist directory exists:', fs.existsSync(distPath));
console.log('webview.js exists:', fs.existsSync(webviewJsPath));
if (fs.existsSync(webviewJsPath)) {
  const stats = fs.statSync(webviewJsPath);
  console.log('webview.js size:', stats.size, 'bytes');
}

console.log('webview.css exists:', fs.existsSync(webviewCssPath));
if (fs.existsSync(webviewCssPath)) {
  const stats = fs.statSync(webviewCssPath);
  console.log('webview.css size:', stats.size, 'bytes');
}

// 检查 webview.js 内容
if (fs.existsSync(webviewJsPath)) {
  const content = fs.readFileSync(webviewJsPath, 'utf8');
  console.log(
    '\nwebview.js contains React:',
    content.includes('React.createElement')
  );
  console.log(
    'webview.js contains main entry:',
    content.includes('createRoot')
  );
}
