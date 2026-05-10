/**
 * Генерирует PNG-иконки PWA из логотипа (квадрат, фон — cream как в бренде).
 * Запуск: node scripts/generate-pwa-icons.cjs
 * Требуется: sharp (devDependency)
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "icons");
const CANDIDATES = [
  path.join(ROOT, "public", "images", "logos", "выпечкаиточка.png"),
  path.join(ROOT, "public", "images", "logos", "logo.png"),
];

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const BG = { r: 250, g: 248, b: 245 };

function findLogo() {
  for (const p of CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    "Логотип не найден. Ожидается public/images/logos/выпечкаиточка.png или logo.png"
  );
}

async function main() {
  const logoPath = findLogo();
  await fs.promises.mkdir(OUT, { recursive: true });

  for (const size of SIZES) {
    const outPath = path.join(OUT, `icon-${size}x${size}.png`);
    await sharp(logoPath)
      .resize(size, size, {
        fit: "contain",
        position: "centre",
        background: { ...BG, alpha: 1 },
      })
      .flatten({ background: BG })
      .png()
      .toFile(outPath);
    console.log("OK", path.relative(ROOT, outPath));
  }

  const fav32 = path.join(ROOT, "public", "favicon-32x32.png");
  await sharp(logoPath)
    .resize(32, 32, {
      fit: "contain",
      position: "centre",
      background: { ...BG, alpha: 1 },
    })
    .flatten({ background: BG })
    .png()
    .toFile(fav32);
  console.log("OK", path.relative(ROOT, fav32));

  console.log("\nГотово. Обновите metadata в app/layout.tsx при смене пути favicon.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
