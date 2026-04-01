// ==================== script.js ====================
// Shared data and functions for all pages (monochrome version)

// ---------- Initial Data ----------
let categories = ["ACTIVEWEAR", "BASICS", "GRAPHICS", "PRINTED"];

let products = [
  { id: 1, name: "Micro Zig Zag", price: 2499, salePrice: 1999, category: "GRAPHICS", image: "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: true, description: "Edgy zigzag pattern, premium cotton." },
  { id: 2, name: "Texture Tee", price: 2299, salePrice: 1839, category: "BASICS", image: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: true, description: "Textured fabric for a unique feel." },
  { id: 3, name: "Crew Neck Essential", price: 2490, salePrice: null, category: "BASICS", image: "https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: true, description: "Classic crew neck, everyday essential." },
  { id: 4, name: "Batman Graphic", price: 5000, salePrice: 2480, category: "GRAPHICS", image: "https://images.pexels.com/photos/5698420/pexels-photo-5698420.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: false, description: "Limited edition Batman print." },
  { id: 5, name: "Oversized Chrome", price: 3990, salePrice: 2990, category: "ACTIVEWEAR", image: "https://images.pexels.com/photos/1648750/pexels-photo-1648750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: true, description: "Streetwear oversized fit." },
  { id: 6, name: "Printed Flora", price: 1890, salePrice: null, category: "PRINTED", image: "https://images.pexels.com/photos/2895198/pexels-photo-2895198.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: false, description: "Tropical floral print." }
];

let users = [
  { email: "admin@threadforge.com", password: "admin123", role: "admin" },
  { email: "user@example.com", password: "user123", role: "user" }
];

let cart = [];
let currentUser = null;

// ---------- Load/Save Data ----------
function loadData() {
  const storedCats = localStorage.getItem("threadforge_categories");
  const storedProds = localStorage.getItem("threadforge_products");
  const storedUsers = localStorage.getItem("threadforge_users");
  const storedCart = localStorage.getItem("threadforge_cart");
  const storedUser = localStorage.getItem("threadforge_currentUser");

  if (storedCats) categories = JSON.parse(storedCats);
  if (storedProds) products = JSON.parse(storedProds);
  if (storedUsers) users = JSON.parse(storedUsers);
  if (storedCart) cart = JSON.parse(storedCart);
  if (storedUser) currentUser = JSON.parse(storedUser);
}
function saveData() {
  localStorage.setItem("threadforge_categories", JSON.stringify(categories));
  localStorage.setItem("threadforge_products", JSON.stringify(products));
  localStorage.setItem("threadforge_users", JSON.stringify(users));
  localStorage.setItem("threadforge_cart", JSON.stringify(cart));
  localStorage.setItem("threadforge_currentUser", JSON.stringify(currentUser));
}
loadData();

// ---------- Helper ----------
function getFinalPrice(p) {
  return p.salePrice ? p.salePrice : p.price;
}

// ---------- Cart Functions ----------
function addToCart(productId, quantity = 1, size = "M") {
  let product = products.find(p => p.id === productId);
  if (!product) return;
  let existing = cart.find(item => item.id === productId && item.size === size);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity, size, priceToUse: getFinalPrice(product) });
  }
  saveData();
  updateCartBadge();
}
function removeFromCart(cartItemId) {
  cart = cart.filter((_, idx) => idx !== cartItemId);
  saveData();
  updateCartBadge();
}
function updateCartQuantity(cartItemId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(cartItemId);
  } else {
    cart[cartItemId].quantity = newQuantity;
    saveData();
  }
  updateCartBadge();
}
function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.priceToUse * item.quantity), 0);
}
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (badge) {
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    badge.innerText = totalItems;
  }
}

// ---------- Authentication ----------
function login(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = { email: user.email, role: user.role };
    saveData();
    return true;
  }
  return false;
}
function register(email, password, role = "user") {
  if (users.find(u => u.email === email)) return false;
  users.push({ email, password, role });
  saveData();
  return true;
}
function logout() {
  currentUser = null;
  saveData();
  window.location.href = "index.html";
}
function isAdmin() {
  return currentUser && currentUser.role === "admin";
}
function requireAuth(redirectTo = "login.html") {
  if (!currentUser) window.location.href = redirectTo;
}
function requireAdmin(redirectTo = "index.html") {
  if (!isAdmin()) window.location.href = redirectTo;
}

