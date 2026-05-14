export interface RestaurantCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  products: RestaurantProduct[];
}

export interface RestaurantProduct {
  id: string;
  name: string;
  price: number;
  weight?: string | null;
  imageUrl?: string | null;
  isHalal?: boolean;
}

export const restaurantMenu: RestaurantCategory[] = [
  {
    id: "salads",
    name: "Салаты",
    description: "Лёгкие свежие блюда для аперитива и хорошего начала трапезы.",
    slug: "salads",
    products: [
      { id: "crispy-eggplants", name: "Хрустящие баклажаны", price: 0 },
      { id: "green-salad", name: "Зелёный салат", price: 0 },
      { id: "burrata-salad", name: "Салат с буратта", price: 0 },
      { id: "caesar-chicken", name: "Цезарь с курицей", price: 0 },
      { id: "watermelon-salad", name: "Арбузный салат", price: 0 },
    ],
  },
  {
    id: "snacks",
    name: "Закуски",
    description: "Вкусные закуски и деликатесы для компании или лёгкого перекуса.",
    slug: "snacks",
    products: [
      { id: "fried-cheese", name: "Жаренный сыр", price: 0 },
      { id: "nuggets", name: "Наггетсы", price: 0 },
      { id: "cheese-in-lavash", name: "Сыр в лаваше", price: 0 },
      { id: "quesadilla", name: "Кесадилья", price: 0 },
    ],
  },
  {
    id: "soups",
    name: "Супы",
    description: "Горячие и холодные первые блюда, которые согреют и насытят.",
    slug: "soups",
    products: [
      { id: "borsch", name: "Борщ", price: 0 },
      { id: "okroshka", name: "Окрошка", price: 0 },
      { id: "chicken-soup", name: "Куриный суп", price: 0 },
      { id: "lamb-shorpa", name: "Шорпа из баранины", price: 0 },
    ],
  },
  {
    id: "hot-dishes",
    name: "Горячие блюда",
    description: "Сытные основные блюда для тех, кто любит насыщенный вкус.",
    slug: "hot-dishes",
    products: [
      { id: "pilaf", name: "Плов", price: 0 },
      { id: "manti", name: "Манты", price: 0 },
      { id: "beef-cheeks", name: "Щечки говяжьи с нутом (парик или конвекционная печь)", price: 0 },
      { id: "rabbit-cutlets", name: "Котлеты из кролика (парик или конвекционная печь)", price: 0 },
      { id: "khan-kal-chabansky", name: "Хинкал чабанский", price: 0 },
      { id: "khan-kal-sloeny", name: "Хинкал слоенный", price: 0 },
      { id: "beef-stroganoff", name: "Бефстроганов", price: 0 },
      { id: "home-style-roast", name: "Жаркое из вырезки по домашнему", price: 0 },
      { id: "kara-chaevsky-burger", name: "Бургер карачаевский", price: 0 },
    ],
  },
  {
    id: "mangal",
    name: "Мангал",
    description: "Блюда на углях: мясо, рыба, овощи и классика карачаевской кухни.",
    slug: "mangal",
    products: [
      { id: "mangal-set", name: "Мангал", price: 0 },
      { id: "mangal-zhau-bauur", name: "Жау бауур", price: 0 },
      { id: "mangal-yazyki", name: "Язычки", price: 0 },
      { id: "mangal-koreyka", name: "Корейка", price: 0 },
      { id: "mangal-myakot-baranina", name: "Мякоть баранина", price: 0 },
      { id: "mangal-kurinoe-file", name: "Куриное филе", price: 0 },
      { id: "mangal-kurinye-krylya", name: "Куриные крылья", price: 0 },
      { id: "mangal-lyulya-baranina", name: "Люля баранина", price: 0 },
      { id: "mangal-ovoshchi", name: "Овощи", price: 0, isHalal: true },
      { id: "mangal-dorado-gril", name: "Дорадо на гриле", price: 0 },
      { id: "mangal-griby", name: "Грибы", price: 0, isHalal: true },
    ],
  },
];