-- Перенос категории «Мангал» из пекарни в ресторан: удаляем старые позиции (id вида <cuid>-N),
-- затем обновляем категорию. Новые Product с стабильными id создаёт seed.

DELETE FROM "OrderItem"
WHERE "productId" IN (
  SELECT "id" FROM "Product"
  WHERE "categoryId" IN (SELECT "id" FROM "Category" WHERE "slug" = 'mangal')
);

DELETE FROM "Product"
WHERE "categoryId" IN (SELECT "id" FROM "Category" WHERE "slug" = 'mangal');

UPDATE "Category"
SET
  "catalog" = 'RESTAURANT',
  "sortOrder" = 204,
  "description" = 'Блюда на углях: мясо, рыба, овощи и классика карачаевской кухни.'
WHERE "slug" = 'mangal';
