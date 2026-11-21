const filters = [
  { id: 'all', label: 'Barchasi' },
  { id: 'website', label: 'Tayyor sayt' },
  { id: 'template', label: 'Shablon' },
  { id: 'developer', label: 'Dasturchi' }
];

const sampleListings = [
  {
    id: 'sample-site-shop',
    type: 'website',
    title: 'Onlayn do‘kon — ishga tayyor sayt',
    description: 'Mahsulotlar katalogi, savatcha va buyurtma formasi bilan. Rang va logotipni moslab berish mumkin.',
    price: 1800000,
    seller: 'WebStart Studio',
    contact: '@webstart_demo',
    icon: '🛍️',
    art: '#e9e8d9',
    image: 'demos/assets/red-sneaker.jpg',
    demoUrl: 'demos/tezz-shop/index.html',
    sample: true
  },
  {
    id: 'sample-template-agency',
    type: 'template',
    title: 'Kreativ agentlik uchun landing shablon',
    description: 'Moslashuvchan dizayn, xizmatlar va portfolio bo‘limlari. HTML/CSS formatida topshiriladi.',
    price: 290000,
    seller: 'Nodira Design',
    contact: '@nodira_design_demo',
    icon: '✳️',
    art: '#f5e1d5',
    sample: true
  },
  {
    id: 'sample-site-cafe',
    type: 'website',
    title: 'Kafe va restoran uchun tayyor veb-sayt',
    description: 'Taomnoma, ish vaqti, aloqa ma’lumoti va xarita bilan. Telefon ekraniga moslangan.',
    price: 1250000,
    seller: 'Pixel House',
    contact: '@pixelhouse_demo',
    icon: '☕',
    art: '#e2e9dd',
    image: 'demos/assets/cafe-interior.jpg',
    demoUrl: 'demos/tezz-cafe/index.html',
    sample: true
  },
  {
    id: 'sample-template-portfolio',
    type: 'template',
    title: 'Shaxsiy portfolio uchun minimal shablon',
    description: 'Mutaxassislar uchun sodda portfolio maketi. Matn, rang va rasmlarni o‘zingiz almashtiring.',
    price: 150000,
    seller: 'Azizbek UI',
    contact: '@azizbekui_demo',
    icon: '▧',
    art: '#e3e1f1',
    sample: true
  }
];

const sampleDevelopers = [
  {
    id: 'sample-dev-sardor',
    title: 'Biznesingiz uchun sayt yarataman',
    description: 'Kichik biznes va xizmatlar uchun tezkor, mobilga mos veb-sayt. Ish boshlashdan oldin talablarni kelishamiz.',
    seller: 'Sardor Karimov',
    contact: '@sardor_dev_demo',
    price: 900000,
    skills: ['Landing page', 'HTML/CSS', 'Mobil dizayn'],
    sample: true
  },
  {
    id: 'sample-dev-madina',
    title: 'Dizayndan tayyor saytga qadar',
    description: 'Brendingizga mos dizayn va veb-sayt. Har bosqichda ko‘rib chiqish va tuzatishlar kelishiladi.',
    seller: 'Madina Studio',
    contact: '@madina_studio_demo',
    price: 1500000,
    skills: ['UI/UX', 'Figma', 'Web sayt'],
    sample: true
  },
  {
    id: 'sample-dev-umar',
    title: 'Sayt va onlayn do‘konlar ishlab chiqaman',
    description: 'Katalog, mahsulot sahifalari va aloqa formasi kerak bo‘lgan loyihalar uchun individual yechim.',
    seller: 'Umar Web',
    contact: '@umarweb_demo',
    price: 2200000,
    skills: ['Onlayn do‘kon', 'Frontend', 'Integratsiya'],
    sample: true
  }
];

const state = {
  ...CodeLaunchyDatabase.read(),
  filter: 'all',
  search: '',
  sort: 'featured',
  activeListing: null,
  toastTimer: null
};

function formatPrice(price) {
  const amount = Number(price);
  if (!Number.isFinite(amount) || amount <= 0) return 'Kelishiladi';
  return `${new Intl.NumberFormat('uz-UZ').format(amount)} so‘m`;
}

