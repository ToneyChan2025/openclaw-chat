# Tauri 图标

此目录需要包含以下图标文件：

- `32x32.png` - 32x32 像素 PNG 图标
- `128x128.png` - 128x128 像素 PNG 图标
- `128x128@2x.png` - 256x256 像素 PNG 图标（Retina）
- `icon.icns` - macOS 图标格式
- `icon.ico` - Windows 图标格式

## 生成图标

使用 Tauri CLI 生成图标：

```bash
cd client
npm install -g @tauri-apps/cli
tauri icon path/to/your/icon.png
```

或者使用在线工具生成后放置到此目录。

## 临时解决方案

如果没有图标，构建可能会失败。可以先用任意 PNG 图片重命名为上述文件名。
