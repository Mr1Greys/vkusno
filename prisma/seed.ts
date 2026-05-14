import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { restaurantMenu } from "../data/restaurant-menu";

const prisma = new PrismaClient();

const categories = [
  { name: "Блины", slug: "bliny", sortOrder: 0 },
  { name: "Несладкая выпечка", slug: "savory-pastry", sortOrder: 1 },
  { name: "Сладкая выпечка", slug: "sweet-pastry", sortOrder: 2 },
  { name: "Ланч-бокс", slug: "lunchbox", sortOrder: 3 },
  { name: "Десерты", slug: "desserts", sortOrder: 4 },
  { name: "Напитки", slug: "drinks", sortOrder: 5 },
];

type ProductInput = {
  name: string;
  price: number;
  weight?: string;
  description?: string;
  isHalal?: boolean;
  imageUrl?: string;
};

/** Фото лежат в public/images/products/bakery/<slug категории>/…webp. Цены в копейках (руб × 100). */
const products: Record<string, ProductInput[]> = {
  bliny: [
    { name: "Блин", price: 5500 },
    { name: "Блин с вишней 1шт", price: 13000 },
    { name: "Блин с курицей", price: 13000 },
    { name: "Блин с мясом", price: 14000 },
    { name: "Блины с творогом", price: 13000 },
  ],
  "savory-pastry": [
    { name: "Багет", price: 16000, weight: "150 г", imageUrl: "/images/products/bakery/savory-pastry/baget.webp" },
    {
      name: "Беляш с говядиной",
      price: 24000,
      weight: "160 г",
      description: "Вкусный выпеченный беляш из чистой говядины",
      isHalal: true,
      imageUrl: "/images/products/bakery/savory-pastry/belyash-govyadina.webp",
    },
    { name: "Бутер с индейкой", price: 29000, weight: "300 г", imageUrl: "/images/products/bakery/fastfood/sendvich-indeyka.webp" },
    { name: "Бутер с семгой", price: 37000, weight: "300 г" },
    { name: "Жюльен", price: 24000, weight: "170 г", imageUrl: "/images/products/bakery/savory-pastry/julien.webp" },
    { name: "Кутаб с сыром и зеленью", price: 25000, weight: "160 г", imageUrl: "/images/products/bakery/savory-pastry/kutab-syr-zelen.webp" },
    { name: "Осетинский пирог с зеленью и сыром", price: 25000, weight: "250 г" },
    { name: "Осетинский пирог с картофелем", price: 25000, weight: "250 г" },
    { name: "Осетинский пирог с мясом", price: 32000, weight: "280 г" },
    { name: "Осетинский пирог с сыром", price: 27000, weight: "250 г" },
    { name: "Пирожок с капустой", price: 8000, weight: "70 г", description: "Выпеченный пирожок с капустой", imageUrl: "/images/products/bakery/savory-pastry/pirozhok-kapusta.webp" },
    { name: "Пирожок с картофелем и сыром", price: 9000, weight: "70 г" },
    { name: "Пирожок с луком и яйцом", price: 8000, weight: "70 г", imageUrl: "/images/products/bakery/savory-pastry/pirozhok-luk-yaico.webp" },
    { name: "Пирожок с мясом", price: 11500, weight: "70 г" },
    { name: "Самса с бараниной", price: 20000, weight: "140 г" },
    { name: "Самса с курицей", price: 18000, weight: "141 г" },
    { name: "Самса с сыром", price: 18000, weight: "148 г", imageUrl: "/images/products/bakery/savory-pastry/samsa-syr.webp" },
    { name: "Сэндвич с индейкой", price: 33000, weight: "300 г", imageUrl: "/images/products/bakery/fastfood/sendvich-indeyka.webp" },
    { name: "Сэндвич с сёмгой", price: 39000, weight: "300 г" },
    { name: "Сосиска в тесте", price: 16000, weight: "116 г", description: "Сосиска в тесте (индейка)", imageUrl: "/images/products/bakery/fastfood/sosiska-teste.webp" },
    { name: "Хачапури", price: 20000, weight: "160 г" },
    { name: "Хот-Дог с говяжьей колбаской", price: 32000, weight: "220 г" },
    { name: "Хот-Дог с куриной колбаской", price: 29000, weight: "200 г" },
    { name: "Чебурек", price: 21000, weight: "160 г" },
    { name: "Шаурма с курицей", price: 33500, weight: "249 г", imageUrl: "/images/products/bakery/fastfood/shaurma-kurica.webp" },
    { name: "Шаурма с курицей и сыром", price: 37500, weight: "271 г" },
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
  "lunchbox": [
    { name: "Солянка", price: 32000, weight: "300 г" },
    { name: "Оливье", price: 29000, weight: "200 г" },
    { name: "Куриный суп с лапшой", price: 28000, weight: "300 г" },
    { name: "Котлета куриная с пюре", price: 36000, weight: "350 г" },
    { name: "Витаминный салат", price: 21000, weight: "150 г" },
    { name: "Борщ", price: 32000, weight: "300 г" },
  ],
  "desserts": [
    { name: "Донат ванильный", price: 16000, weight: "111.6 г" },
    { name: "Донат Карамельный", price: 16000, weight: "111.6 г" },
    { name: "Картошка", price: 14000, weight: "120 г" },
    { name: "Наполеон", price: 42000, weight: "400 г" },
    { name: "Ореховые пальчики", price: 30000, weight: "200 г" },
    { name: "Пахлава", price: 20000, weight: "150 г" },
    { name: "Торт Медовик", price: 42000, weight: "400 г" },
    { name: "Яблочный пирог", price: 32000, weight: "300 г" },
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
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        isActive: true,
        catalog: "BAKERY",
      },
      create: { ...category, catalog: "BAKERY" },
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

    const keptIds = categoryProducts.map((_, i) => `${created.id}-${i}`);
    if (keptIds.length > 0) {
      await prisma.product.deleteMany({
        where: { categoryId: created.id, id: { notIn: keptIds } },
      });
    } else {
      await prisma.product.deleteMany({ where: { categoryId: created.id } });
    }
  }

  const legacyFastfood = await prisma.category.findUnique({
    where: { slug: "fastfood" },
    select: { id: true },
  });
  if (legacyFastfood) {
    const legacyIds = (
      await prisma.product.findMany({
        where: { categoryId: legacyFastfood.id },
        select: { id: true },
      })
    ).map((x) => x.id);
    if (legacyIds.length > 0) {
      await prisma.orderItem.deleteMany({ where: { productId: { in: legacyIds } } });
      await prisma.product.deleteMany({ where: { id: { in: legacyIds } } });
    }
    await prisma.category.update({
      where: { id: legacyFastfood.id },
      data: { isActive: false },
    });
  }

  let restaurantSort = 0;
  for (const rc of restaurantMenu) {
    const sortOrder = 200 + restaurantSort++;
    const created = await prisma.category.upsert({
      where: { slug: rc.slug },
      update: {
        name: rc.name,
        description: rc.description,
        sortOrder,
        isActive: true,
        catalog: "RESTAURANT",
      },
      create: {
        id: rc.id,
        name: rc.name,
        slug: rc.slug,
        description: rc.description,
        sortOrder,
        isActive: true,
        catalog: "RESTAURANT",
      },
    });
    console.log(`Restaurant category: ${created.name}`);

    for (let i = 0; i < rc.products.length; i++) {
      const p = rc.products[i];
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          description: null,
          price: p.price,
          weight: p.weight ?? null,
          isHalal: p.isHalal ?? false,
          sortOrder: i,
          categoryId: created.id,
          imageUrl: p.imageUrl ?? null,
        },
        create: {
          id: p.id,
          name: p.name,
          description: null,
          price: p.price,
          weight: p.weight ?? null,
          isHalal: p.isHalal ?? false,
          sortOrder: i,
          categoryId: created.id,
          imageUrl: p.imageUrl ?? null,
        },
      });
    }
    console.log(`Created ${rc.products.length} restaurant products for ${created.name}`);
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