function getListingLabel(type) {
  return filters.find((filter) => filter.id === type)?.label || 'E’lon';
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createActionButton(label, action, id) {
  const button = makeElement('button', 'card-action', label);
  button.type = 'button';
  button.dataset.action = action;
  button.dataset.id = id;
  return button;
}

function getAllListings() {
  return [
    ...state.listings.filter((listing) => listing.status === 'approved' || !listing.status),
    ...sampleListings
  ];
}

function renderFilters() {
  const container = document.getElementById('catalogFilters');
  container.replaceChildren();
  filters.forEach((filter) => {
    const button = makeElement('button', `filter-button${state.filter === filter.id ? ' active' : ''}`, filter.label);
    button.type = 'button';
    button.dataset.filter = filter.id;
    button.setAttribute('aria-pressed', String(state.filter === filter.id));
    container.append(button);
  });
}

function renderListings() {
  const grid = document.getElementById('listingGrid');
  const query = state.search.toLocaleLowerCase('uz');
  let listings = getAllListings().filter((listing) => {
    const matchesType = state.filter === 'all' || listing.type === state.filter;
    const searchable = `${listing.title} ${listing.description} ${listing.seller}`.toLocaleLowerCase('uz');
    return matchesType && searchable.includes(query);
  });
  if (state.sort === 'low') listings.sort((first, second) => first.price - second.price);
  if (state.sort === 'high') listings.sort((first, second) => second.price - first.price);

  grid.replaceChildren();
  listings.forEach((listing) => grid.append(createListingCard(listing)));
  document.getElementById('emptyCatalog').classList.toggle('hidden', listings.length > 0);
  if (window.refreshReveal) window.refreshReveal(grid);
}

function createListingCard(listing) {
  const card = makeElement('article', 'listing-card');
  const art = makeElement('div', 'listing-art');
  art.style.setProperty('--art-bg', listing.art || '#e7eddc');
  if (listing.image) {
    art.classList.add('has-photo');
    const image = makeElement('img', 'listing-art-image');
    image.src = listing.image;
    image.alt = listing.title;
    image.loading = 'lazy';
    art.append(image);
  }
  art.append(makeElement('span', 'listing-kind', getListingLabel(listing.type)));
  art.append(makeElement('span', 'art-emoji', listing.icon || '✦'));
  if (listing.sample) art.append(makeElement('span', 'sample-label', 'NAMUNAVIY E’LON'));

  const info = makeElement('div', 'listing-info');
  const sellerLine = makeElement('div', 'seller-line');
  sellerLine.append(makeElement('span', 'seller-avatar', listing.seller.slice(0, 1).toLocaleUpperCase('uz')));
  sellerLine.append(makeElement('span', '', listing.seller));
  sellerLine.append(makeElement('span', 'verified', '●'));
  const title = makeElement('h3', '', listing.title);
  const description = makeElement('p', 'listing-description', listing.description);
  const footer = makeElement('div', 'listing-foot');
  const price = makeElement('div', 'price', formatPrice(listing.price));
  price.append(makeElement('small', '', 'boshlang‘ich narx'));
  footer.append(price);
  const actions = makeElement('div', 'listing-actions');
  if (listing.demoUrl) {
    const preview = makeElement('a', 'card-action preview-action', 'Sinab ko‘rish ↗');
    preview.href = listing.demoUrl;
    preview.target = '_blank';
    preview.rel = 'noopener noreferrer';
    preview.setAttribute('aria-label', `${listing.title} demo saytini yangi oynada ko‘rish`);
    actions.append(preview);
  }
  actions.append(createActionButton('Buyurtma ↗', 'order', listing.id));
  footer.append(actions);
  info.append(sellerLine, title, description, footer);
  card.append(art, info);
  return card;
}

function createDeveloperCard(developer) {
  const card = makeElement('article', 'developer-card');
  const top = makeElement('div', 'developer-top');
  top.append(makeElement('span', 'developer-avatar', developer.seller.slice(0, 1).toLocaleUpperCase('uz')));
  const name = makeElement('div', 'developer-name');
  name.append(makeElement('strong', '', developer.seller));
  name.append(makeElement('span', '', developer.sample ? 'Namuna · profil tasdiqlanmagan' : developer.contact));
  top.append(name);
  top.append(makeElement('span', 'developer-status', '● E’LON'));
  const title = makeElement('h3', '', developer.title);
  const description = makeElement('p', '', developer.description);
  const skills = makeElement('div', 'skill-tags');
  (developer.skills || ['Veb dasturlash']).forEach((skill) => skills.append(makeElement('span', '', skill)));
  const footer = makeElement('div', 'developer-foot');
  const price = makeElement('span', 'developer-price');
  price.append(makeElement('strong', '', formatPrice(developer.price)));
  price.append(document.createTextNode('loyiha narxi'));
  footer.append(price);
  footer.append(createActionButton('Loyiha so‘rash ↗', 'order', developer.id));
  card.append(top, title, description, skills, footer);
  return card;
}

function renderDevelopers() {
  const grid = document.getElementById('developerGrid');
  const developers = [...state.listings.filter((listing) => listing.type === 'developer' && (listing.status === 'approved' || !listing.status)), ...sampleDevelopers];
  grid.replaceChildren();
  developers.forEach((developer) => grid.append(createDeveloperCard(developer)));
  document.getElementById('emptyDevelopers').classList.toggle('hidden', developers.length > 0);
  if (window.refreshReveal) window.refreshReveal(grid);
}

function renderOrderCount() {
  const count = document.getElementById('orderCount');
  if (count) count.textContent = String(state.orders.length);
}

function updateAccountLink() {
  const link = document.querySelector('.account-link');
  if (!link) return;
  const user = CodeLaunchyDatabase.currentUser();
  link.textContent = user ? user.name : 'Kirish';
  link.href = user && user.role === 'admin' ? 'admin.html' : 'account.html';
}

function renderAll() {
  renderFilters();
  renderListings();
  renderDevelopers();
  renderOrderCount();
  updateAccountLink();
  if (window.refreshReveal) window.refreshReveal(document);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => toast.classList.remove('show'), 4500);
}

