import AppKit
import Foundation

struct SnapshotConfiguration {
    let name: String
    let width: Int
    let height: Int
    let dark: Bool
    let phase: CGFloat
    let scale: CGFloat
}

struct Palette {
    let background: NSColor
    let base: NSColor
    let depth: NSColor
    let warmth: NSColor
    let surface: NSColor
    let highlight: NSColor
    let contour: NSColor
}

func color(_ hex: UInt32, alpha: CGFloat = 1) -> NSColor {
    NSColor(
        calibratedRed: CGFloat((hex >> 16) & 0xff) / 255,
        green: CGFloat((hex >> 8) & 0xff) / 255,
        blue: CGFloat(hex & 0xff) / 255,
        alpha: alpha
    )
}

func palette(dark: Bool) -> Palette {
    dark
        ? Palette(background: color(0x0C0F0D), base: color(0x343C3D), depth: color(0x52636A),
                  warmth: color(0x8A7465), surface: color(0x68756F), highlight: color(0xCDD1C8),
                  contour: color(0xDEE2DA, alpha: 0.17))
        : Palette(background: color(0xF2F0E9), base: color(0xD7D4CC), depth: color(0x77858A),
                  warmth: color(0xB99C87), surface: color(0x929D97), highlight: color(0xF4F0E7),
                  contour: color(0x454E4C, alpha: 0.20))
}

func point(_ x: CGFloat, _ y: CGFloat, in rect: NSRect) -> NSPoint {
    NSPoint(x: rect.minX + rect.width * x / 200, y: rect.minY + rect.height * (200 - y) / 200)
}

func surfacePath(index: Int, in rect: NSRect) -> NSBezierPath {
    let path = NSBezierPath()
    if index == 0 {
        path.move(to: point(42, 72, in: rect))
        path.curve(to: point(157, 76, in: rect), controlPoint1: point(70, 55, in: rect),
                   controlPoint2: point(117, 55, in: rect))
        path.curve(to: point(82, 82, in: rect), controlPoint1: point(136, 68, in: rect),
                   controlPoint2: point(105, 71, in: rect))
        path.curve(to: point(42, 72, in: rect), controlPoint1: point(64, 91, in: rect),
                   controlPoint2: point(50, 87, in: rect))
        path.close()
    } else if index == 1 {
        path.move(to: point(33, 112, in: rect))
        path.curve(to: point(119, 116, in: rect), controlPoint1: point(62, 96, in: rect),
                   controlPoint2: point(92, 102, in: rect))
        path.curve(to: point(168, 116, in: rect), controlPoint1: point(137, 126, in: rect),
                   controlPoint2: point(153, 126, in: rect))
    } else {
        path.move(to: point(54, 145, in: rect))
        path.curve(to: point(145, 151, in: rect), controlPoint1: point(84, 132, in: rect),
                   controlPoint2: point(116, 137, in: rect))
    }
    return path
}

func organicSpherePath(in rect: NSRect) -> NSBezierPath {
    let path = NSBezierPath()
    path.move(to: point(101, 22, in: rect))
    path.curve(to: point(168, 57, in: rect), controlPoint1: point(128, 22, in: rect),
               controlPoint2: point(151, 35, in: rect))
    path.curve(to: point(174, 124, in: rect), controlPoint1: point(181, 76, in: rect),
               controlPoint2: point(181, 102, in: rect))
    path.curve(to: point(119, 178, in: rect), controlPoint1: point(166, 151, in: rect),
               controlPoint2: point(145, 171, in: rect))
    path.curve(to: point(44, 156, in: rect), controlPoint1: point(91, 185, in: rect),
               controlPoint2: point(63, 174, in: rect))
    path.curve(to: point(24, 87, in: rect), controlPoint1: point(26, 139, in: rect),
               controlPoint2: point(20, 112, in: rect))
    path.curve(to: point(68, 28, in: rect), controlPoint1: point(28, 61, in: rect),
               controlPoint2: point(45, 39, in: rect))
    path.curve(to: point(101, 22, in: rect), controlPoint1: point(78, 23, in: rect),
               controlPoint2: point(90, 21, in: rect))
    path.close()
    return path
}

