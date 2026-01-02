const fs = require('fs');
const path = require('path');

// 配置
const TARGET_DIR = path.join(__dirname, 'src');
const OUTPUT_FILE = path.join(__dirname, 'full_project_context.txt');
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'assets', '.DS_Store'];
const ALLOWED_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json'];

let output = `PROJECT SCAN TIMESTAMP: ${new Date().toISOString()}\n\n`;

function scanDirectory(directory) {
    if (!fs.existsSync(directory)) {
        console.log(`⚠️ 跳过: 找不到目录 ${directory}`);
        return;
    }

    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                scanDirectory(fullPath);
            }
        } else {
            const ext = path.extname(file);
            if (ALLOWED_EXTS.includes(ext)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    output += `\n\n================================================\n`;
                    output += `FILE PATH: ${path.relative(__dirname, fullPath)}\n`;
                    output += `================================================\n`;
                    output += content;
                } catch (err) {
                    console.log(`❌ 无法读取文件: ${file}`);
                }
            }
        }
    });
}

console.log('🚀 开始扫描...');

// 1. 扫描 src
scanDirectory(TARGET_DIR);

// 2. 额外扫描根目录下的关键配置 (vite.config.js, package.json, index.html)
['package.json', 'vite.config.js', 'index.html', 'postcss.config.js', 'tailwind.config.js'].forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        output += `\n\n================================================\n`;
        output += `FILE PATH: ${file}\n`;
        output += `================================================\n`;
        output += fs.readFileSync(filePath, 'utf-8');
    }
});

try {
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`\n✅ 成功！文件已生成！`);
    console.log(`📂 文件位置: ${OUTPUT_FILE}`); 
    console.log(`👉 请去左侧文件列表找到 "full_project_context.txt"`);
} catch (error) {
    console.error('❌ 写入失败:', error);
}