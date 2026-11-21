# code-launchy — saytlar va veb-xizmatlar bozori

code-launchy foydalanuvchilarga tayyor veb-sayt va dizayn shablonlarini ko‘rish, veb-dasturchi xizmatini topish, buyurtma so‘rovi yuborish hamda o‘z e’lonini joylash imkonini beruvchi frontend MVP hisoblanadi.

## Imkoniyatlar

- Tayyor sayt, dizayn shabloni va dasturchi xizmatlari uchun alohida ko‘rinishlar.
- Katalogda qidirish, tur bo‘yicha filtrlash va narx bo‘yicha saralash.
- E’lon joylash va dasturchi xizmatini taklif qilish.
- Sayt uchun buyurtma yoki dasturchiga loyiha so‘rovi yuborish.
- E’lon berish va buyurtmalar uchun alohida HTML sahifalar.
- `account.html` sahifasida email/parol bilan kirish va yangi hisob yaratish.
- Ro‘yxatdan o‘tishda “xaridor” yoki “sayt yaratuvchi” turini tanlash; hisob ochilgach bosh sahifaga qaytish.
- E’lonni faqat tizimga kirgan “sayt yaratuvchi” hisobidan joylash.
- Profil rasmini yuklash va hisob turini keyinroq o‘zgartirish.
- E’lon egasiga kelgan loyiha so‘rovlarini o‘z buyurtmalar sahifasida ko‘rish.
- Firebase Authentication orqali Google kirishi va ro‘yxatdan o‘tish; ro‘yxatdan o‘tish tabida Google bilan yangi hisob ochiladi.
- `admin.html` sahifasida e’lonlarni tasdiqlash/rad etish/o‘chirish, buyurtmalar va hisoblarni ko‘rish.
- E’lon joylashda 3 tagacha rasm tanlash, ko‘rish va brauzerda optimallashtirib saqlash.
- E’lon rasmlarini kichik ko‘rinishda oldindan ko‘rish va bosib kattalashtirish.
- Hisob sahifasida “Hello, welcome to code-launchy!” xush kelibsiz xabari hamda foydalanuvchiga mos e’lon/so‘rov bildirishnomalari.
- Har bir foydalanuvchining buyurtma ro‘yxatini alohida ko‘rsatish.
- Katalogdan ochib sinab ko‘rish mumkin bo‘lgan tayyor do‘kon va kafe demo saytlari.
- Tayyor demo saytlarda mahsulot rasmlari, menyu va sinov uchun interaktiv savatcha.
- `assets/code-launchy-logo.svg` ko‘rinishidagi loyiha logotipi va favicon.
- E’lonlar va buyurtmalarni `js/database.js` orqali `localStorage` da saqlash.
- Sahifani pastga aylantirganda bloklarni silliq ko‘rsatadigan animatsiya.
- Bosh sahifadagi sayt tasviri atrofida orbita bo‘ylab aylanadigan geometrik bezaklar va kirish sahifasi uchun alohida tasvir.
- Telefon va kompyuter ekranlariga mos dizayn.
- Gemini asosidagi umumiy savol-javob yordamchisi; chat tarixi va sayt muallifi haqidagi eslatma shu brauzerda saqlanadi, code-launchy bo‘yicha javoblarga mahalliy o‘zbekcha ko‘rsatma rasmlari qo‘shiladi.

## Sahifalar va fayllar

- `index.html` — katalog va dasturchilar.
- `listing.html` — alohida e’lon joylash sahifasi.
- `orders.html` — saqlangan buyurtmalar va loyiha so‘rovlari.
- `account.html` — foydalanuvchi kirishi, ro‘yxatdan o‘tishi va demo admin hisobiga kirish.
- `admin.html` — foydalanuvchi e’lonlari moderatsiyasi va demo boshqaruv paneli.
- `demos/tezz-shop/index.html` — rasmlar va ishlaydigan demo savatchali do‘kon.
- `demos/tezz-cafe/index.html` — rasmli kafe demo sayti.
- `demos/assets/` — demo sahifalarning mahalliy mahsulot rasmlari.
- `assets/code-launchy-logo.svg` — code-launchy logotipi va favicon.
- `assets/assistant-*.svg` — xarid, e’lon joylash va akkaunt bo‘yicha mahalliy tushuntiruvchi rasmlar.
- `css/style.css`, `css/pages.css` — umumiy va ichki sahifa dizaynlari.
- `js/assistant.js` — bosh sahifadagi Gemini chat interfeysi.
- `server.js` — statik fayllar va server tomonidagi Gemini API proksisi.
- `js/database.js` — `code-launchy-database-v1` xotira kaliti va eski tezz./sayd demo ma’lumotlarini avtomatik ko‘chirishni qo‘llaydigan brauzer bazasi.
- `js/app.js`, `js/listing.js`, `js/orders.js` — sahifalarning alohida JavaScript ishlashi.
- `js/auth.js`, `js/admin.js` — hisob tizimi va demo admin paneli.
- `js/auth-config.js` — Firebase Web app konfiguratsiyasi.

