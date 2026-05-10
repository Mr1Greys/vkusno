import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Свежая несладкая выпечка", slug: "savory-pastry", sortOrder: 1 },
  { name: "Свежая сладкая выпечка", slug: "sweet-pastry", sortOrder: 2 },
  { name: "Фастфуд", slug: "fastfood", sortOrder: 3 },
  { name: "Ланч-бокс", slug: "lunchbox", sortOrder: 4 },
  { name: "Десерты", slug: "desserts", sortOrder: 5 },
  { name: "Напитки", slug: "drinks", sortOrder: 6 },
];

type ProductInput = {
  name: string;
  price: number;
  weight?: string;
  description?: string;
  isHalal?: boolean;
  imageUrl?: string;
};

/** Фото лежат в public/images/products/bakery/<slug категории>/…webp */
const products: Record<string, ProductInput[]> = {
  "savory-pastry": [
    { name: "Багет", price: 16000, weight: "150 г", imageUrl: "/images/products/bakery/savory-pastry/baget.webp" },
    { name: "Беляш с говядиной", price: 24000, weight: "160 г", description: "Вкусный выпеченный беляш из чистой говядины", isHalal: true, imageUrl: "/images/products/bakery/savory-pastry/belyash-govyadina.webp" },
    { name: "Жюльен", price: 24000, weight: "170 г", imageUrl: "/images/products/bakery/savory-pastry/julien.webp" },
    { name: "Кутаб с сыром и зеленью", price: 25000, weight: "160 г", imageUrl: "/images/products/bakery/savory-pastry/kutab-syr-zelen.webp" },
    { name: "Пирожок с капустой", price: 8000, weight: "70 г", description: "Выпеченный пирожок с капустой", imageUrl: "/images/products/bakery/savory-pastry/pirozhok-kapusta.webp" },
    { name: "Пирожок с картофелем и сыром", price: 9000, weight: "70 г" },
    { name: "Пирожок с луком и яйцом", price: 8000, weight: "70 г", imageUrl: "/images/products/bakery/savory-pastry/pirozhok-luk-yaico.webp" },
    { name: "Пирожок с мясом", price: 11500, weight: "70 г" },
    { name: "Самса с бараниной", price: 20000, weight: "140 г" },
    { name: "Самса с курицей", price: 18000, weight: "141 г" },
    { name: "Самса с сыром", price: 18000, weight: "148 г", imageUrl: "/images/products/bakery/savory-pastry/samsa-syr.webp" },
    { name: "Хачапури", price: 20000, weight: "160 г" },
    { name: "Чебурек", price: 21000, weight: "160 г" },
  ],
  "sweet-pastry": [
    { name: "Булочка московская", price: 11000, weight: "125 г" },
    { name: "Булочка с вишней", price: 18000, weight: "160 г", imageUrl: "/images/products/bakery/sweet-pastry/bulochka-vishnya.webp" },
    { name: "Булочка с корицей", price: 16000, weight: "200 г", imageUrl: "/images/products/bakery/sweet-pastry/bulochka-korica.webp" },
    { name: "Булочка с кремом и изюмом", price: 16000, weight: "200 г" },
    { name: "Булочка с маком", price: 16000, weight: "200 г" },
    { name: "Булочка с яблоком", price: 16000, weight: "160 г" },
    { name: "Ватрушка", price: 15000, weight: "230 г", imageUrl: "/images/products/bakery/sweet-pastry/vatrushka.webp" },
    { name: "Ватрушка с вишней", price: 18000, weight: "205 г", imageUrl: "/images/products/bakery/sweet-pastry/vatrushka-vishnya.webp" },
    { name: "Донат карамельный", price: 16000, weight: "111.6 г" },
    { name: "Донат ванильный", price: 16000, weight: "111.6 г" },
    { name: "Кекс с изюмом", price: 13000, weight: "130 г" },
    { name: "Кекс с орехами", price: 13000, weight: "130 г", imageUrl: "/images/products/bakery/sweet-pastry/keks-orehi.webp" },
    { name: "Кольцо творожное", price: 18000, weight: "192.5 г", imageUrl: "/images/products/bakery/sweet-pastry/kolco-tvorozhnoe.webp" },
    { name: "Печенье американское 1шт", price: 10500, weight: "70 г" },
    { name: "Печенье овсяное 1шт", price: 10500, weight: "70 г" },
    { name: "Печенье шоколадное 1шт", price: 10500, weight: "70 г" },
    { name: "Рогалик с карамелью", price: 15000, weight: "160 г", imageUrl: "/images/products/bakery/sweet-pastry/rogalik-karamel.webp" },
    { name: "Рогалик с кремом ваниль", price: 15000, weight: "160 г" },
    { name: "Сочник с творогом", price: 14000, weight: "120 г", imageUrl: "/images/products/bakery/sweet-pastry/sochnik-tvorog.webp" },
    { name: "Сырник", price: 12000, weight: "100 г", imageUrl: "/images/products/bakery/sweet-pastry/syrnik.webp" },
    { name: "Штрудель", price: 21000, weight: "252.9 г", imageUrl: "/images/products/bakery/sweet-pastry/shtrudel.webp" },
  ],
  "fastfood": [
    { name: "Сендвич с индейкой", price: 33000, weight: "300 г", imageUrl: "/images/products/bakery/fastfood/sendvich-indeyka.webp" },
    { name: "Сендвич с сёмгой", price: 39000, weight: "300 г" },
    { name: "Сосиска в тесте", price: 16000, weight: "116 г", description: "Сосиска в тесте (индейка)", imageUrl: "/images/products/bakery/fastfood/sosiska-teste.webp" },
    { name: "Шаурма с курицей", price: 33500, weight: "249 г", imageUrl: "/images/products/bakery/fastfood/shaurma-kurica.webp" },
    { name: "Шаурма с курицей и сыром", price: 37500, weight: "271 г" },
  ],
  "lunchbox": [
    { name: "Солянка", price: 32000, weight: "300 г" },
    { name: "Оливье", price: 29000, weight: "200 г" },
    { name: "Куриный суп с лапшой", price: 28000, weight: "300 г" },
    { name: "Котлета куриная с пюре", price: 36000, weight: "350 г" },
    { name: "Витаминный салат", price: 21000, weight: "150 г" },
    { name: "Борщ", price: 32000, weight: "300 г" },
  ],
  "desserts": [
    { name: "Медовик", price: 55000, weight: "400 г" },
    { name: "Наполеон", price: 55000, weight: "400 г" },
  ],
  "drinks": [
    { name: "Кола/Фанта/Спрайт 0.3", price: 15800, weight: "0.3 л" },
    { name: "Кола/Фанта/Спрайт 0.5", price: 18000, weight: "0.5 л" },
    { name: "Липтон", price: 18000, weight: "0.5 л" },
    { name: "Натахтари", price: 18000, weight: "0.5 л" },
    { name: "Рич 0.2", price: 16000, weight: "0.2 л" },
    { name: "Вода в ассортименте 0.5", price: 10500, weight: "0.5 л" },
  ],
};

