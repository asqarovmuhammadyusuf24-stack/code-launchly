function makeOrderElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderOrdersPage() {
  const user = CodeLaunchyDatabase.currentUser();
  if (!user) {
    window.location.href = 'account.html?next=orders.html';
    return;
  }
  const orders = CodeLaunchyDatabase.read().orders
    .filter((order) => order.buyerUserId === user.id || order.listingOwnerId === user.id)
    .map((order) => ({ ...order, isIncoming: order.listingOwnerId === user.id && order.buyerUserId !== user.id }));
  const list = document.getElementById('ordersList');
  const count = document.getElementById('orderCount');
  if (count) count.textContent = String(orders.length);
  list.replaceChildren();

  if (!orders.length) {
    const empty = makeOrderElement('div', 'orders-empty page-card');
    empty.append(makeOrderElement('p', '', 'Hozircha buyurtma yoki sizga kelgan so‘rov yo‘q. Katalogdan e’lon tanlang yoki xizmat taklif qiling.'));
    const link = makeOrderElement('a', 'button button-dark', 'Katalogni ko‘rish →');
    link.href = 'index.html#catalog';
    empty.append(link);
    list.append(empty);
    window.refreshReveal(list);
    return;
  }

  [...orders].reverse().forEach((order) => {
    const row = makeOrderElement('article', 'order-row');
    const details = makeOrderElement('div');
    const orderId = typeof order.id === 'string' ? order.id.slice(-6) : '';
    const direction = order.isIncoming ? 'Sizga kelgan so‘rov' : 'Siz yuborgan so‘rov';
    details.append(makeOrderElement('span', 'order-kind', `${direction} · ${order.kind || 'Buyurtma'} · #${orderId}`));
    details.append(makeOrderElement('h3', '', order.title || 'E’lon'));
    details.append(makeOrderElement('p', '', `${order.name || ''} · ${order.contact || ''}`));
    if (order.note) details.append(makeOrderElement('p', 'order-note', `Izoh: ${order.note}`));
    row.append(details);
    row.append(makeOrderElement('span', 'order-status', 'So‘rov saqlandi'));
    row.append(makeOrderElement('time', 'order-date', order.date || 'Sana ko‘rsatilmagan'));
    list.append(row);
  });
  window.refreshReveal(list);
}

function initOrdersPage() {
  const user = CodeLaunchyDatabase.currentUser();
  const accountLink = document.querySelector('.account-link');
  if (user && accountLink) {
    accountLink.textContent = user.name;
    accountLink.href = user.role === 'admin' ? 'admin.html' : 'account.html';
  }
  renderOrdersPage();
  window.addEventListener('storage', (event) => {
    if (event.key === CodeLaunchyDatabase.storageKey) renderOrdersPage();
  });
}

document.addEventListener('DOMContentLoaded', initOrdersPage);