function openOrderDialog(id) {
  const user = CodeLaunchyDatabase.currentUser();
  if (!user) {
    window.location.href = 'account.html?next=index.html';
    return;
  }
  const listing = [...getAllListings(), ...sampleDevelopers].find((item) => item.id === id);
  if (!listing) {
    showToast('Bu e’lon topilmadi. Sahifani yangilab ko‘ring.');
    return;
  }
  state.activeListing = listing;
  document.getElementById('buyerName').value = user.name;
  document.getElementById('buyerContact').value = user.email;
  const isDeveloper = listing.type === 'developer' || sampleDevelopers.some((item) => item.id === listing.id);
  document.getElementById('dialogEyebrow').textContent = isDeveloper ? 'DASTURCHIGA LOYIHA SO‘ROVI' : 'SAYT UCHUN BUYURTMA';
  document.getElementById('dialogTitle').textContent = isDeveloper ? 'Loyihangizni muhokama qiling' : 'Buyurtma so‘rovini yuboring';
  document.getElementById('dialogListing').textContent = `${listing.title} · ${formatPrice(listing.price)}`;
  document.getElementById('dialogListingId').value = listing.id;
  document.getElementById('dialogSubmit').firstChild.textContent = isDeveloper ? 'Loyiha so‘rovini saqlash ' : 'Buyurtma so‘rovini saqlash ';
  document.getElementById('orderDialog').showModal();
  document.getElementById('buyerName').focus();
}

function handleCatalogClick(event) {
  const button = event.target.closest('[data-action="order"]');
  if (button) openOrderDialog(button.dataset.id);
}

function handleFilterClick(event) {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  state.filter = button.dataset.filter;
  renderFilters();
  renderListings();
}

function handleOrderSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const listing = state.activeListing;
  if (!listing) {
    showToast('E’lon ma’lumoti topilmadi. Qaytadan urinib ko‘ring.');
    return;
  }
  const isDeveloper = listing.type === 'developer' || sampleDevelopers.some((item) => item.id === listing.id);
  const order = {
    id: `ord-${Date.now()}`,
    listingId: listing.id,
    buyerUserId: CodeLaunchyDatabase.currentUser()?.id || null,
    listingOwnerId: listing.ownerId || null,
    listingOwnerName: listing.seller || '',
    title: listing.title,
    kind: isDeveloper ? 'Loyiha so‘rovi' : 'Buyurtma',
    name: String(formData.get('buyerName')).trim(),
    contact: String(formData.get('buyerContact')).trim(),
    note: String(formData.get('note')).trim(),
    date: new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium' }).format(new Date())
  };
  if (!CodeLaunchyDatabase.addOrder(order)) {
    showToast('Buyurtmani saqlab bo‘lmadi. Brauzer xotirasini tekshiring.');
    return;
  }
  state.orders = CodeLaunchyDatabase.read().orders;
  form.reset();
  document.getElementById('orderDialog').close();
  renderOrderCount();
  showToast('So‘rov ushbu brauzerda saqlandi. E’lon egasi shu qurilmada hisobiga kirib ko‘rishi mumkin; demo rejimida boshqa qurilmaga yuborilmaydi.');
}

function bindEvents() {
  document.getElementById('catalogFilters').addEventListener('click', handleFilterClick);
  document.getElementById('listingGrid').addEventListener('click', handleCatalogClick);
  document.getElementById('developerGrid').addEventListener('click', handleCatalogClick);
  document.getElementById('searchInput').addEventListener('input', (event) => {
    state.search = event.target.value.trim();
    renderListings();
  });
  document.getElementById('sortSelect').addEventListener('change', (event) => {
    state.sort = event.target.value;
    renderListings();
  });
  const orderForm = document.getElementById('orderForm');
  if (orderForm) orderForm.addEventListener('submit', handleOrderSubmit);
  const closeButton = document.querySelector('.dialog-close');
  if (closeButton) closeButton.addEventListener('click', () => document.getElementById('orderDialog').close());
  const dialog = document.getElementById('orderDialog');
  if (dialog) dialog.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
}

function init() {
  bindEvents();
  renderAll();
  refreshReveal(document);
}

window.addEventListener('storage', (event) => {
  if (event.key !== CodeLaunchyDatabase.storageKey) return;
  const data = CodeLaunchyDatabase.read();
  state.listings = data.listings;
  state.orders = data.orders;
  renderAll();
  refreshReveal(document);
});

document.addEventListener('DOMContentLoaded', init);