func organicCorePath(in rect: NSRect) -> NSBezierPath {
    let path = NSBezierPath()
    path.move(to: point(53, 83, in: rect))
    path.curve(to: point(110, 47, in: rect), controlPoint1: point(59, 55, in: rect),
               controlPoint2: point(83, 41, in: rect))
    path.curve(to: point(139, 100, in: rect), controlPoint1: point(136, 52, in: rect),
               controlPoint2: point(148, 76, in: rect))
    path.curve(to: point(71, 125, in: rect), controlPoint1: point(129, 127, in: rect),
               controlPoint2: point(97, 139, in: rect))
    path.curve(to: point(53, 83, in: rect), controlPoint1: point(51, 114, in: rect),
               controlPoint2: point(47, 99, in: rect))
    path.close()
    return path
}

func drawText(_ text: String, at point: NSPoint, size: CGFloat, color: NSColor,
              weight: NSFont.Weight = .regular, tracking: CGFloat = 0) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.lineBreakMode = .byWordWrapping
    NSAttributedString(string: text, attributes: [
        .font: NSFont.systemFont(ofSize: size, weight: weight),
        .foregroundColor: color,
        .kern: tracking,
        .paragraphStyle: paragraph,
    ]).draw(at: point)
}

func drawText(_ text: String, in rect: NSRect, size: CGFloat, color: NSColor,
              weight: NSFont.Weight = .regular) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.lineBreakMode = .byWordWrapping
    NSAttributedString(string: text, attributes: [
        .font: NSFont.systemFont(ofSize: size, weight: weight),
        .foregroundColor: color,
        .paragraphStyle: paragraph,
    ]).draw(with: rect, options: [.usesLineFragmentOrigin, .usesFontLeading])
}

func drawCenteredText(_ text: String, y: CGFloat, size: CGFloat, color: NSColor,
                      weight: NSFont.Weight = .regular, tracking: CGFloat = 0,
                      canvasWidth: CGFloat) {
    let attributes: [NSAttributedString.Key: Any] = [
        .font: NSFont.systemFont(ofSize: size, weight: weight),
        .kern: tracking,
    ]
    let width = NSAttributedString(string: text, attributes: attributes).size().width
    drawText(text, at: NSPoint(x: (canvasWidth - width) / 2, y: y), size: size,
             color: color, weight: weight, tracking: tracking)
}

