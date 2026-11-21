function setAuthMessage(id, message, isError) {
  const box = document.getElementById(id);
  box.textContent = message;
  box.classList.add('show');
  box.classList.toggle('error', isError);
}

function getSafeNextPath() {
  const allowed = new Set(['index.html', 'listing.html', 'orders.html', 'admin.html']);
  const next = new URLSearchParams(window.location.search).get('next');
  return allowed.has(next) ? next : 'index.html';
}

function redirectAfterAuth(user) {
  const next = getSafeNextPath();
  if (next === 'index.html' || (next === 'admin.html' && user.role !== 'admin')) return false;
  window.location.href = next;
  return true;
}

function getRoleLabel(role) {
  if (role === 'admin') return 'Admin demo hisobi';
  if (role === 'developer') return 'Sayt yaratuvchi';
  return 'Xaridor';
}

function renderAccountMessages(user) {
  const data = CodeLaunchyDatabase.read();
  const messages = ['E’lon va so‘rovlar demo rejimida shu brauzerda saqlanadi.'];
  const messageList = document.getElementById('accountMessages');
  if (user.role === 'admin') {
    const pending = data.listings.filter((listing) => listing.status === 'pending').length;
    messages.unshift(pending
      ? `${pending} ta e’lon admin ko‘rib chiqishini kutmoqda. Admin panelida tekshiring.`
      : 'Yangi e’lonlar kelganda admin panelida ko‘rasiz.');
  } else if (user.role === 'developer') {
    const ownListings = data.listings.filter((listing) => listing.ownerId === user.id);
    const pending = ownListings.filter((listing) => listing.status === 'pending').length;
    const incoming = data.orders.filter((order) => order.listingOwnerId === user.id && order.buyerUserId !== user.id).length;
    messages.unshift(pending
      ? `${pending} ta e’loningiz moderator tasdig‘ini kutmoqda.`
      : 'E’lonlaringiz holatini Buyurtmalar bo‘limidan kuzatib boring.');
    messages.unshift(incoming
      ? `Sizga ${incoming} ta yangi so‘rov keldi. Buyurtmalar bo‘limida ko‘ring.`
      : 'Yangi so‘rovlar kelganda bu yerda bildirishnoma chiqadi.');
  } else {
    const sent = data.orders.filter((order) => order.buyerUserId === user.id).length;
    messages.unshift(sent
      ? `${sent} ta yuborgan so‘rovingiz bor. Ularni Buyurtmalar bo‘limida kuzating.`
      : 'Katalogdan sayt tanlab, sotuvchiga so‘rov yuborishingiz mumkin.');
  }
  messageList.replaceChildren();
  messages.forEach((message) => {
    const item = document.createElement('li');
    item.textContent = message;
    messageList.append(item);
  });
}

function showAuthSession(user) {
  document.getElementById('authForms').classList.add('hidden');
  const session = document.getElementById('accountSession');
  session.classList.remove('hidden');
  document.getElementById('sessionName').textContent = user.name;
  document.getElementById('sessionEmail').textContent = user.email;
  document.getElementById('sessionRole').textContent = getRoleLabel(user.role);
  document.getElementById('adminPanelLink').classList.toggle('hidden', user.role !== 'admin');
  document.getElementById('profileAvatar').src = user.avatar || 'assets/code-launchy-logo.svg';
  document.getElementById('profileRole').value = user.role === 'developer' ? 'developer' : 'buyer';
  document.getElementById('profileRole').disabled = user.role === 'admin';
  document.getElementById('saveRoleButton').classList.toggle('hidden', user.role === 'admin');
  renderAccountMessages(user);
  const accountLink = document.querySelector('.account-link');
  if (accountLink) {
    accountLink.textContent = user.name;
    accountLink.href = user.role === 'admin' ? 'admin.html' : 'account.html';
  }
}

function showAuthForms() {
  document.getElementById('authForms').classList.remove('hidden');
  document.getElementById('accountSession').classList.add('hidden');
}

