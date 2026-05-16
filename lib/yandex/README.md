# Яндекс: адрес в форме доставки

Нужны **два отдельных ключа** в [developer.tech.yandex.ru](https://developer.tech.yandex.ru):

| Переменная в `.env` | Продукт в кабинете | Зачем |
|---|---|---|
| `YANDEX_GEOSUGGEST_KEY` | **API Геосаджеста** | Выпадающий список при вводе улицы |
| `YANDEX_GEOCODER_KEY` | **HTTP Геокодер** | Координаты `[lon, lat]` после выбора адреса |

Ключи **не взаимозаменяемы**: ключ геокодера даёт 403 на подсказках, ключ геосаджеста — на геокодере.

Геокодер: `https://geocode-maps.yandex.ru/v1/` (не `/1.x/`).

Если `YANDEX_GEOCODER_KEY` не принимается Яндексом, координаты подставляются через OpenStreetMap Nominatim (тот же WGS84).

После изменения `.env` перезапустите `npm run dev`.

### Ограничение Referer в кабинете Яндекса

Запросы к Яндексу идут **с сервера** (Vercel), не из браузера. Карта на сайте **не нужна**.

В поле «HTTP Referer» указывайте **только домен**, без `https://` и без `/`:

```
vkusno-pearl.vercel.app
localhost
```

Для локальной разработки добавьте `localhost` в тот же список или снимите ограничение.

На Vercel переменные (`YANDEX_GEOSUGGEST_KEY`, `YANDEX_GEOCODER_KEY`, `NEXT_PUBLIC_APP_URL`) задаются в **Settings → Environment Variables**, не через git. После добавления — **Redeploy**.

`NEXT_PUBLIC_APP_URL` на проде: `https://vkusno-pearl.vercel.app` — из него подставляется заголовок Referer.

Запросы из браузера идут через прокси: `/api/yandex/suggest`, `/api/yandex/geocode`.