func drawSphere(configuration: SnapshotConfiguration, outputURL: URL, integrated: Bool) throws {
    guard let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: configuration.width,
        pixelsHigh: configuration.height,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    ), let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
        throw NSError(domain: "LivingSphereSnapshot", code: 1)
    }

    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    context.cgContext.setShouldAntialias(true)
    let colors = palette(dark: configuration.dark)
    colors.background.setFill()
    NSRect(x: 0, y: 0, width: configuration.width, height: configuration.height).fill()

    let diameter = integrated
        ? CGFloat(configuration.width) * 0.43
        : min(CGFloat(configuration.width) * 0.72, CGFloat(configuration.height) * 0.34)
    let centerY = integrated ? CGFloat(configuration.height) * 0.62 : CGFloat(configuration.height) * 0.5
    let rect = NSRect(
        x: (CGFloat(configuration.width) - diameter) / 2,
        y: centerY - diameter / 2,
        width: diameter,
        height: diameter
    )
    let haloRect = NSRect(x: rect.minX - diameter * 0.08, y: rect.minY - diameter * 0.07,
                          width: rect.width + diameter * 0.16, height: rect.height + diameter * 0.15)
    colors.surface.withAlphaComponent(0.065).setFill()
    NSBezierPath(ovalIn: haloRect).fill()
    colors.surface.withAlphaComponent(0.074).setFill()
    let innerHalo = NSRect(x: rect.minX - diameter * 0.035, y: rect.minY - diameter * 0.03,
                           width: rect.width + diameter * 0.075, height: rect.height + diameter * 0.065)
    NSBezierPath(ovalIn: innerHalo).fill()

    let sphere = organicSpherePath(in: rect)
    NSGraphicsContext.saveGraphicsState()
    sphere.addClip()
    NSGradient(colors: [colors.highlight.withAlphaComponent(0.68), colors.base, colors.depth])?.draw(
        in: sphere,
        relativeCenterPosition: NSPoint(x: -0.22, y: 0.22)
    )
    NSGradient(colors: [colors.warmth.withAlphaComponent(0.36),
                        colors.depth.withAlphaComponent(0.02)])?.draw(
        in: organicCorePath(in: rect), relativeCenterPosition: NSPoint(x: -0.1, y: 0.1)
    )

    let flow = NSBezierPath()
    flow.move(to: point(31, 103, in: rect))
    flow.curve(to: point(166, 89, in: rect), controlPoint1: point(62, 65, in: rect),
               controlPoint2: point(103, 58, in: rect))
    flow.curve(to: point(65, 126, in: rect), controlPoint1: point(127, 76, in: rect),
               controlPoint2: point(91, 92, in: rect))
    flow.curve(to: point(31, 103, in: rect), controlPoint1: point(51, 143, in: rect),
               controlPoint2: point(36, 133, in: rect))
    flow.close()
    var transform = AffineTransform()
    transform.translate(x: rect.midX, y: rect.midY)
    transform.rotate(byDegrees: configuration.phase * 16)
    transform.translate(x: -rect.midX, y: -rect.midY)
    flow.transform(using: transform)
    colors.depth.withAlphaComponent(0.17).setFill()
    flow.fill()
    NSGraphicsContext.restoreGraphicsState()

    colors.contour.setStroke()
    for index in 0..<3 {
        let path = surfacePath(index: index, in: rect)
        path.lineWidth = diameter * (index == 0 ? 0.006 : 0.004) / 2
        path.lineCapStyle = .round
        path.stroke()
    }
    colors.contour.withAlphaComponent(0.28).setStroke()
    let boundary = organicSpherePath(in: rect)
    boundary.lineWidth = max(1, diameter * 0.0025)
    boundary.stroke()

    if integrated {
        let scale = configuration.scale
        let ink = configuration.dark ? color(0xE6E8E2) : color(0x171916)
        let secondary = configuration.dark ? color(0xB1B8B1) : color(0x555A53)
        let tertiary = configuration.dark ? color(0x7F8981) : color(0x858A82)
        let accent = configuration.dark ? color(0xAABCB2) : color(0x255B46)
        let left = 16 * scale
        drawText("VITALSPAN / HEALTH", at: NSPoint(x: left, y: CGFloat(configuration.height) * 0.925),
                 size: 10 * scale, color: accent, weight: .semibold, tracking: 1.7 * scale)
        drawText("Your body, now.", at: NSPoint(x: left, y: CGFloat(configuration.height) * 0.875),
                 size: 30 * scale, color: ink, weight: .light)
        drawText("A clear view of what your data can say today.",
                 at: NSPoint(x: left, y: CGFloat(configuration.height) * 0.845),
                 size: 12 * scale, color: secondary)
        drawText("HEALTH OVERVIEW", at: NSPoint(x: left + 4 * scale,
                 y: CGFloat(configuration.height) * 0.775), size: 10 * scale,
                 color: tertiary, weight: .semibold, tracking: 1.4 * scale)
        drawCenteredText("REPRESENTING", y: CGFloat(configuration.height) * 0.49,
                         size: 9 * scale, color: tertiary, weight: .semibold,
                         tracking: 1.1 * scale, canvasWidth: CGFloat(configuration.width))
        drawCenteredText("Blood  •  Sleep  •  Recovery  •  Fitness",
                         y: CGFloat(configuration.height) * 0.47, size: 11 * scale,
                         color: secondary, canvasWidth: CGFloat(configuration.width))
        drawText("CURRENT STATE", at: NSPoint(x: left + 4 * scale,
                 y: CGFloat(configuration.height) * 0.43), size: 10 * scale,
                 color: tertiary, weight: .semibold, tracking: 1.1 * scale)
        drawText("Current state is still forming", at: NSPoint(x: left + 4 * scale,
                 y: CGFloat(configuration.height) * 0.39), size: 24 * scale,
                 color: ink, weight: .light)
        drawText("EVIDENCE CLARITY", at: NSPoint(x: left + 4 * scale,
                 y: CGFloat(configuration.height) * 0.34), size: 10 * scale,
                 color: tertiary, weight: .semibold, tracking: 1.1 * scale)
        drawText("Moderate", at: NSPoint(x: left + 4 * scale,
                 y: CGFloat(configuration.height) * 0.315), size: 12 * scale,
                 color: secondary)
        drawText("PRIMARY INSIGHT", at: NSPoint(x: left + 4 * scale,
                 y: CGFloat(configuration.height) * 0.275), size: 10 * scale,
                 color: tertiary, weight: .semibold, tracking: 1.1 * scale)
        drawText("Available evidence is represented across Blood, Sleep, Recovery, and Fitness.",
                 in: NSRect(x: left + 4 * scale, y: CGFloat(configuration.height) * 0.205,
                            width: CGFloat(configuration.width) - (left + 4 * scale) * 2,
                            height: 48 * scale), size: 14 * scale, color: secondary)
        let actionRect = NSRect(x: left + 4 * scale, y: CGFloat(configuration.height) * 0.12,
                                width: CGFloat(configuration.width) - (left + 4 * scale) * 2,
                                height: 48 * scale)
        let action = NSBezierPath(roundedRect: actionRect, xRadius: 12 * scale, yRadius: 12 * scale)
        ink.setFill()
        action.fill()
        drawText("Review available evidence", at: NSPoint(x: actionRect.minX + 16 * scale,
                 y: actionRect.minY + 16 * scale), size: 13 * scale,
                 color: configuration.dark ? colors.background : color(0xFFFFFF), weight: .semibold)
        drawText("Blood model details", at: NSPoint(x: left + 4 * scale,
                 y: CGFloat(configuration.height) * 0.06), size: 12 * scale,
                 color: secondary, weight: .semibold)
    }

    NSGraphicsContext.restoreGraphicsState()
    guard let data = bitmap.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "LivingSphereSnapshot", code: 2)
    }
    try data.write(to: outputURL)
}