function selectAuthTab(name) {
  const loginSelected = name === 'login';
  document.getElementById('loginForm').classList.toggle('hidden', !loginSelected);
  document.getElementById('registerForm').classList.toggle('hidden', loginSelected);
  document.getElementById('loginTab').classList.toggle('active', loginSelected);
  document.getElementById('registerTab').classList.toggle('active', !loginSelected);
  document.getElementById('loginTab').setAttribute('aria-selected', String(loginSelected));
  document.getElementById('registerTab').setAttribute('aria-selected', String(!loginSelected));
  updateGoogleStatusForSelectedTab();
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    const result = await CodeLaunchyDatabase.login({
      email: String(values.get('email')),
      password: String(values.get('password'))
    });
    if (!result.ok) {
      setAuthMessage('loginMessage', result.error, true);
      return;
    }
    if (redirectAfterAuth(result.user)) return;
    showAuthSession(result.user);
    setAuthMessage('loginMessage', 'Hisobga muvaffaqiyatli kirdingiz.', false);
  } catch (error) {
    setAuthMessage('loginMessage', error instanceof Error ? error.message : 'Kirishda xatolik yuz berdi.', true);
  } finally {
    submit.disabled = false;
  }
}

async function handleRegistration(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    const result = await CodeLaunchyDatabase.register({
      name: String(values.get('name')),
      email: String(values.get('email')),
      password: String(values.get('password')),
      role: String(values.get('role'))
    });
    if (!result.ok) {
      setAuthMessage('registerMessage', result.error, true);
      return;
    }
    window.location.href = 'index.html';
  } catch (error) {
    setAuthMessage('registerMessage', error instanceof Error ? error.message : 'Hisob yaratishda xatolik yuz berdi.', true);
  } finally {
    submit.disabled = false;
  }
}

function optimizeProfileImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return Promise.reject(new Error('Faqat JPG, PNG yoki WebP formatidagi rasm tanlang.'));
  }
  if (file.size > 5 * 1024 * 1024) {
    return Promise.reject(new Error('Profil rasmi 5 MB dan kichik bo‘lishi kerak.'));
  }
  return createImageBitmap(file).then((bitmap) => {
    const scale = Math.min(1, 400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Profil rasmini qayta ishlashning imkoni bo‘lmadi.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Profil rasmini optimallashtirib bo‘lmadi.'));
          return;
        }
        if (blob.size > 220 * 1024) {
          reject(new Error('Rasmni siqib bo‘lgach ham hajmi 220 KB dan katta. Boshqa rasm tanlang.'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Profil rasmini o‘qib bo‘lmadi.'));
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.78);
    });
  });
}

async function handleProfileImageChange(event) {
  const input = event.currentTarget;
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    const avatar = await optimizeProfileImage(file);
    if (!CodeLaunchyDatabase.updateUserProfile({ avatar })) {
      throw new Error('Profil rasmini saqlab bo‘lmadi. Rasmni kichraytirib qayta urinib ko‘ring.');
    }
    document.getElementById('profileAvatar').src = avatar;
    setAuthMessage('profileMessage', 'Profil rasmi saqlandi.', false);
  } catch (error) {
    setAuthMessage('profileMessage', error instanceof Error ? error.message : 'Profil rasmini saqlashda xatolik yuz berdi.', true);
  } finally {
    input.value = '';
  }
}

function saveProfileRole() {
  const role = document.getElementById('profileRole').value;
  if (!CodeLaunchyDatabase.updateUserProfile({ role })) {
    setAuthMessage('profileMessage', 'Hisob turini saqlab bo‘lmadi. Qaytadan urinib ko‘ring.', true);
    return;
  }
  const user = CodeLaunchyDatabase.currentUser();
  document.getElementById('sessionRole').textContent = getRoleLabel(user.role);
  renderAccountMessages(user);
  setAuthMessage('profileMessage', 'Hisob turi saqlandi.', false);
}

function setGoogleStatus(message, isError) {
  const status = document.getElementById('googleMessage');
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function updateGoogleStatusForSelectedTab() {
  const registering = !document.getElementById('registerForm').classList.contains('hidden');
  setGoogleStatus(registering
    ? 'Google bilan davom etib, yangi hisobingizni avtomatik yarating.'
    : 'Google hisobi topilmasa, xaridor hisobi avtomatik yaratiladi.', false);
}

function loadFirebaseScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Google kirish kutubxonasini yuklab bo‘lmadi.'));
    document.head.append(script);
  });
}

