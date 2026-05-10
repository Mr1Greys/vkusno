/**
 * Локальные фото в `public/images/products/bakery/…`.
 * Используется для подстановки в карточки, если в БД или legacy JSON ещё старый URL.
 */
export const BAKERY_PRODUCT_IMAGE_BY_NAME: Record<string, string> = {
  Багет: "/images/products/bakery/savory-pastry/baget.webp",
  "Беляш с говядиной": "/images/products/bakery/savory-pastry/belyash-govyadina.webp",
  Жюльен: "/images/products/bakery/savory-pastry/julien.webp",
  "Кутаб с сыром и зеленью": "/images/products/bakery/savory-pastry/kutab-syr-zelen.webp",
  "Пирожок с капустой": "/images/products/bakery/savory-pastry/pirozhok-kapusta.webp",
  "Пирожок с луком и яйцом": "/images/products/bakery/savory-pastry/pirozhok-luk-yaico.webp",
  "Самса с сыром": "/images/products/bakery/savory-pastry/samsa-syr.webp",
  "Булочка с вишней": "/images/products/bakery/sweet-pastry/bulochka-vishnya.webp",
  "Булочка с корицей": "/images/products/bakery/sweet-pastry/bulochka-korica.webp",
  Ватрушка: "/images/products/bakery/sweet-pastry/vatrushka.webp",
  "Ватрушка с вишней": "/images/products/bakery/sweet-pastry/vatrushka-vishnya.webp",
  "Кекс с орехами": "/images/products/bakery/sweet-pastry/keks-orehi.webp",
  "Кольцо творожное": "/images/products/bakery/sweet-pastry/kolco-tvorozhnoe.webp",
  "Рогалик с карамелью": "/images/products/bakery/sweet-pastry/rogalik-karamel.webp",
  "Сочник с творогом": "/images/products/bakery/sweet-pastry/sochnik-tvorog.webp",
  Сырник: "/images/products/bakery/sweet-pastry/syrnik.webp",
  Штрудель: "/images/products/bakery/sweet-pastry/shtrudel.webp",
  "Сендвич с индейкой": "/images/products/bakery/fastfood/sendvich-indeyka.webp",
  "Сосиска в тесте": "/images/products/bakery/fastfood/sosiska-teste.webp",
  "Шаурма с курицей": "/images/products/bakery/fastfood/shaurma-kurica.webp",
};

/** Нет отдельного кадра — показываем ближайший имеющийся вариант */
const BAKERY_PRODUCT_IMAGE_FALLBACK: Record<string, string> = {
  "Шаурма с курицей и сыром": "/images/products/bakery/fastfood/shaurma-kurica.webp",
};

export function resolveBakeryProductImage(productName: string): string | undefined {
  return (
    BAKERY_PRODUCT_IMAGE_BY_NAME[productName] ??
    BAKERY_PRODUCT_IMAGE_FALLBACK[productName]
  );
}

/** Сначала локальный bakery-ассет по названию, иначе то, что уже было в данных */
export function mergeProductImageUrl(
  imageUrl: string | null | undefined,
  productName: string
): string | null {
  const bakery = resolveBakeryProductImage(productName);
  if (bakery) return bakery;
  return imageUrl ?? null;
}
