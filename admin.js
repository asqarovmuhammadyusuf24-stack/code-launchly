function adminElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function adminButton(label, action, id, className) {
  const button = adminElement('button', className || 'admin-action', label);
  button.type = 'button';
  button.dataset.action = action;
  button.dataset.id = id;
  return button;
}

function renderAdminStats(data) {
  const pending = data.listings.filter((listing) => listing.status === 'pending');
  document.getElementById('statListings').textContent = String(data.listings.length);
  document.getElementById('statPending').textContent = String(pending.length);
  document.getElementById('statOrders').textContent = String(data.orders.length);
  document.getElementById('statUsers').textContent = String(data.users.length);
  document.getElementById('pendingBadge').textContent = String(pending.length);
}

function renderAdminListings(data) {
  const list = document.getElementById('adminListings');
  list.replaceChildren();
  if (!data.listings.length) {
    list.append(adminElement('p', 'admin-empty', 'Hozircha foydalanuvchi e’lonlari yo‘q.'));
    return;
  }
  [...data.listings].sort((a, b) => {
    const pendingOrder = Number(a.status !== 'pending') - Number(b.status !== 'pending');
    return pendingOrder || String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  }).forEach((listing) => {
    const card = adminElement('article', 'admin-record');
    const imageSrc = listing.image || (Array.isArray(listing.images) ? listing.images[0] : '');
    if (imageSrc) {
      const image = adminElement('img', 'admin-record-image');
      image.src = imageSrc;
      image.alt = listing.title || 'E’lon rasmi';
      card.append(image);
    }
    const body = adminElement('div', 'admin-record-body');
    const meta = adminElement('div', 'admin-record-meta');
    meta.append(adminElement('span', 'order-kind', listing.type || 'E’lon'));
    meta.append(adminElement('span', `admin-status status-${listing.status || 'approved'}`, listing.status || 'approved'));
    body.append(meta);
    body.append(adminElement('h3', '', listing.title || 'Nomsiz e’lon'));
    body.append(adminElement('p', '', listing.description || 'Tavsif berilmagan.'));
    body.append(adminElement('p', 'admin-record-owner', `${listing.seller || 'Sotuvchi'} · ${listing.contact || ''} · ${Number(listing.price || 0).toLocaleString('uz-UZ')} so‘m`));
    const actions = adminElement('div', 'admin-record-actions');
    if (listing.status !== 'approved') actions.append(adminButton('Tasdiqlash', 'approve-listing', listing.id, 'admin-action approve-action'));
    if (listing.status !== 'rejected') actions.append(adminButton('Rad etish', 'reject-listing', listing.id, 'admin-action reject-action'));
    actions.append(adminButton('O‘chirish', 'delete-listing', listing.id, 'admin-action delete-action'));
    body.append(actions);
    card.append(body);
    list.append(card);
  });
}

function renderAdminOrders(data) {
  const list = document.getElementById('adminOrders');
  list.replaceChildren();
  if (!data.orders.length) {
    list.append(adminElement('p', 'admin-empty', 'Buyurtma so‘rovlari topilmadi.'));
    return;
  }
  [...data.orders].reverse().forEach((order) => {
    const card = adminElement('article', 'admin-record admin-order-record');
    const body = adminElement('div', 'admin-record-body');
    body.append(adminElement('span', 'order-kind', order.kind || 'Buyurtma'));
    body.append(adminElement('h3', '', order.title || 'E’lon'));
    body.append(adminElement('p', '', `${order.name || 'Xaridor'} · ${order.contact || ''} · ${order.date || ''}`));
    if (order.note) body.append(adminElement('p', 'admin-record-owner', `Izoh: ${order.note}`));
    const actions = adminElement('div', 'admin-record-actions');
    actions.append(adminButton('O‘chirish', 'delete-order', order.id, 'admin-action delete-action'));
    body.append(actions);
    card.append(body);
    list.append(card);
  });
}

function renderAdminUsers(data) {
  const list = document.getElementById('adminUsers');
  list.replaceChildren();
  if (!data.users.length) {
    list.append(adminElement('p', 'admin-empty', 'Foydalanuvchilar topilmadi.'));
    return;
  }
  data.users.forEach((user) => {
    const row = adminElement('article', 'admin-user-row');
    const person = adminElement('div', 'admin-user-person');
    person.append(adminElement('strong', '', user.name));
    person.append(adminElement('span', '', `${user.email} · ${new Date(user.createdAt).toLocaleDateString('uz-UZ')}`));
    row.append(person);
    const roleLabel = user.role === 'admin' ? 'Admin' : user.role === 'developer' ? 'Sayt yaratuvchi' : 'Xaridor';
    const role = adminElement('span', `role-badge ${user.role === 'admin' ? 'role-admin' : ''}`, roleLabel);
    row.append(role);
    if (user.role !== 'admin') row.append(adminButton('Admin qilish', 'promote-user', user.id, 'admin-action approve-action'));
    else if (user.email !== CodeLaunchyDatabase.demoAdminEmail) row.append(adminButton('Rolni olib tashlash', 'demote-user', user.id, 'admin-action reject-action'));
    list.append(row);
  });
}

function renderAdmin() {
  const data = CodeLaunchyDatabase.read();
  renderAdminStats(data);
  renderAdminListings(data);
  renderAdminOrders(data);
  renderAdminUsers(data);
  window.refreshReveal(document);
}

function setAdminTab(name) {
  document.querySelectorAll('.admin-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.panel === name));
  ['moderation', 'orders', 'users'].forEach((panel) => {
    document.getElementById(`${panel}Panel`).classList.toggle('hidden', panel !== name);
  });
}

function handleAdminAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  let success = false;
  if (action === 'approve-listing') success = CodeLaunchyDatabase.updateListingStatus(id, 'approved');
  if (action === 'reject-listing') success = CodeLaunchyDatabase.updateListingStatus(id, 'rejected');
  if (action === 'delete-listing') success = CodeLaunchyDatabase.deleteListing(id);
  if (action === 'delete-order') success = CodeLaunchyDatabase.deleteOrder(id);
  if (action === 'promote-user') success = CodeLaunchyDatabase.updateUserRole(id, 'admin');
  if (action === 'demote-user') success = CodeLaunchyDatabase.updateUserRole(id, 'user');
  if (!success) {
    window.alert('Amal bajarilmadi. Ma’lumot yangilangan bo‘lishi mumkin.');
    return;
  }
  renderAdmin();
}

async function initAdminPage() {
  const user = CodeLaunchyDatabase.currentUser();
  const gate = document.getElementById('adminGate');
  const dashboard = document.getElementById('adminDashboard');
  if (!user || user.role !== 'admin') {
    gate.classList.remove('hidden');
    const accountLink = document.querySelector('.account-link');
    if (accountLink) accountLink.href = 'account.html?next=admin.html';
    document.getElementById('adminLogout').classList.add('hidden');
    return;
  }

  dashboard.classList.remove('hidden');
  document.querySelector('.account-link').textContent = user.name;
  document.querySelector('.account-link').href = 'account.html';
  document.getElementById('adminLogout').addEventListener('click', () => {
    CodeLaunchyDatabase.logout();
    window.location.href = 'account.html';
  });
  document.querySelector('.admin-tabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-panel]');
    if (button) setAdminTab(button.dataset.panel);
  });
  document.getElementById('adminDashboard').addEventListener('click', handleAdminAction);
  renderAdmin();
}

document.addEventListener('DOMContentLoaded', initAdminPage);