// ---------- UI Helpers ----------
function renderProductCards(containerId, productList, showAddToCart = true) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = productList.map(p => {
    const price = getFinalPrice(p);
    const original = p.salePrice ? p.price : null;
    return `
      <div class="product-card bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 group">
        <a href="product.html?id=${p.id}" class="block relative h-64 overflow-hidden">
          <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          ${p.salePrice ? `<span class="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded-full">SALE</span>` : ""}
        </a>
        <div class="p-4">
          <h3 class="font-bold text-lg">${p.name}</h3>
          <p class="text-gray-500 text-sm">${p.category}</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="font-bold text-xl">Rs. ${price.toLocaleString()}</span>
            ${original ? `<span class="line-through text-gray-400 text-sm">Rs. ${original.toLocaleString()}</span>` : ""}
          </div>
          ${showAddToCart ? `<button class="add-to-cart-btn mt-3 w-full py-2 rounded-full border border-gray-400 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Add to Cart</button>` : ""}
        </div>
      </div>
    `;
  }).join('');
  if (showAddToCart) {
    document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        addToCart(parseInt(btn.dataset.id));
        alert("Added to cart!");
      });
    });
  }
}

// ---------- Dark Mode Toggle (monochrome) ----------
function initDarkMode() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;
  const isDark = localStorage.getItem("theme") === "dark";
  if (isDark) document.documentElement.classList.add("dark");
  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
  });
}

// ---------- Initialize on every page ----------
document.addEventListener("DOMContentLoaded", () => {
  initDarkMode();
  updateCartBadge();

  // Update user name in header (if element exists)
  const userNameSpan = document.getElementById("userName");
  if (userNameSpan) {
    if (currentUser) userNameSpan.innerText = currentUser.email.split('@')[0];
    else userNameSpan.innerText = "Account";
  }

  // Logout button (if exists)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
});  if (!grid) return;
  const filtered = getFilteredProducts();
  grid.innerHTML = filtered.map(p => {
    const price = getFinalPrice(p);
    const original = p.salePrice ? p.price : null;
    return `<div class="product-card bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 group">
      <div class="relative h-64 overflow-hidden"><img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"><span class="absolute top-3 left-3 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">${p.salePrice ? "SALE" : ""}</span></div>
      <div class="p-4"><h3 class="font-bold text-lg">${p.name}</h3><p class="text-gray-500 text-sm">${p.category}</p><div class="flex items-center gap-2 mt-2"><span class="font-bold text-xl">Rs. ${price.toLocaleString()}</span>${original ? `<span class="line-through text-gray-400 text-sm">Rs. ${original.toLocaleString()}</span>` : ""}</div>
      <button class="add-to-cart-btn mt-3 w-full py-2 rounded-full border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Add to Cart</button></div></div>`;
  }).join('');
  document.querySelectorAll(".add-to-cart-btn").forEach(btn => btn.addEventListener("click", () => addToCart(parseInt(btn.dataset.id))));
}

function updateRecommendations() {
  const recGrid = document.getElementById("recommendationGrid");
  if (!recGrid) return;
  let recs = [];
  if (cart.length > 0) {
    const cartCat = products.find(p => p.id === cart[0].id)?.category;
    recs = products.filter(p => p.category === cartCat && !cart.some(c => c.id === p.id)).slice(0,4);
  }
  if (recs.length === 0) recs = products.filter(p => p.featured).slice(0,4);
  recGrid.innerHTML = recs.map(p => {
    const price = getFinalPrice(p);
    return `<div class="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md"><img src="${p.image}" class="h-48 w-full object-cover"><div class="p-3"><h4 class="font-bold">${p.name}</h4><p class="text-amber-600 font-bold">Rs. ${price.toLocaleString()}</p><button class="rec-add-cart text-sm mt-2 bg-amber-100 dark:bg-amber-900/40 px-3 py-1 rounded-full" data-id="${p.id}">Quick Add</button></div></div>`;
  }).join('');
  document.querySelectorAll(".rec-add-cart").forEach(btn => btn.addEventListener("click", () => addToCart(parseInt(btn.dataset.id))));
}

