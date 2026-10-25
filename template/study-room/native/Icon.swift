import Cocoa

/**
 * YouTube Course Study Room - macOS Icon Generator
 * Created by Xiao Ang
 * Run with: swift Icon.swift output.png
 */

let outputPath = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "Study.png"
let size = NSSize(width: 1024, height: 1024)
let image = NSImage(size: size)
image.lockFocus()

// 1. Base macOS Squircle with deep obsidian-indigo gradient
let bgRect = NSRect(x: 36, y: 36, width: 952, height: 952)
let bgPath = NSBezierPath(roundedRect: bgRect, xRadius: 215, yRadius: 215)
let gradient = NSGradient(colors: [
    NSColor(calibratedRed: 0.08, green: 0.09, blue: 0.14, alpha: 1.0),
    NSColor(calibratedRed: 0.14, green: 0.16, blue: 0.24, alpha: 1.0)
])!
gradient.draw(in: bgPath, angle: -55)

// Outer metallic gold rim
NSColor(calibratedRed: 0.92, green: 0.74, blue: 0.38, alpha: 0.65).setStroke()
bgPath.lineWidth = 10
bgPath.stroke()

// 2. Center TV / Screen container card (Ruby Red to Sunset Orange)
let tvRect = NSRect(x: 180, y: 340, width: 664, height: 420)
let tvPath = NSBezierPath(roundedRect: tvRect, xRadius: 80, yRadius: 80)
let tvGradient = NSGradient(colors: [
    NSColor(calibratedRed: 0.95, green: 0.18, blue: 0.24, alpha: 1.0), // YouTube Red
    NSColor(calibratedRed: 0.82, green: 0.10, blue: 0.18, alpha: 1.0)
])!
tvGradient.draw(in: tvPath, angle: -45)

// Inner subtle screen border
NSColor(calibratedWhite: 1.0, alpha: 0.25).setStroke()
tvPath.lineWidth = 6
tvPath.stroke()

// 3. Central Play Triangle (Crisp Ivory White with soft shadow)
let playPath = NSBezierPath()
let playCenter = NSPoint(x: 525, y: 550)
playPath.move(to: NSPoint(x: playCenter.x - 55, y: playCenter.y + 85))
playPath.line(to: NSPoint(x: playCenter.x + 85, y: playCenter.y))
playPath.line(to: NSPoint(x: playCenter.x - 55, y: playCenter.y - 85))
playPath.close()

NSColor.white.setFill()
playPath.fill()

// 4. Graduation Cap / Knowledge Book Motif above the screen
let capPath = NSBezierPath()
let capApex = NSPoint(x: 512, y: 865)
capPath.move(to: capApex)
capPath.line(to: NSPoint(x: 740, y: 795))
capPath.line(to: NSPoint(x: 512, y: 735))
capPath.line(to: NSPoint(x: 284, y: 795))
capPath.close()

let goldColor = NSColor(calibratedRed: 0.96, green: 0.82, blue: 0.44, alpha: 0.95)
goldColor.setFill()
capPath.fill()

// Tassel hanging to left
let tasselPath = NSBezierPath()
tasselPath.move(to: NSPoint(x: 320, y: 785))
tasselPath.line(to: NSPoint(x: 290, y: 720))
tasselPath.lineWidth = 6
goldColor.setStroke()
tasselPath.stroke()

// 5. Bottom Title / Badge: "STUDY ROOM"
let titleFont = NSFont.monospacedSystemFont(ofSize: 46, weight: .black)
let titleAttrs: [NSAttributedString.Key: Any] = [
    .font: titleFont,
    .foregroundColor: NSColor(calibratedWhite: 0.95, alpha: 0.95),
    .kern: 5.0
]
let text = "STUDY ROOM" as NSString
let textSize = text.size(withAttributes: titleAttrs)
let textPoint = NSPoint(x: (size.width - textSize.width) / 2, y: 190)
text.draw(at: textPoint, withAttributes: titleAttrs)

// Subtitle: "Created by Xiao Ang"
let subFont = NSFont.systemFont(ofSize: 26, weight: .medium)
let subAttrs: [NSAttributedString.Key: Any] = [
    .font: subFont,
    .foregroundColor: NSColor(calibratedRed: 0.92, green: 0.74, blue: 0.38, alpha: 0.85),
    .kern: 2.0
]
let subText = "CREATED BY XIAO ANG" as NSString
let subSize = subText.size(withAttributes: subAttrs)
let subPoint = NSPoint(x: (size.width - subSize.width) / 2, y: 135)
subText.draw(at: subPoint, withAttributes: subAttrs)

image.unlockFocus()

// Write PNG representation to disk
guard let tiffData = image.tiffRepresentation,
      let rep = NSBitmapImageRep(data: tiffData),
      let pngData = rep.representation(using: .png, properties: [:]) else {
    print("Failed to generate PNG data")
    exit(1)
}

try pngData.write(to: URL(fileURLWithPath: outputPath))
print("Successfully generated icon: \(outputPath)")
