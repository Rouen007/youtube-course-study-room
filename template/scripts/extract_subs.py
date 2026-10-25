#!/usr/bin/env python3
"""
YouTube Subtitle Extractor & Markdown Formatter
Part of YouTube Course Study Room Framework
Created by Xiao Ang

Extracts English/auto-generated subtitles from YouTube videos or playlists
and formats them into clean, structured Markdown transcripts with timestamps.

Usage:
    python3 extract_subs.py --url "https://www.youtube.com/watch?v=VIDEO_ID" --out ./transcripts/ep01.md
    python3 extract_subs.py --playlist "https://www.youtube.com/playlist?list=PLAYLIST_ID" --out-dir ./transcripts/
"""

import argparse
import json
import os
import re
import subprocess
import sys


def parse_vtt_or_srt(file_path):
    """Parse VTT/SRT file into timestamped dialogue chunks."""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Normalize line endings
    content = content.replace('\r\n', '\n').replace('\r', '\n')

    # Regex for timestamp: 00:01:23.456 --> 00:01:26.789
    time_pattern = re.compile(r'(\d{2}:)?(\d{2}):(\d{2})[\.,]\d{3}\s*-->\s*(\d{2}:)?(\d{2}):(\d{2})[\.,]\d{3}')
    lines = content.split('\n')

    chunks = []
    current_time = "00:00"
    current_text = []

    for line in lines:
        line = line.strip()
        if not line or line.startswith('WEBVTT') or line.startswith('Kind:') or line.startswith('Language:'):
            continue
        if line.isdigit():
            continue

        match = time_pattern.search(line)
        if match:
            # If we had accumulated text, flush it
            if current_text:
                full_line = ' '.join(current_text).strip()
                # Remove redundant repetitive lines often found in auto subs
                if full_line and (not chunks or chunks[-1]['text'] != full_line):
                    chunks.append({'time': current_time, 'text': full_line})
                current_text = []

            # Extract MM:SS
            parts = line.split('-->')[0].strip().split(':')
            if len(parts) == 3:
                h, m, s = parts
                s = s.split('.')[0].split(',')[0]
                current_time = f"{int(h)*60 + int(m):02d}:{s}"
            elif len(parts) == 2:
                m, s = parts
                s = s.split('.')[0].split(',')[0]
                current_time = f"{int(m):02d}:{s}"
        else:
            # Clean HTML tags like <c> </c>
            cleaned = re.sub(r'<[^>]+>', '', line).strip()
            if cleaned:
                current_text.append(cleaned)

    if current_text:
        full_line = ' '.join(current_text).strip()
        if full_line:
            chunks.append({'time': current_time, 'text': full_line})

    return chunks


def group_chunks_into_paragraphs(chunks, interval_seconds=60):
    """Group subtitle chunks into cohesive paragraphs per time window."""
    def to_sec(ts):
        parts = ts.split(':')
        return int(parts[0]) * 60 + int(parts[1])

    if not chunks:
        return []

    paragraphs = []
    current_ts = chunks[0]['time']
    current_start_sec = to_sec(current_ts)
    current_sentences = []

    for c in chunks:
        sec = to_sec(c['time'])
        if sec - current_start_sec >= interval_seconds and current_sentences:
            paragraphs.append({
                'time': current_ts,
                'text': ' '.join(current_sentences)
            })
            current_ts = c['time']
            current_start_sec = sec
            current_sentences = [c['text']]
        else:
            current_sentences.append(c['text'])

    if current_sentences:
        paragraphs.append({
            'time': current_ts,
            'text': ' '.join(current_sentences)
        })

    return paragraphs


def extract_single_video(url, output_path, title=None):
    """Download subtitles for a single video and write formatted Markdown."""
    print(f"[*] Extracting subtitles for: {url}")
    temp_prefix = f"/tmp/yt_sub_{os.getpid()}"

    cmd = [
        "yt-dlp",
        "--cookies-from-browser", "chrome",
        "--skip-download",
        "--write-subs",
        "--write-auto-subs",
        "--sub-lang", "en",
        "--sub-format", "vtt/srt",
        "-o", f"{temp_prefix}.%(ext)s",
        url
    ]

    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        print(f"[!] Warning: yt-dlp error: {e}")

    # Find the generated sub file
    sub_file = None
    for ext in [".en.vtt", ".vtt", ".en.srt", ".srt"]:
        target = f"{temp_prefix}{ext}"
        if os.path.exists(target):
            sub_file = target
            break

    if not sub_file:
        print(f"[!] No subtitles found for {url}")
        return False

    raw_chunks = parse_vtt_or_srt(sub_file)
    paragraphs = group_chunks_into_paragraphs(raw_chunks, interval_seconds=90)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write(f"# {title or 'Episode Transcript'}\n\n")
        out.write(f"> Source: [{url}]({url})\n")
        out.write(f"> Created by Xiao Ang - YouTube Course Study Room\n\n---\n\n")

        for p in paragraphs:
            out.write(f"### `[{p['time']}]`\n{p['text']}\n\n")

    # Clean up temp file
    try:
        if os.path.exists(sub_file):
            os.remove(sub_file)
    except Exception:
        pass

    print(f"[✓] Saved transcript to: {output_path}")
    return True


def main():
    parser = argparse.ArgumentParser(description="YouTube Subtitle Extractor & Formatter (Created by Xiao Ang)")
    parser.add_argument("--url", help="YouTube video URL")
    parser.add_argument("--playlist", help="YouTube playlist URL")
    parser.add_argument("--out", help="Output markdown path (for single video)")
    parser.add_argument("--out-dir", default="./transcripts", help="Output directory (for playlist)")
    args = parser.parse_args()

    if args.url:
        out = args.out or "./transcripts/transcript.md"
        extract_single_video(args.url, out)
    elif args.playlist:
        print(f"[*] Fetching playlist info: {args.playlist}")
        cmd = [
            "yt-dlp",
            "--cookies-from-browser", "chrome",
            "--flat-playlist",
            "-J",
            args.playlist
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            print("[!] Failed to fetch playlist info")
            sys.exit(1)
        data = json.loads(res.stdout)
        entries = data.get("entries", [])
        print(f"[*] Found {len(entries)} items in playlist")

        for idx, entry in enumerate(entries, 1):
            vid = entry.get("id")
            title = entry.get("title", f"Episode {idx}")
            vurl = f"https://www.youtube.com/watch?v={vid}"
            out_file = os.path.join(args.out_dir, f"ep{idx:02d}.md")
            extract_single_video(vurl, out_file, title=f"Ep {idx:02d}: {title}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
