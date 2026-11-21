# code-launchy — 3 daqiqalik taqdimot

## Muammo

Sayt yoki dizayn kerak bo‘lgan odam tayyor mahsulotlarni bir joydan izlay olmaydi. Mustaqil dasturchilar ham xizmatlarini mijozlarga ko‘rsatish uchun qulay maydonga muhtoj.

## Yechim

code-launchy — tayyor saytlar va dizayn shablonlari bozori, shuningdek saytni buyurtma asosida yasab beradigan mutaxassislarni topish platformasi. Xaridor e’lon tanlaydi va buyurtma so‘rovi yuboradi; sotuvchi esa alohida sahifada e’lonini joylaydi.

## Asosiy sahifalar

- `index.html` — sayt va shablonlar katalogi, dasturchilar ro‘yxati, qidiruv va filtrlar.
- `listing.html` — sotuvchi e’lon kiritadigan alohida sahifa.
- `orders.html` — xaridor yuborgan buyurtma va loyiha so‘rovlari.
- `demos/tezz-shop/index.html` va `demos/tezz-cafe/index.html` — rasmlar bilan tanishib, sinab ko‘rish mumkin bo‘lgan demo saytlar.

## Ishlaydigan imkoniyatlar

- E’lon turi, sarlavha, tavsif, narx va sotuvchi aloqasini kiritish.
- E’lonni katalogga qo‘shish va qidirish.
- Saytga buyurtma yoki dasturchiga loyiha so‘rovi yuborish.
- E’lon va so‘rovlarni `js/database.js` dagi brauzer xotirasi qatlamida saqlash.
- Sahifani aylantirganda bloklarning silliq paydo bo‘lishi va mobilga mos dizayn.

## Demo va haqiqiy bozor

Bu frontend prototip: e’lonlar va so‘rovlar `localStorage` da faqat shu qurilmada saqlanadi. Ular serverga yuborilmaydi va to‘lov amalga oshirilmaydi. Haqiqiy bozor uchun backend, server ma’lumotlar bazasi, foydalanuvchi akkauntlari, sotuvchi tekshiruvi, buyurtma xabarnomalari va to‘lov provayderi kerak.

## Keyingi rivojlantirish

- Backend/API va umumiy ma’lumotlar bazasi.
- Sotuvchi hisobi va e’lon moderatsiyasi.
- Buyurtmaning bosqichlari, xavfsiz topshirish va to‘lovlar.
- Foydalanuvchi baholari, shikoyatlar va nizolarni ko‘rib chiqish.
