import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

async function generateIcons() {
  const rootDir = process.cwd();
  const inputLogo = path.join(rootDir, "public", "logo.png");
  const iconsDir = path.join(rootDir, "public", "icons");

  if (!fs.existsSync(inputLogo)) {
    console.error(`Source logo not found at: ${inputLogo}`);
    process.exit(1);
  }

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log("Generating PWA icons from public/logo.png...");

  // 1. icon-192x192.png (Standard PWA icon)
  await sharp(inputLogo)
    .resize(192, 192, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(iconsDir, "icon-192x192.png"));
  console.log("✓ Generated public/icons/icon-192x192.png");

  // 2. icon-512x512.png (Standard High-Res PWA icon)
  await sharp(inputLogo)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(iconsDir, "icon-512x512.png"));
  console.log("✓ Generated public/icons/icon-512x512.png");

  // 3. icon-maskable-512x512.png (Adaptive icon with safe-zone margin on brand dark background)
  const innerSize = Math.round(512 * 0.75); // 384px inner logo fits safely inside 80% circle
  const innerLogo = await sharp(inputLogo)
    .resize(innerSize, innerSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: "#141625",
    },
  })
    .composite([{ input: innerLogo, gravity: "center" }])
    .png()
    .toFile(path.join(iconsDir, "icon-maskable-512x512.png"));
  console.log("✓ Generated public/icons/icon-maskable-512x512.png");

  // 4. apple-touch-icon.png (180x180 for iOS Home Screen)
  const appleInner = await sharp(inputLogo)
    .resize(150, 150, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: "#141625",
    },
  })
    .composite([{ input: appleInner, gravity: "center" }])
    .png()
    .toFile(path.join(iconsDir, "apple-touch-icon.png"));
  console.log("✓ Generated public/icons/apple-touch-icon.png");

  // Duplicate to public/apple-touch-icon.png for direct iOS safari fallback
  fs.copyFileSync(
    path.join(iconsDir, "apple-touch-icon.png"),
    path.join(rootDir, "public", "apple-touch-icon.png"),
  );
  console.log("✓ Copied apple-touch-icon.png to public/apple-touch-icon.png");

  console.log("All PWA icons generated successfully!");
}

generateIcons().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});

