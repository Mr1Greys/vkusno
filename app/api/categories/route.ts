import { NextResponse } from "next/server";
import { mergeProductImageUrl } from "@/lib/bakery-product-images";

const categories = [
  {
    id: "1",
    name: "Блины",
    slug: "bliny",
    sortOrder: 1,
    isActive: true,
    products: [
      { id: "b1", name: "Блин", price: 5500, weight: "1 шт", description: null, imageUrl: "/images/products/b1/1.jpg", isAvailable: true, isHalal: false, sortOrder: 0, categoryId: "1" },
      { id: "b2", name: "Блин с вишней", price: 13000, weight: "1 шт", description: "Блин с начинкой из вишни", imageUrl: "/images/products/b2/1.jpg", isAvailable: true, isHalal: false, sortOrder: 1, categoryId: "1" },
      { id: "b3", name: "Блин с курицей", price: 13000, weight: "1 шт", description: "Блин с куриной начинкой", imageUrl: "/images/products/b3/1.jpg", isAvailable: true, isHalal: false, sortOrder: 2, categoryId: "1" },
      { id: "b4", name: "Блин с мясом", price: 14000, weight: "1 шт", description: "Блин с мясной начинкой", imageUrl: "/images/products/b4/1.jpg", isAvailable: true, isHalal: false, sortOrder: 3, categoryId: "1" },
      { id: "b5", name: "Блины с творогом", price: 13000, weight: "1 шт", description: "Блин с творожной начинкой", imageUrl: "/images/products/b5/1.jpg", isAvailable: true, isHalal: false, sortOrder: 4, categoryId: "1" },
    ]
  },
  {
    id: "2",
    name: "Десерты",
    slug: "desserts",
    sortOrder: 2,
    isActive: true,
    products: [
      { id: "d1", name: "Донат ванильный", price: 16000, weight: "112 г", description: null, imageUrl: "/images/products/d1/1.jpg", isAvailable: true, isHalal: false, sortOrder: 0, categoryId: "2" },
      { id: "d2", name: "Донат карамельный", price: 16000, weight: "112 г", description: null, imageUrl: "/images/products/d2/1.jpg", isAvailable: true, isHalal: false, sortOrder: 1, categoryId: "2" },
      { id: "d3", name: "Картошка", price: 14000, weight: "1 шт", description: "Пирожное Картошка", imageUrl: "/images/products/d3/1.jpg", isAvailable: true, isHalal: false, sortOrder: 2, categoryId: "2" },
      { id: "d4", name: "Наполеон", price: 42000, weight: "400 г", description: "Классический торт Наполеон", imageUrl: "/images/products/d4/1.jpg", isAvailable: true, isHalal: false, sortOrder: 3, categoryId: "2" },
      { id: "d5", name: "Ореховые пальчики", price: 30000, weight: "1 шт", description: "Пирожное с ореховой начинкой", imageUrl: "/images/products/d5/1.jpg", isAvailable: true, isHalal: false, sortOrder: 4, categoryId: "2" },
      { id: "d6", name: "Пахлава", price: 20000, weight: "1 шт", description: "Восточная сладость с орехами", imageUrl: "/images/products/d6/1.jpg", isAvailable: true, isHalal: false, sortOrder: 5, categoryId: "2" },
      { id: "d7", name: "Медовик", price: 42000, weight: "400 г", description: "Классический медовик", imageUrl: "/images/products/d7/1.jpg", isAvailable: true, isHalal: false, sortOrder: 6, categoryId: "2" },
      { id: "d8", name: "Яблочный пирог", price: 32000, weight: "1 шт", description: "Пирог с яблоками", imageUrl: "/images/products/d8/1.jpg", isAvailable: true, isHalal: false, sortOrder: 7, categoryId: "2" },
      { id: "d9", name: "Фондан", price: 0, weight: "1 шт", description: "Тёплый шоколадный фондан", imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 8, categoryId: "2" },
    ]
  },
  {
    id: "3",
    name: "Несладкая выпечка",
    slug: "savory-pastry",
    sortOrder: 3,
    isActive: true,
    products: [
      { id: "n1", name: "Багет", price: 16000, weight: "150 г", description: null, imageUrl: "/images/products/n1/1.jpg", isAvailable: true, isHalal: false, sortOrder: 0, categoryId: "3" },
      { id: "n2", name: "Беляш с говядиной", price: 24000, weight: "160 г", description: "Вкусный выпеченный беляш из чистой говядины", imageUrl: "/images/products/n2/1.jpg", isAvailable: true, isHalal: true, sortOrder: 1, categoryId: "3" },
      { id: "n3", name: "Бутер с индейкой", price: 29000, weight: "200 г", description: "Бутерброд с индейкой", imageUrl: "/images/products/n3/1.jpg", isAvailable: true, isHalal: false, sortOrder: 2, categoryId: "3" },
      { id: "n4", name: "Бутер с сёмгой", price: 37000, weight: "200 г", description: "Бутерброд с лососем", imageUrl: "/images/products/n4/1.jpg", isAvailable: true, isHalal: false, sortOrder: 3, categoryId: "3" },
      { id: "n5", name: "Жюльен", price: 24000, weight: "170 г", description: null, imageUrl: "/images/products/n5/1.jpg", isAvailable: true, isHalal: false, sortOrder: 4, categoryId: "3" },
      { id: "n6", name: "Кутаб с сыром и зеленью", price: 25000, weight: "160 г", description: null, imageUrl: "/images/products/n6/1.jpg", isAvailable: true, isHalal: false, sortOrder: 5, categoryId: "3" },
      { id: "n7", name: "Осетинский пирог с зеленью и сыром", price: 25000, weight: "350 г", description: "Традиционный осетинский пирог", imageUrl: "/images/products/n7/1.jpg", isAvailable: true, isHalal: false, sortOrder: 6, categoryId: "3" },
      { id: "n8", name: "Осетинский пирог с картофелем", price: 25000, weight: "350 г", description: "Осетинский пирог с картошкой", imageUrl: "/images/products/n8/1.jpg", isAvailable: true, isHalal: false, sortOrder: 7, categoryId: "3" },
      { id: "n9", name: "Осетинский пирог с мясом", price: 32000, weight: "350 г", description: "Осетинский пирог с мясной начинкой", imageUrl: "/images/products/n9/1.jpg", isAvailable: true, isHalal: false, sortOrder: 8, categoryId: "3" },
      { id: "n10", name: "Осетинский пирог с сыром", price: 27000, weight: "350 г", description: "Осетинский пирог с сыром", imageUrl: "/images/products/n10/1.jpg", isAvailable: true, isHalal: false, sortOrder: 9, categoryId: "3" },
      { id: "n11", name: "Пирожок с капустой", price: 8000, weight: "70 г", description: "Выпеченный пирожок с капустой", imageUrl: "/images/products/n11/1.jpg", isAvailable: true, isHalal: false, sortOrder: 10, categoryId: "3" },
      { id: "n12", name: "Пирожок с картофелем и сыром", price: 9000, weight: "70 г", description: null, imageUrl: "/images/products/n12/1.jpg", isAvailable: true, isHalal: false, sortOrder: 11, categoryId: "3" },
      { id: "n13", name: "Пирожок с луком и яйцом", price: 8000, weight: "70 г", description: null, imageUrl: "/images/products/n13/1.jpg", isAvailable: true, isHalal: false, sortOrder: 12, categoryId: "3" },
      { id: "n14", name: "Пирожок с мясом", price: 11500, weight: "70 г", description: null, imageUrl: "/images/products/n14/1.jpg", isAvailable: true, isHalal: false, sortOrder: 13, categoryId: "3" },
      { id: "n15", name: "Самса с бараниной", price: 20000, weight: "140 г", description: null, imageUrl: "/images/products/n15/1.jpg", isAvailable: true, isHalal: true, sortOrder: 14, categoryId: "3" },
      { id: "n16", name: "Самса с курицей", price: 18000, weight: "141 г", description: null, imageUrl: "/images/products/n16/1.jpg", isAvailable: true, isHalal: false, sortOrder: 15, categoryId: "3" },
      { id: "n17", name: "Самса с сыром", price: 18000, weight: "148 г", description: null, imageUrl: "/images/products/n17/1.jpg", isAvailable: true, isHalal: false, sortOrder: 16, categoryId: "3" },
      { id: "n18", name: "Сендвич с индейкой", price: 33000, weight: "300 г", description: null, imageUrl: "/images/products/n18/1.jpg", isAvailable: true, isHalal: false, sortOrder: 17, categoryId: "3" },
      { id: "n19", name: "Сендвич с сёмгой", price: 39000, weight: "300 г", description: null, imageUrl: "/images/products/n19/1.jpg", isAvailable: true, isHalal: false, sortOrder: 18, categoryId: "3" },
      { id: "n20", name: "Сосиска в тесте", price: 16000, weight: "116 г", description: "Сосиска в тесте (индейка)", imageUrl: "/images/products/n20/1.jpg", isAvailable: true, isHalal: false, sortOrder: 19, categoryId: "3" },
      { id: "n21", name: "Хачапури", price: 20000, weight: "160 г", description: null, imageUrl: "/images/products/n21/1.jpg", isAvailable: true, isHalal: false, sortOrder: 20, categoryId: "3" },
      { id: "n22", name: "Хот-Дог с говяжьей колбаской", price: 32000, weight: "200 г", description: null, imageUrl: "/images/products/n22/1.jpg", isAvailable: true, isHalal: false, sortOrder: 21, categoryId: "3" },
      { id: "n23", name: "Хот-Дог с куриной колбаской", price: 29000, weight: "200 г", description: null, imageUrl: "/images/products/n23/1.jpg", isAvailable: true, isHalal: false, sortOrder: 22, categoryId: "3" },
      { id: "n24", name: "Чебурек", price: 21000, weight: "160 г", description: null, imageUrl: "/images/products/n24/1.jpg", isAvailable: true, isHalal: false, sortOrder: 23, categoryId: "3" },
      { id: "n25", name: "Шаурма с курицей", price: 33500, weight: "249 г", description: null, imageUrl: "/images/products/n25/1.jpg", isAvailable: true, isHalal: false, sortOrder: 24, categoryId: "3" },
      { id: "n26", name: "Шаурма с курицей и сыром", price: 37500, weight: "271 г", description: null, imageUrl: "/images/products/n26/1.jpg", isAvailable: true, isHalal: false, sortOrder: 25, categoryId: "3" },
      { id: "n27", name: "Хачапури на шампуре", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 26, categoryId: "3" },
      { id: "n28", name: "Хычины", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 27, categoryId: "3" },
      { id: "n29", name: "Карачай хычын", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 28, categoryId: "3" },
      { id: "n30", name: "Ломаджо", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 29, categoryId: "3" },
      { id: "n31", name: "Пицца с грушей и горгонзолой", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 30, categoryId: "3" },
      { id: "n32", name: "Пицца Маргарита", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 31, categoryId: "3" },
      { id: "n33", name: "Пицца пепперони", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 32, categoryId: "3" },
    ]
  },
  {
    id: "5",
    name: "Мангал",
    slug: "mangal",
    sortOrder: 4,
    isActive: true,
    products: [
      { id: "m1", name: "Мангал", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 0, categoryId: "5" },
      { id: "m2", name: "Жау бауур", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 1, categoryId: "5" },
      { id: "m3", name: "Язычки", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 2, categoryId: "5" },
      { id: "m4", name: "Корейка", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 3, categoryId: "5" },
      { id: "m5", name: "Мякоть баранина", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 4, categoryId: "5" },
      { id: "m6", name: "Куриное филе", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 5, categoryId: "5" },
      { id: "m7", name: "Куриные крылья", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 6, categoryId: "5" },
      { id: "m8", name: "Люля баранина", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 7, categoryId: "5" },
      { id: "m9", name: "Овощи", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: true, sortOrder: 8, categoryId: "5" },
      { id: "m10", name: "Дорадо на гриле", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: false, sortOrder: 9, categoryId: "5" },
      { id: "m11", name: "Грибы", price: 0, weight: null, description: null, imageUrl: null, isAvailable: true, isHalal: true, sortOrder: 10, categoryId: "5" },
    ]
  },
  {
    id: "4",
    name: "Сладкая выпечка",
    slug: "sweet-pastry",
    sortOrder: 4,
    isActive: true,
    products: [
      { id: "s1", name: "Булочка московская", price: 11000, weight: "125 г", description: null, imageUrl: "/images/products/s1/1.jpg", isAvailable: true, isHalal: false, sortOrder: 0, categoryId: "4" },
      { id: "s2", name: "Булочка с вишней", price: 18000, weight: "160 г", description: null, imageUrl: "/images/products/s2/1.jpg", isAvailable: true, isHalal: false, sortOrder: 1, categoryId: "4" },
      { id: "s3", name: "Булочка с корицей", price: 16000, weight: "200 г", description: null, imageUrl: "/images/products/s3/1.jpg", isAvailable: true, isHalal: false, sortOrder: 2, categoryId: "4" },
      { id: "s4", name: "Булочка с кремом и изюмом", price: 16000, weight: "200 г", description: null, imageUrl: "/images/products/s4/1.jpg", isAvailable: true, isHalal: false, sortOrder: 3, categoryId: "4" },
      { id: "s5", name: "Булочка с маком", price: 16000, weight: "200 г", description: null, imageUrl: "/images/products/s5/1.jpg", isAvailable: true, isHalal: false, sortOrder: 4, categoryId: "4" },
      { id: "s6", name: "Булочка с яблоком", price: 16000, weight: "160 г", description: null, imageUrl: "/images/products/s6/1.jpg", isAvailable: true, isHalal: false, sortOrder: 5, categoryId: "4" },
      { id: "s7", name: "Ватрушка", price: 15000, weight: "230 г", description: null, imageUrl: "/images/products/s7/1.jpg", isAvailable: true, isHalal: false, sortOrder: 6, categoryId: "4" },
      { id: "s8", name: "Ватрушка с вишней", price: 18000, weight: "205 г", description: null, imageUrl: "/images/products/s8/1.jpg", isAvailable: true, isHalal: false, sortOrder: 7, categoryId: "4" },
      { id: "s9", name: "Кекс с изюмом", price: 13000, weight: "130 г", description: null, imageUrl: "/images/products/s9/1.jpg", isAvailable: true, isHalal: false, sortOrder: 8, categoryId: "4" },
      { id: "s10", name: "Кекс с орехами", price: 13000, weight: "130 г", description: null, imageUrl: "/images/products/s10/1.jpg", isAvailable: true, isHalal: false, sortOrder: 9, categoryId: "4" },
      { id: "s11", name: "Кольцо творожное", price: 18000, weight: "193 г", description: null, imageUrl: "/images/products/s11/1.jpg", isAvailable: true, isHalal: false, sortOrder: 10, categoryId: "4" },
      { id: "s12", name: "Печенье американское 1шт", price: 10500, weight: "70 г", description: null, imageUrl: "/images/products/s12/1.jpg", isAvailable: true, isHalal: false, sortOrder: 11, categoryId: "4" },
      { id: "s13", name: "Печенье овсяное 1шт", price: 10500, weight: "70 г", description: null, imageUrl: "/images/products/s13/1.jpg", isAvailable: true, isHalal: false, sortOrder: 12, categoryId: "4" },
      { id: "s14", name: "Печенье шоколадное 1шт", price: 10500, weight: "70 г", description: null, imageUrl: "/images/products/s14/1.jpg", isAvailable: true, isHalal: false, sortOrder: 13, categoryId: "4" },
      { id: "s15", name: "Рогалик с карамелью", price: 15000, weight: "160 г", description: null, imageUrl: "/images/products/s15/1.jpg", isAvailable: true, isHalal: false, sortOrder: 14, categoryId: "4" },
      { id: "s16", name: "Рогалик с кремом ваниль", price: 15000, weight: "160 г", description: null, imageUrl: "/images/products/s16/1.jpg", isAvailable: true, isHalal: false, sortOrder: 15, categoryId: "4" },
      { id: "s17", name: "Сочник с творогом", price: 14000, weight: "120 г", description: null, imageUrl: "/images/products/s17/1.jpg", isAvailable: true, isHalal: false, sortOrder: 16, categoryId: "4" },
      { id: "s18", name: "Сырник", price: 12000, weight: "100 г", description: null, imageUrl: "/images/products/s18/1.jpg", isAvailable: true, isHalal: false, sortOrder: 17, categoryId: "4" },
      { id: "s19", name: "Штрудель", price: 21000, weight: "253 г", description: null, imageUrl: "/images/products/s19/1.jpg", isAvailable: true, isHalal: false, sortOrder: 18, categoryId: "4" },
    ]
  }
];

export async function GET() {
  const enriched = categories.map((cat) => ({
    ...cat,
    products: cat.products.map((p) => ({
      ...p,
      imageUrl: mergeProductImageUrl(p.imageUrl, p.name),
    })),
  }));
  return NextResponse.json(enriched);
}