const defaultSettings = [
  { key: "delivery_price", value: "100" },
  { key: "delivery_free_from", value: "1000" },
  { key: "bonus_percent", value: "5" },
  { key: "bonus_min_amount", value: "200" },
  { key: "min_order_amount", value: "0" },
  { key: "working_hours_weekday", value: "07:00 - 22:00" },
  { key: "working_hours_weekend", value: "08:00 - 23:00" },
  { key: "address", value: "ул. Примерная, д. 1" },
  { key: "phone", value: "+7 (999) 123-45-67" },
];

async function main() {
  console.log("Start seeding...");

  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`Created category: ${created.name}`);

    const categoryProducts = products[category.slug] || [];
    for (let i = 0; i < categoryProducts.length; i++) {
      const p = categoryProducts[i];
      await prisma.product.upsert({
        where: {
          id: `${created.id}-${i}`,
        },
        update: {
          name: p.name,
          description: p.description ?? null,
          price: p.price,
          weight: p.weight ?? null,
          isHalal: p.isHalal ?? false,
          sortOrder: i,
          imageUrl: p.imageUrl ?? null,
        },
        create: {
          id: `${created.id}-${i}`,
          name: p.name,
          description: p.description || null,
          price: p.price,
          weight: p.weight || null,
          isHalal: p.isHalal || false,
          sortOrder: i,
          categoryId: created.id,
          imageUrl: p.imageUrl || null,
        },
      });
    }
    console.log(`Created ${categoryProducts.length} products for ${created.name}`);
  }

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  const adminPhone = process.env.ADMIN_PHONE || "+79990000000";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {
      name: "Администратор",
      role: "ADMIN",
      passwordHash: adminHash,
    },
    create: {
      phone: adminPhone,
      name: "Администратор",
      role: "ADMIN",
      passwordHash: adminHash,
    },
  });

  console.log(`Admin account готов: ${adminPhone}`);
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });