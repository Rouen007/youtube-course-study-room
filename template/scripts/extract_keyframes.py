#!/usr/bin/env python3
"""
Zero-Disk High-Resolution YouTube Keyframe Extractor
Part of YouTube Course Study Room Framework
Created by Xiao Ang

Extracts crystal-clear 1080p keyframes directly from remote YouTube video streams
using yt-dlp stream discovery and FFmpeg seek without saving massive video files to disk.

Usage:
    python3 extract_keyframes.py --url "https://youtu.be/VIDEO_ID" --time "12:34" --out ./lesson-assets/ep01_keyframe.png
    python3 extract_keyframes.py --batch keyframes.json --out-dir ./lesson-assets/
"""

import argparse
import json
import os
import re
import subprocess
import sys


def parse_timestamp(ts_str):
    """Normalize timestamp string (e.g. '12:34', '1:02:15', '754') to HH:MM:SS format."""
    ts_str = str(ts_str).strip()
    if re.match(r'^\d+$', ts_str):
        total_sec = int(ts_str)
        h = total_sec // 3600
        m = (total_sec % 3600) // 60
        s = total_sec % 60
        return f"{h:02d}:{m:02d}:{s:02d}"

    parts = ts_str.split(':')
    if len(parts) == 2:
        return f"00:{int(parts[0]):02d}:{int(parts[1]):02d}"
    elif len(parts) == 3:
        return f"{int(parts[0]):02d}:{int(parts[1]):02d}:{int(parts[2]):02d}"
    return ts_str


def get_stream_url(video_url_or_id):
    """Fetch direct 1080p stream URL via yt-dlp."""
    if not video_url_or_id.startswith('http'):
        url = f"https://www.youtube.com/watch?v={video_url_or_id}"
    else:
        url = video_url_or_id

    cmd = [
        "yt-dlp",
        "--cookies-from-browser", "chrome",
        "-f", "bestvideo[height<=1080]/best",
        "-g",
        url
    ]

    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"[!] Error obtaining stream URL for {url}:\n{res.stderr.strip()}", file=sys.stderr)
        return None

    stream_url = res.stdout.strip().split('\n')[0]
    return stream_url


def capture_frame(stream_url, timestamp, output_path):
    """Extract single frame at timestamp using FFmpeg without disk download."""
    norm_ts = parse_timestamp(timestamp)
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    cmd = [
        "ffmpeg",
        "-ss", norm_ts,
        "-i", stream_url,
        "-frames:v", "1",
        "-q:v", "2",
        "-y",
        output_path
    ]

    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode != 0 or not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        print(f"[!] FFmpeg capture failed at {norm_ts} to {output_path}", file=sys.stderr)
        return False

    size_kb = os.path.getsize(output_path) // 1024
    print(f"[✓] Captured {output_path} ({size_kb} KB) at {norm_ts}")
    return True


def process_batch(batch_file, default_out_dir="./lesson-assets"):
    """Process batch extraction from JSON file."""
    with open(batch_file, 'r', encoding='utf-8') as f:
        tasks = json.load(f)

    if not isinstance(tasks, list):
        print("[!] Batch file must be a JSON array of task objects.", file=sys.stderr)
        return

    print(f"[*] Processing {len(tasks)} keyframe tasks from {batch_file}...")

    # Cache stream URLs per video ID to avoid redundant yt-dlp calls
    stream_cache = {}

    for idx, item in enumerate(tasks, 1):
        vid = item.get("videoId") or item.get("url")
        ts = item.get("timestamp") or item.get("time")
        filename = item.get("filename") or item.get("output") or f"frame_{idx:03d}.png"
        out_path = os.path.join(default_out_dir, filename)

        if not vid or not ts:
            print(f"[!] Skipping invalid task #{idx}: {item}")
            continue

        if os.path.exists(out_path):
            print(f"[~] Skipping existing file: {out_path}")
            continue

        print(f"[{idx}/{len(tasks)}] Extracting keyframe: {filename} @ {ts}")
        if vid not in stream_cache:
            stream_url = get_stream_url(vid)
            if stream_url:
                stream_cache[vid] = stream_url
            else:
                print(f"[!] Failed to get stream for {vid}")
                continue

        capture_frame(stream_cache[vid], ts, out_path)


def main():
    parser = argparse.ArgumentParser(description="Zero-Disk YouTube 1080p Keyframe Extractor (Created by Xiao Ang)")
    parser.add_argument("--url", help="YouTube video URL or Video ID")
    parser.add_argument("--time", help="Timestamp (e.g. '08:45' or '01:23:45')")
    parser.add_argument("--out", help="Output image file path (e.g. ./lesson-assets/sample.png)")
    parser.add_argument("--batch", help="Batch JSON file path")
    parser.add_argument("--out-dir", default="./lesson-assets", help="Output directory for batch processing")
    args = parser.parse_args()

    if args.batch:
        process_batch(args.batch, args.out_dir)
    elif args.url and args.time and args.out:
        stream = get_stream_url(args.url)
        if stream:
            success = capture_frame(stream, args.time, args.out)
            sys.exit(0 if success else 1)
        else:
            sys.exit(1)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
