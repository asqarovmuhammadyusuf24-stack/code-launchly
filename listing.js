function showListingMessage(message, isError) {
  const box = document.getElementById('listingMessage');
  box.textContent = message;
  box.classList.add('show');
  box.classList.toggle('error', isError);
}

function resizeImage(file) {
  return createImageBitmap(file).then((bitmap) => {
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Rasmni qayta ishlashning imkoni bo‘lmadi.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Rasmni optimallashtirib bo‘lmadi.'));
          return;
        }
        if (blob.size > 450 * 1024) {
          reject(new Error(`${file.name}: siqilgandan keyin rasm hajmi 450 KB dan oshdi.`));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error(`${file.name}: rasmni o‘qib bo‘lmadi.`));
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.78);
    });
  });
}

let previewObjectUrls = [];

async function loadSelectedImages() {
  const input = document.getElementById('listingImages');
  const files = Array.from(input.files || []);
  if (files.length > 3) throw new Error('Eng ko‘pi bilan 3 ta rasm tanlang.');
  const totalSize = files.reduce((total, file) => total + file.size, 0);
  if (files.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
    throw new Error('Faqat JPG, PNG yoki WebP formatidagi rasmlarni yuklang.');
  }
  if (files.some((file) => file.size > 5 * 1024 * 1024) || totalSize > 10 * 1024 * 1024) {
    throw new Error('Har bir rasm 5 MB gacha, tanlangan rasmlarning jami esa 10 MB gacha bo‘lsin.');
  }
  return Promise.all(files.map(resizeImage));
}

function renderImagePreview() {
  const input = document.getElementById('listingImages');
  const container = document.getElementById('imagePreview');
  container.replaceChildren();
  previewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  previewObjectUrls = [];
  Array.from(input.files || []).slice(0, 3).forEach((file) => {
    const url = URL.createObjectURL(file);
    previewObjectUrls.push(url);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'image-preview-item';
    button.dataset.imageSrc = url;
    button.setAttribute('aria-label', `${file.name} rasmini kattalashtirib ko‘rish`);
    const image = document.createElement('img');
    image.alt = file.name;
    image.src = url;
    const caption = document.createElement('span');
    caption.textContent = 'Kattalashtirish ↗';
    button.append(image, caption);
    container.append(button);
  });
}

function showImageViewer(event) {
  const button = event.target.closest('[data-image-src]');
  if (!button) return;
  document.getElementById('listingImageLarge').src = button.dataset.imageSrc;
  document.getElementById('listingImageViewer').showModal();
}

async function handleListingSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const user = CodeLaunchyDatabase.currentUser();
  if (!user) {
    const next = encodeURIComponent('listing.html');
    window.location.href = `account.html?next=${next}`;
    return;
  }
  if (user.role !== 'developer' && user.role !== 'admin') {
    showListingMessage('E’lon joylash uchun hisob turini “Sayt yasovchi / dasturchi” qilib o‘zgartiring.', true);
    return;
  }

  const values = new FormData(form);
  const type = String(values.get('type'));
  const title = String(values.get('title')).trim();
  const description = String(values.get('description')).trim();
  const price = Number(values.get('price'));
  const seller = user.name;
  const contact = String(values.get('contact')).trim();

  if (!title || !description || !contact || !Number.isFinite(price) || price < 0) {
    showListingMessage('Ma’lumotlarni tekshirib, barcha majburiy maydonlarni to‘ldiring.', true);
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'E’lon tayyorlanmoqda...';
  try {
    const images = await loadSelectedImages();
    const listing = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ownerId: user.id,
      type,
      title,
      description,
      price,
      seller,
      contact,
      images,
      image: images[0] || '',
      icon: type === 'website' ? '🌐' : type === 'template' ? '✳️' : '💻',
      art: type === 'website' ? '#e5ecd9' : type === 'template' ? '#f3e4db' : '#e5e2f1',
      skills: type === 'developer' ? ['Veb dasturlash', 'Buyurtma asosida'] : undefined,
      status: 'pending',
      sample: false,
      createdAt: new Date().toISOString()
    };

    if (!CodeLaunchyDatabase.addListing(listing)) {
      showListingMessage('E’lonni saqlab bo‘lmadi. Rasm hajmini kichraytirib, qayta urinib ko‘ring.', true);
      return;
    }

    form.reset();
    renderImagePreview();
    showListingMessage('E’loningiz admin tekshiruvi uchun yuborildi. Tasdiqlangach katalogda ko‘rinadi.', false);
    document.getElementById('listingSuccessLink').classList.remove('hidden');
  } catch (error) {
    showListingMessage(error instanceof Error ? error.message : 'Rasmni yuklashda xatolik yuz berdi.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'E’lonni joylash <span aria-hidden="true">→</span>';
  }
}

function updateListingAccountNote(user) {
  const note = document.getElementById('listingAccountNote');
  const submitButton = document.querySelector('#listingForm button[type="submit"]');
  if (!user) {
    note.classList.remove('hidden');
    note.innerHTML = 'E’lon joylash uchun avval <a href="account.html?next=listing.html">hisobga kiring</a> yoki ro‘yxatdan o‘ting.';
    submitButton.disabled = true;
    return;
  }
  if (user.role !== 'developer' && user.role !== 'admin') {
    note.classList.remove('hidden');
    note.innerHTML = 'Bu hisob xaridor uchun. E’lon berish uchun <a href="account.html">akkaunt bo‘limida hisob turini “Sayt yasovchi / dasturchi” qilib o‘zgartiring</a>.';
    submitButton.disabled = true;
    return;
  }
  note.classList.remove('hidden');
  note.textContent = `E’lon ${user.name} nomidan yuboriladi va admin tasdiqlashini kutadi.`;
  submitButton.disabled = false;
  document.getElementById('sellerName').value = user.name;
  document.getElementById('sellerContact').value = user.email;
}

function initListingPage() {
  const user = CodeLaunchyDatabase.currentUser();
  updateListingAccountNote(user);
  document.getElementById('listingForm').addEventListener('submit', handleListingSubmit);
  document.getElementById('listingImages').addEventListener('change', renderImagePreview);
  const imageViewer = document.getElementById('listingImageViewer');
  document.getElementById('imagePreview').addEventListener('click', showImageViewer);
  document.getElementById('closeImageViewer').addEventListener('click', () => imageViewer.close());
  imageViewer.addEventListener('click', (event) => {
    if (event.target === imageViewer) imageViewer.close();
  });
  imageViewer.addEventListener('close', () => {
    document.getElementById('listingImageLarge').removeAttribute('src');
  });
  document.getElementById('listingType').addEventListener('change', (event) => {
    const isDeveloper = event.target.value === 'developer';
    document.getElementById('titleLabel').textContent = isDeveloper ? 'Xizmat sarlavhasi' : 'E’lon sarlavhasi';
    document.getElementById('descriptionLabel').textContent = isDeveloper ? 'Xizmat haqida' : 'Mahsulot haqida';
  });
  const accountLink = document.querySelector('.account-link');
  if (user && accountLink) {
    accountLink.textContent = user.name;
    accountLink.href = user.role === 'admin' ? 'admin.html' : 'account.html';
  }
  window.refreshReveal(document);
}

document.addEventListener('DOMContentLoaded', initListingPage);