function getSelectedGoogleRole() {
  return document.querySelector('#registerForm input[name="role"]:checked').value;
}

async function handleGoogleSignIn(auth) {
  const button = document.getElementById('googleSignInButton');
  const registering = !document.getElementById('registerForm').classList.contains('hidden');
  button.disabled = true;
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    const isGoogleUser = user.providerData.some((providerInfo) => providerInfo.providerId === 'google.com');
    if (!isGoogleUser || !user.email || !user.emailVerified) {
      await auth.signOut();
      throw new Error('Google hisobini tasdiqlab bo‘lmadi.');
    }
    const signIn = CodeLaunchyDatabase.signInVerifiedGoogleUser({
      sub: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      email_verified: user.emailVerified,
      picture: user.photoURL
    }, registering ? getSelectedGoogleRole() : 'buyer');
    if (!signIn.ok) {
      await auth.signOut();
      throw new Error(signIn.error);
    }
    window.location.href = 'index.html';
  } catch (error) {
    setGoogleStatus(error instanceof Error ? error.message : 'Google orqali kirishda xatolik yuz berdi.', true);
    button.disabled = false;
  }
}

async function initializeGoogleSignIn() {
  const config = window.CODE_LAUNCHY_AUTH_CONFIG?.firebase;
  const button = document.getElementById('googleSignInButton');
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  if (!config || requiredKeys.some((key) => !config[key])) {
    setGoogleStatus('Google kirishini yoqish uchun js/auth-config.js fayliga Firebase web config qiymatlarini kiriting.', false);
    return;
  }
  try {
    await loadFirebaseScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
    await loadFirebaseScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js');
    if (!window.firebase) throw new Error('Firebase kirish kutubxonasi ishga tushmadi.');
    if (!firebase.apps.length) firebase.initializeApp(config);
    const auth = firebase.auth();
    button.addEventListener('click', () => handleGoogleSignIn(auth));
    button.disabled = false;
    updateGoogleStatusForSelectedTab();
  } catch (error) {
    setGoogleStatus(error instanceof Error ? error.message : 'Google orqali kirishni tayyorlab bo‘lmadi.', true);
  }
}

async function initAuthPage() {
  const authButtons = document.querySelectorAll('#loginForm button[type="submit"], #registerForm button[type="submit"]');
  authButtons.forEach((button) => { button.disabled = true; });
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegistration);
  document.getElementById('loginTab').addEventListener('click', () => selectAuthTab('login'));
  document.getElementById('registerTab').addEventListener('click', () => selectAuthTab('register'));
  document.getElementById('profileImage').addEventListener('change', handleProfileImageChange);
  document.getElementById('saveRoleButton').addEventListener('click', saveProfileRole);
  document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
      if (window.firebase && firebase.apps.length) await firebase.auth().signOut();
      if (!CodeLaunchyDatabase.logout()) throw new Error('Hisobdan chiqib bo‘lmadi. Qaytadan urinib ko‘ring.');
      showAuthForms();
      selectAuthTab('login');
    } catch (error) {
      setAuthMessage('loginMessage', error instanceof Error ? error.message : 'Hisobdan chiqib bo‘lmadi.', true);
    }
  });

  try {
    await CodeLaunchyDatabase.seedDemoAdmin();
    const user = CodeLaunchyDatabase.currentUser();
    if (user) {
      if (redirectAfterAuth(user)) return;
      showAuthSession(user);
    }
  } catch (error) {
    setAuthMessage('loginMessage', error instanceof Error ? error.message : 'Demo admin hisobini tayyorlab bo‘lmadi.', true);
  } finally {
    authButtons.forEach((button) => { button.disabled = false; });
  }
  initializeGoogleSignIn();
  window.refreshReveal(document);
}

document.addEventListener('DOMContentLoaded', initAuthPage);