// ========== ADMIN PAGE FUNCTIONS ==========
let categoryChart = null;
function renderAdmin() {
  document.getElementById("totalProductsStat") && (document.getElementById("totalProductsStat").innerText = products.length);
  document.getElementById("totalCategoriesStat") && (document.getElementById("totalCategoriesStat").innerText = categories.length);
  const ctx = document.getElementById("categoryChart")?.getContext("2d");
  if (ctx) {
    const counts = categories.map(cat => products.filter(p => p.category === cat).length);
    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(ctx, { type: 'bar', data: { labels: categories, datasets: [{ label: 'Products per Category', data: counts, backgroundColor: '#d4af37' }] } });
  }
  // Categories list
  const catListDiv = document.getElementById("categoryListAdmin");
  if (catListDiv) {
    catListDiv.innerHTML = categories.map((cat, idx) => `<div class="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full flex items-center gap-2"><span>${cat}</span><button class="delete-cat text-red-500" data-cat="${cat}"><i class="fas fa-times-circle"></i></button></div>`).join('');
    document.querySelectorAll(".delete-cat").forEach(btn => btn.addEventListener("click", () => { let cat = btn.dataset.cat; categories = categories.filter(c => c !== cat); products = products.filter(p => p.category !== cat); saveData(); renderAdmin(); renderFilters?.(); renderProducts?.(); updateRecommendations?.(); }));
  }
  // Products table
  const tbody = document.getElementById("productTableBody");
  if (tbody) {
    tbody.innerHTML = products.map(p => `<tr class="border-b"><td class="p-2"><img src="${p.image}" class="w-12 h-12 object-cover rounded"></td><td>${p.name}</td><td>${p.category}</td><td>Rs.${p.price}</td><td>${p.salePrice ? "Rs."+p.salePrice : "-"}</td><td><button class="edit-product bg-blue-500 text-white px-2 py-1 rounded text-xs" data-id="${p.id}">Edit</button> <button class="delete-product bg-red-500 text-white px-2 py-1 rounded text-xs" data-id="${p.id}">Del</button></td></tr>`).join('');
    document.querySelectorAll(".delete-product").forEach(btn => btn.addEventListener("click", () => { let id = parseInt(btn.dataset.id); products = products.filter(p=>p.id!==id); saveData(); renderAdmin(); renderFilters?.(); renderProducts?.(); updateRecommendations?.(); }));
    document.querySelectorAll(".edit-product").forEach(btn => btn.addEventListener("click", () => { let id = parseInt(btn.dataset.id); let prod = products.find(p=>p.id===id); let newName = prompt("Name", prod.name); if(newName) prod.name = newName; let newPrice = prompt("Price", prod.price); if(newPrice) prod.price = parseInt(newPrice); let newSale = prompt("Sale price (or empty)", prod.salePrice||""); prod.salePrice = newSale ? parseInt(newSale) : null; let newCat = prompt("Category", prod.category); if(newCat && categories.includes(newCat)) prod.category = newCat; saveData(); renderAdmin(); renderFilters?.(); renderProducts?.(); updateRecommendations?.(); }));
  }
}
function addProduct() {
  let name = prompt("Product Name");
  if(!name) return;
  let price = parseInt(prompt("Price"));
  let category = prompt(`Category (${categories.join(", ")})`);
  if(!categories.includes(category)) { alert("Invalid category"); return; }
  let sale = prompt("Sale price (optional)");
  let img = prompt("Image URL", "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop");
  let newId = Date.now();
  products.push({ id: newId, name, price, salePrice: sale?parseInt(sale):null, category, image: img, featured: false });
  saveData();
  renderAdmin();
  renderFilters?.();
  renderProducts?.();
  updateRecommendations?.();
}
function addCategory() {
  let newCat = prompt("New category name (uppercase)");
  if(newCat && !categories.includes(newCat.toUpperCase())) categories.push(newCat.toUpperCase());
  saveData();
  renderAdmin();
  renderFilters?.();
}

// ========== GLOBAL INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", () => {
  // Dark mode
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) document.documentElement.classList.add("dark");
    themeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
    });
  }
  // Cart drawer
  const cartIcon = document.getElementById("cartIconBtn");
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  const closeCart = document.getElementById("closeCartBtn");
  if (cartIcon && drawer && overlay && closeCart) {
    cartIcon.addEventListener("click", () => { drawer.classList.remove("closed"); drawer.classList.add("open"); overlay.classList.remove("hidden"); });
    closeCart.addEventListener("click", () => { drawer.classList.add("closed"); drawer.classList.remove("open"); overlay.classList.add("hidden"); });
    overlay.addEventListener("click", () => { drawer.classList.add("closed"); drawer.classList.remove("open"); overlay.classList.add("hidden"); });
  }
  // Determine which page we're on
  const isStore = document.getElementById("productGrid") !== null;
  const isAdmin = document.getElementById("categoryChart") !== null;
  if (isStore) {
    renderFilters();
    renderProducts();
    updateRecommendations();
    const sortSelect = document.getElementById("sortSelect");
    const searchInput = document.getElementById("searchInput");
    if (sortSelect) sortSelect.addEventListener("change", (e) => { currentSort = e.target.value; renderProducts(); });
    if (searchInput) searchInput.addEventListener("input", (e) => { currentSearch = e.target.value; renderProducts(); updateRecommendations(); });
    updateCartUI();
    // GSAP animations
    gsap.from(".hero-video", { opacity: 0, duration: 1.5 });
    gsap.from("header", { y: -50, opacity: 0, duration: 0.8 });
  }
  if (isAdmin) {
    renderAdmin();
    document.getElementById("addCategoryBtn")?.addEventListener("click", addCategory);
    document.getElementById("addProductBtn")?.addEventListener("click", addProduct);
  }
});