let arguments = Array(CommandLine.arguments.dropFirst())
let integrated = arguments.contains("--integrated")
let outputPath = arguments.first(where: { !$0.hasPrefix("--") })
    ?? (integrated ? "output/living-sphere-integration" : "output/living-sphere-renderer")
let outputDirectory = URL(fileURLWithPath: outputPath, isDirectory: true)
try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
let configurations = [
    SnapshotConfiguration(name: "iphone-se-light", width: 750, height: 1334, dark: false,
                          phase: 0.32, scale: 2),
    SnapshotConfiguration(name: "iphone-17-pro-dark", width: 1206, height: 2622, dark: true,
                          phase: 0.32, scale: 3),
    SnapshotConfiguration(name: "light-mode", width: 1179, height: 2556, dark: false,
                          phase: 0.62, scale: 3),
    SnapshotConfiguration(name: "dark-mode", width: 1179, height: 2556, dark: true,
                          phase: 0.62, scale: 3),
    SnapshotConfiguration(name: "reduce-motion", width: 1179, height: 2556, dark: true,
                          phase: 0, scale: 3),
]

for configuration in configurations {
    let url = outputDirectory.appendingPathComponent("\(configuration.name).png")
    try drawSphere(configuration: configuration, outputURL: url, integrated: integrated)
    print("\(configuration.name): \(configuration.width)x\(configuration.height)")
}
