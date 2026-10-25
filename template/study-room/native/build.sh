#!/bin/zsh
set -euo pipefail

# YouTube Course Study Room - Native macOS App Builder
# Created by Xiao Ang

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_NAME="${APP_NAME:-YouTube 课程学习室}"
APP="${1:-$HOME/Desktop/${APP_NAME}.app}"
CONTENTS="$APP/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"

echo "[*] Building macOS Native App: $APP"

# 1. Generate icon if needed
if [[ ! -f "$ROOT/native/Study.icns" && -f "$ROOT/native/Icon.swift" ]]; then
  echo "[*] Generating app icon via Icon.swift..."
  swift "$ROOT/native/Icon.swift" "$ROOT/native/Study.png"
  ICONSET="$ROOT/native/Study.iconset"
  rm -rf "$ICONSET"
  mkdir -p "$ICONSET"
  for s in 16 32 128 256 512; do
    sips -z $s $s "$ROOT/native/Study.png" --out "$ICONSET/icon_${s}x${s}.png" >/dev/null
    s2=$((s * 2))
    sips -z $s2 $s2 "$ROOT/native/Study.png" --out "$ICONSET/icon_${s}x${s}@2x.png" >/dev/null
  done
  iconutil -c icns "$ICONSET" -o "$ROOT/native/Study.icns"
  rm -rf "$ICONSET"
fi

# 2. Prepare app bundle directory
rm -rf "$APP"
mkdir -p "$MACOS" "$RESOURCES"

cp "$ROOT/native/Info.plist" "$CONTENTS/Info.plist"
/usr/libexec/PlistBuddy -c "Delete :StudyRootPath" "$CONTENTS/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :StudyRootPath string $ROOT" "$CONTENTS/Info.plist"

if [[ -f "$ROOT/native/Study.icns" ]]; then
  cp "$ROOT/native/Study.icns" "$RESOURCES/Study.icns"
fi

# 3. Copy web assets
cp "$ROOT/index.html" "$RESOURCES/index.html"
cp "$ROOT/style.css" "$RESOURCES/style.css"
cp "$ROOT/distill.css" "$RESOURCES/distill.css"
cp "$ROOT/app.js" "$RESOURCES/app.js"
cp "$ROOT/distill.js" "$RESOURCES/distill.js"
cp "$ROOT/library-data.js" "$RESOURCES/library-data.js"
cp "$ROOT/distill-data.js" "$RESOURCES/distill-data.js"
cp "$ROOT/version.js" "$RESOURCES/version.js" 2>/dev/null || true
cp "$ROOT/version.json" "$RESOURCES/version.json" 2>/dev/null || true

if [[ -d "$ROOT/lesson-assets" ]]; then
  ditto "$ROOT/lesson-assets" "$RESOURCES/lesson-assets"
fi

# 4. Compile Swift binary
echo "[*] Compiling Swift binary..."
xcrun swiftc \
  -parse-as-library \
  "$ROOT/native/App.swift" \
  -o "$MACOS/StudyRoom" \
  -framework Cocoa \
  -framework WebKit

# 5. Codesign & validate
codesign --force --deep --sign - "$APP"
plutil -lint "$CONTENTS/Info.plist"

echo "[✓] App successfully built at: $APP"

# 6. Optional automated QA test
if [[ "${2:-}" == "--qa" ]]; then
  echo "[*] Running automated headless QA test..."
  "$MACOS/StudyRoom" --qa
  echo "[✓] Headless QA test passed."
fi
