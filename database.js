(function () {
  const storageKey = 'code-launchy-database-v1';
  const legacyKeys = ['tezz-database-v1', 'sayd-database-v1', 'sayd-marketplace-v1'];
  const demoAdminEmail = 'admin@code-launchy.uz';
  const legacyDemoAdminEmail = 'admin@tezz.uz';
  const demoAdminPassword = 'asqar0w';
  const demoAdminCredentialVersion = 3;
  const passwordIterations = 210000;

  function emptyData() {
    return { listings: [], orders: [], users: [], sessionUserId: null };
  }

  function read() {
    try {
      const current = localStorage.getItem(storageKey);
      let legacy = null;
      if (current === null) {
        legacy = legacyKeys.map((key) => localStorage.getItem(key)).find(Boolean);
      }
      const saved = JSON.parse(current || legacy || '{}');
      return {
        listings: Array.isArray(saved.listings) ? saved.listings : [],
        orders: Array.isArray(saved.orders) ? saved.orders : [],
        users: Array.isArray(saved.users) ? saved.users : [],
        sessionUserId: typeof saved.sessionUserId === 'string' ? saved.sessionUserId : null
      };
    } catch (error) {
      console.error('code-launchy bazasidagi ma’lumotlarni o‘qib bo‘lmadi.', error);
      return emptyData();
    }
  }

  function write(data) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        listings: Array.isArray(data.listings) ? data.listings : [],
        orders: Array.isArray(data.orders) ? data.orders : [],
        users: Array.isArray(data.users) ? data.users : [],
        sessionUserId: typeof data.sessionUserId === 'string' ? data.sessionUserId : null
      }));
      return true;
    } catch (error) {
      console.error('code-launchy bazasiga ma’lumot yozib bo‘lmadi.', error);
      return false;
    }
  }

  function makeId(prefix) {
    return `${prefix}-${Date.now()}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
  }

  function toHex(bytes) {
    return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  async function createPasswordHash(password, salt) {
    if (!crypto.subtle) throw new Error('Brauzer xavfsiz parol tekshiruvini qo‘llamaydi.');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const result = await crypto.subtle.deriveBits({
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: new TextEncoder().encode(salt),
      iterations: passwordIterations
    }, key, 256);
    return toHex(result);
  }

  function publicUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      createdAt: user.createdAt
    };
  }

  function currentUser() {
    const data = read();
    return publicUser(data.users.find((user) => user.id === data.sessionUserId));
  }

  async function seedDemoAdmin() {
    const data = read();
    const existingAdmin = data.users.find((user) => user.email === demoAdminEmail || user.email === legacyDemoAdminEmail);
    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') return;
      if (existingAdmin.demoCredentialVersion === demoAdminCredentialVersion && existingAdmin.email === demoAdminEmail) return;
      const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
      existingAdmin.email = demoAdminEmail;
      existingAdmin.name = 'code-launchy Admin';
      existingAdmin.salt = salt;
      existingAdmin.passwordHash = await createPasswordHash(demoAdminPassword, salt);
      existingAdmin.demoCredentialVersion = demoAdminCredentialVersion;
      if (!write(data)) throw new Error('Demo admin parolini yangilab bo‘lmadi.');
      return;
    }
    const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
    const user = {
      id: makeId('user'),
      name: 'code-launchy Admin',
      email: demoAdminEmail,
      role: 'admin',
      salt,
      passwordHash: await createPasswordHash(demoAdminPassword, salt),
      demoCredentialVersion: demoAdminCredentialVersion,
      createdAt: new Date().toISOString()
    };
    data.users.push(user);
    if (!write(data)) throw new Error('Demo admin hisobini saqlab bo‘lmadi.');
  }

  async function register({ name, email, password, role }) {
    const normalizedEmail = email.trim().toLowerCase();
    const data = read();
    if (!['buyer', 'developer'].includes(role)) {
      return { ok: false, error: 'Xaridor yoki sayt yaratuvchi turini tanlang.' };
    }
    if (data.users.some((user) => user.email === normalizedEmail)) {
      return { ok: false, error: 'Bu email bilan hisob mavjud. Kirish bo‘limidan foydalaning.' };
    }
    const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
    const user = {
      id: makeId('user'),
      name: name.trim(),
      email: normalizedEmail,
      role,
      avatar: '',
      salt,
      passwordHash: await createPasswordHash(password, salt),
      createdAt: new Date().toISOString()
    };
    data.users.push(user);
    data.sessionUserId = user.id;
    if (!write(data)) return { ok: false, error: 'Hisobni saqlab bo‘lmadi. Brauzer xotirasini tekshiring.' };
    return { ok: true, user: publicUser(user) };
  }

  async function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const data = read();
    const user = data.users.find((item) => item.email === normalizedEmail);
    if (!user) return { ok: false, error: 'Email yoki parol noto‘g‘ri.' };
    if (user.googleSubject && (!user.salt || !user.passwordHash)) {
      return { ok: false, error: 'Bu hisob Google orqali yaratilgan. Google bilan kirishdan foydalaning.' };
    }
    if (!user.salt || !user.passwordHash) return { ok: false, error: 'Email yoki parol noto‘g‘ri.' };
    const candidateHash = await createPasswordHash(password, user.salt);
    if (candidateHash !== user.passwordHash) return { ok: false, error: 'Email yoki parol noto‘g‘ri.' };
    data.sessionUserId = user.id;
    if (!write(data)) return { ok: false, error: 'Hisobga kirishni saqlab bo‘lmadi.' };
    return { ok: true, user: publicUser(user) };
  }

  function signInVerifiedGoogleUser(profile, registrationRole) {
    const registering = registrationRole !== undefined;
    if (!profile || typeof profile.sub !== 'string' || typeof profile.email !== 'string' ||
        typeof profile.name !== 'string' || profile.name.trim().length < 2 ||
        !profile.email_verified || (registering && !['buyer', 'developer'].includes(registrationRole))) {
      return { ok: false, error: 'Google hisobi ma’lumotlari tasdiqlanmadi.' };
    }
    const data = read();
    const normalizedEmail = profile.email.trim().toLowerCase();
    let user = data.users.find((item) => item.googleSubject === profile.sub);
    if (user && user.email !== normalizedEmail) {
      return { ok: false, error: 'Google hisobi ma’lumotlari mos kelmadi.' };
    }
    if (!user) {
      user = data.users.find((item) => item.email === normalizedEmail);
      if (user && user.role === 'admin') {
        return { ok: false, error: 'Admin demo hisobiga Google orqali kira olmaysiz.' };
      }
      if (user && user.googleSubject && user.googleSubject !== profile.sub) {
        return { ok: false, error: 'Bu email boshqa Google hisobiga ulangan.' };
      }
    }
    if (user && user.role === 'admin') {
      return { ok: false, error: 'Admin demo hisobiga Google orqali kira olmaysiz.' };
    }
    if (!user) {
      if (!registering) return { ok: false, error: 'Bu Google email bilan hisob topilmadi. Avval ro‘yxatdan o‘ting.' };
      user = {
        id: makeId('user'),
        name: profile.name.trim().slice(0, 50),
        email: normalizedEmail,
        role: registrationRole,
        avatar: typeof profile.picture === 'string' ? profile.picture : '',
        googleSubject: profile.sub,
        createdAt: new Date().toISOString()
      };
      data.users.push(user);
    } else {
      user.googleSubject = profile.sub;
      user.avatar = typeof profile.picture === 'string' ? profile.picture : user.avatar || '';
    }
    data.sessionUserId = user.id;
    if (!write(data)) return { ok: false, error: 'Google hisobini saqlab bo‘lmadi.' };
    return { ok: true, user: publicUser(user) };
  }

  function logout() {
    const data = read();
    data.sessionUserId = null;
    return write(data);
  }

  function updateListingStatus(id, status) {
    if (!['approved', 'rejected'].includes(status)) return false;
    const data = read();
    const listing = data.listings.find((item) => item.id === id);
    if (!listing) return false;
    listing.status = status;
    listing.reviewedAt = new Date().toISOString();
    return write(data);
  }

  function deleteListing(id) {
    const data = read();
    const next = data.listings.filter((item) => item.id !== id);
    if (next.length === data.listings.length) return false;
    data.listings = next;
    return write(data);
  }

  function updateUserRole(id, role) {
    if (!['buyer', 'developer', 'user', 'admin'].includes(role)) return false;
    const data = read();
    if (id === data.sessionUserId && role !== 'admin') return false;
    const user = data.users.find((item) => item.id === id);
    if (!user || user.email === demoAdminEmail) return false;
    user.role = role;
    return write(data);
  }

  function updateUserProfile({ name, avatar, role }) {
    const data = read();
    const user = data.users.find((item) => item.id === data.sessionUserId);
    if (!user) return false;
    if (typeof name === 'string') {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 50) return false;
      user.name = trimmedName;
    }
    if (typeof avatar === 'string') user.avatar = avatar;
    if (['buyer', 'developer'].includes(role) && user.role !== 'admin') user.role = role;
    if (!write(data)) return false;
    return true;
  }

  function deleteOrder(id) {
    const data = read();
    const next = data.orders.filter((item) => item.id !== id);
    if (next.length === data.orders.length) return false;
    data.orders = next;
    return write(data);
  }

  function addToCollection(collection, item) {
    const data = read();
    data[collection].push(item);
    return write(data);
  }

  function addListing(listing) {
    const user = currentUser();
    if (!user || (user.role !== 'developer' && user.role !== 'admin') || listing.ownerId !== user.id) return false;
    return addToCollection('listings', listing);
  }

  window.CodeLaunchyDatabase = Object.freeze({
    storageKey,
    demoAdminEmail,
    read,
    write,
    addListing,
    addOrder: (order) => addToCollection('orders', order),
    currentUser,
    seedDemoAdmin,
    register,
    login,
    signInVerifiedGoogleUser,
    logout,
    updateListingStatus,
    deleteListing,
    updateUserProfile,
    updateUserRole,
    deleteOrder
  });
}());
