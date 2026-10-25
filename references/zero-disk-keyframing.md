# 零磁盘占用远端视频流 1080p 关键帧提取技术指南

> **Created by Xiao Ang** · YouTube 课程体系化研学核心关键技术

---

## 一、技术背景与痛点

在对 YouTube 视频教程进行结构化精读时，图文结合是最关键的辅助学习手段。传统的做法是：
1. 下载完整 `.mp4` 视频到本地（一集 500MB，37 集就是 18.5GB）；
2. 本地播放寻找画面截图；
3. 本地磁盘空间被迅速占满，且庞大的视频文件无法纳入 Git 版本管理。

为了解决这一问题，本项目研发了**「远端流秒级寻道 + 零磁盘持久占用」**的高清截帧方案。

---

## 二、核心命令与管道技术

通过组合 `yt-dlp` 的媒体流嗅探能力与 `ffmpeg` 的高速流媒体寻道解码能力，实现不需要下载完整视频即可在数秒内捕获任意秒数的高清帧：

```bash
# 1. 抓取直接视频流地址 (URL)
STREAM_URL=$(yt-dlp \
  --cookies-from-browser chrome \
  -f "bestvideo[height<=1080][ext=mp4]/bestvideo[height<=1080]/best" \
  -g "https://www.youtube.com/watch?v={VIDEO_ID}")

# 2. ffmpeg 直接从流中寻道并解码截取单张无损 PNG
ffmpeg -ss {HH:MM:SS} \
  -i "$STREAM_URL" \
  -frames:v 1 \
  -q:v 2 \
  study-room/lesson-assets/{OUTPUT_NAME}.png
```

### 参数原理解析：
- `--cookies-from-browser chrome`：带上本地浏览器的认证凭据，完美绕过 YouTube 的 "Sign in to confirm you're not a bot" 机器人拦截验证；
- `-g`：仅输出音视频媒体文件的直接 HTTP/HTTPS 流媒体 URL，不产生任何本地临时下载；
- `-ss {时间戳}` 放在 `-i` 之前：启用快速关键帧寻道（Fast Seek），避免完整下载与解码前面的视频段落；
- `-frames:v 1`：只解码输出 1 帧画面；
- `-q:v 2`：高质量高质量图像输出。

---

## 三、批量自动化 Python 脚本实现

在脚手架 `template/scripts/extract_keyframes.py` 中，该逻辑被封装为全自动化函数：

```python
import subprocess, os

def capture_remote_frame(video_id, timestamp_str, output_path):
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    cmd_get_stream = [
        "yt-dlp",
        "--cookies-from-browser", "chrome",
        "-f", "bestvideo[height<=1080]/best",
        "-g", video_url
    ]
    stream_url = subprocess.check_output(cmd_get_stream).decode().strip().splitlines()[0]

    cmd_ffmpeg = [
        "ffmpeg",
        "-ss", timestamp_str,
        "-i", stream_url,
        "-frames:v", "1",
        "-q:v", "2",
        "-y", output_path
    ]
    subprocess.run(cmd_ffmpeg, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
```

**优势总结**：
- 抓取一张 1080p 帧耗时仅约 1–2 秒；
- 全过程完全在内存流中完成，磁盘写入仅有最终产出的 100KB–300KB 高清 PNG 图片；
- 极大提升多集课程图文精读的制作效率。