## Ishga tushirish

Frontend build vositasini talab qilmaydi. Gemini yordamchisi uchun Node.js 18+ kerak; sayt va xavfsiz API proksisini birga ishga tushirish uchun PowerShell’da:

```powershell
$env:GEMINI_API_KEY = "GOOGLE_AI_STUDIO_API_KALITINGIZ"
$env:PORT = "8000"
node server.js
```

Brauzerda `http://localhost:8000` manzilini oching. API kalitini HTML/JavaScript fayllariga qo‘ymang yoki Git’ga yuklamang; uni [Google AI Studio](https://aistudio.google.com/app/apikey) orqali oling va faqat server muhit o‘zgaruvchisida saqlang. `GEMINI_MODEL` ni muhit o‘zgaruvchisi bilan o‘zgartirish mumkin; standart model — `gemini-3.5-flash-lite`.

Chat savollar soniga dastur tomonidan limit qo‘ymaydi. Tarix va foydalanuvchining sayt muallifi haqidagi eslatmasi joriy brauzerning `localStorage` xotirasida saqlanadi; boshqa qurilma yoki brauzerga avtomatik o‘tmaydi. Foydalanuvchi savoli 600 belgigacha, Gemini javobi 6 000 belgigacha bo‘lishi mumkin. Gemini’ga suhbatning oxirgi 8 xabari yuboriladi, shu sababli chatni davom ettirish mumkin. Google Gemini API’ning o‘z kvotasi, tezlik cheklovlari va to‘lov qoidalari baribir amal qiladi. Ommaviy prodakshn uchun API kvota/to‘lov ogohlantirishlari va server rate-limitini hosting darajasida sozlang. Hosting talab qilsa, `HOST=0.0.0.0` va `PORT` muhit o‘zgaruvchilarini belgilang; API kalitini hostingning maxfiy muhit o‘zgaruvchilarida saqlang.

## Muhim: demo va real xizmat farqi

`js/database.js` hozircha brauzerning `localStorage` xotirasidan demo ma’lumotlar bazasi sifatida foydalanadi. Bu haqiqiy marketplace server bazasi yoki marketplace autentifikatsiyasi emas: foydalanuvchi o‘z brauzeridagi ma’lumotlarni ko‘rishi va o‘zgartirishi mumkin. F12 yoki brauzer vositalarini ishonchli tarzda bloklab bo‘lmaydi; shu sababli maxfiy ma’lumotlarni brauzerga yubormang. Gemini API kaliti esa faqat `server.js` da ishlatiladigan server muhit o‘zgaruvchisida saqlanadi va brauzerga yuborilmaydi. Boshlang‘ich e’lonlar namuna bo‘lib, haqiqiy sotuvchilar emas. Foydalanuvchi kiritgan e’lon va buyurtmalar faqat shu qurilmadagi brauzerda saqlanadi; ular sotuvchiga yuborilmaydi, to‘lov olinmaydi va sotuvchining buyurtmani bajarishini kafolatlamaydi.

Demo admin: `admin@code-launchy.uz` / `asqar0w`. Eski `tezz` versiyasidagi `admin@tezz.uz` hisobi yangi email va parol xeshiga avtomatik ko‘chiriladi. Admin paroli yangi hisob yaratilganda va eski demo hisob yangilanganda yangi hash bilan saqlanadi. Ro‘yxatdan o‘tgan foydalanuvchilar admin paneliga kira olmaydi. Parollar PBKDF2 bilan xeshlanib saqlansa ham, brauzer ichidagi admin roli va `localStorage` foydalanuvchi tomonidan o‘zgartirilishi mumkin; demo tizim xavfsizlik chegarasi hisoblanmaydi. Haqiqiy servisda parol xeshlash, sessiya, admin ruxsatlari, rasm saqlash va moderatsiya server tomonda bajarilishi kerak.

Google kirishi `js/auth-config.js` dagi Firebase Web app sozlamalaridan foydalanadi. Firebase Console’da Authentication > Sign-in method bo‘limida Google provider yoqilgan va sayt domeni Authorized domains ro‘yxatida bo‘lishi kerak. Tasdiqlangan Google hisobiga bog‘langan marketplace hisobi bo‘lmasa, tugma yangi hisob yaratadi: “Ro‘yxatdan o‘tish” bo‘limida tanlangan rolni, “Kirish” bo‘limida esa xaridor rolini oladi. Firebase Google hisobini tekshiradi, ammo buyurtma va e’lonlar hozircha brauzerning `localStorage` xotirasida saqlanadi.

Haqiqiy savdo uchun backend/API va ma’lumotlar bazasi, sotuvchi tekshiruvi, buyurtma xabarnomalari, nizolarni ko‘rib chiqish hamda to‘lov provayderi bilan integratsiya kerak. Ishga tushirishdan oldin xavfsiz topshirish, litsenziya va qaytarish shartlarini ham belgilash lozim.
