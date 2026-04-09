import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pngToIco from 'png-to-ico';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.join(__dirname, '..', 'public', 'app.png');
const buildDir = path.join(__dirname, '..', 'build');

// 确保 build 目录存在
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// 读取源文件
const sourceBuffer = fs.readFileSync(sourcePath);

// 生成不同尺寸的 PNG 图标
async function generateIcons() {
  // 生成 Mac icns 需要的各种尺寸
  const macSizes = [16, 32, 64, 128, 256, 512, 1024];
  const macIconDir = path.join(buildDir, 'mac-icons');
  if (!fs.existsSync(macIconDir)) {
    fs.mkdirSync(macIconDir, { recursive: true });
  }

  for (const size of macSizes) {
    await sharp(sourceBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(macIconDir, `icon_${size}x${size}.png`));
  }

  // 生成 512x512 PNG（用于 Linux 和通用用途）
  await sharp(sourceBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(buildDir, 'icon.png'));

  // 生成 Windows ICO 需要的 PNG 文件
  const winSizes = [16, 32, 48, 64, 128, 256];
  const winIconDir = path.join(buildDir, 'win-icons');
  if (!fs.existsSync(winIconDir)) {
    fs.mkdirSync(winIconDir, { recursive: true });
  }

  const winPngPaths = [];
  for (const size of winSizes) {
    const pngPath = path.join(winIconDir, `icon_${size}x${size}.png`);
    await sharp(sourceBuffer)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    winPngPaths.push(pngPath);
  }

  // 使用 png-to-ico 生成 .ico 文件
  try {
    const icoBuffer = await pngToIco(winPngPaths);
    fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);
  } catch {
    // 生成失败时静默处理
  }

  // 生成 Mac .icns 文件
  try {
    await generateIcns(macIconDir, path.join(buildDir, 'icon.icns'));
  } catch {
    // 生成失败时静默处理
  }
}

// 生成 Mac .icns 文件
async function generateIcns(iconDir, outputPath) {
  const iconsetDir = outputPath.replace('.icns', '.iconset');
  
  // 创建 .iconset 目录
  if (!fs.existsSync(iconsetDir)) {
    fs.mkdirSync(iconsetDir, { recursive: true });
  }

  // 复制并重命名图标文件到 .iconset 目录
  const sizes = [16, 32, 128, 256, 512];
  for (const size of sizes) {
    const normalSrc = path.join(iconDir, `icon_${size}x${size}.png`);
    const retinaSrc = path.join(iconDir, `icon_${size * 2}x${size * 2}.png`);
    
    const normalDest = path.join(iconsetDir, `icon_${size}x${size}.png`);
    const retinaDest = path.join(iconsetDir, `icon_${size}x${size}@2x.png`);
    
    if (fs.existsSync(normalSrc)) {
      fs.copyFileSync(normalSrc, normalDest);
    }
    if (fs.existsSync(retinaSrc)) {
      fs.copyFileSync(retinaSrc, retinaDest);
    }
  }

  // 使用 iconutil 生成 .icns 文件
  const { execSync } = await import('child_process');
  execSync(`iconutil -c icns "${iconsetDir}" -o "${outputPath}"`);
  
  // 清理临时 .iconset 目录
  fs.rmSync(iconsetDir, { recursive: true, force: true });
}

generateIcons().catch(() => {
  // 错误处理
});
