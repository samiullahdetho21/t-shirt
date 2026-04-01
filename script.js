// script.js – Shared data and functions
let categories = ["ACTIVEWEAR", "BASICS", "GRAPHICS", "PRINTED"];
let products = [
  { id: 1, name: "Micro Zig Zag", price: 2499, salePrice: 1999, category: "GRAPHICS", image: "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: true },
  { id: 2, name: "Texture Tee", price: 2299, salePrice: 1839, category: "BASICS", image: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: true },
  { id: 3, name: "Crew Neck Essential", price: 2490, salePrice: null, category: "BASICS", image: "https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: true },
  { id: 4, name: "Batman Graphic", price: 5000, salePrice: 2480, category: "GRAPHICS", image: "https://images.pexels.com/photos/5698420/pexels-photo-5698420.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: false },
  { id: 5, name: "Oversized Chrome", price: 3990, salePrice: 2990, category: "ACTIVEWEAR", image: "https://images.pexels.com/photos/1648750/pexels-photo-1648750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: true },
  { id: 6, name: "Printed Flora", price: 1890, salePrice: null, category: "PRINTED", image: "https://images.pexels.com/photos/2895198/pexels-photo-2895198.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop", featured: false }
];
let cart = [];

// Load/Save data from localStorage
function loadData() {
  const storedCats = localStorage.getItem("tstore_categories");
  const storedProds = localStorage.getItem("tstore_products");
  if (storedCats) categories = JSON.parse(storedCats);
  if (storedProds) products = JSON.parse(storedProds);
  const storedCart = localStorage.getItem("tstore_cart");
  if (storedCart) cart = JSON.parse(storedCart);
}
function saveData() {
  localStorage.setItem("tstore_categories", JSON.stringify(categories));
  localStorage.setItem("tstore_products", JSON.stringify(products));
  localStorage.setItem("tstore_cart", JSON.stringify(cart));
}
loadData();

// Helper: get final price
function getFinalPrice(p) { return p.salePrice ? p.salePrice : p.price; }

// Cart functions
function updateCartUI() {
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.getElementById("cartCount") && (document.getElementById("cartCount").innerText = totalItems);
  const totalPrice = cart.reduce((sum, i) => sum + (getFinalPrice(i) * i.quantity), 0);
  document.getElementById("cartTotalAmount") && (document.getElementById("cartTotalAmount").innerText = `Rs. ${totalPrice.toLocaleString()}`);
  const container = document.getElementById("cartItemsList");
  if (container) {
    if (cart.length === 0) container.innerHTML = "<div class='text-center text-gray-500'>Cart is empty</div>";
    else {
      container.innerHTML = cart.map(item => `
        <div class="flex gap-3 border-b pb-3" data-id="${item.id}">
          <img src="${item.image}" class="w-16 h-20 object-cover rounded">
          <div class="flex-1">
            <div class="font-bold">${item.name}</div>
            <div>Rs. ${getFinalPrice(item)}</div>
            <div class="flex gap-2 mt-1">
              <button class="cart-qty-dec" data-id="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button class="cart-qty-inc" data-id="${item.id}">+</button>
              <button class="cart-remove text-red-500 ml-2" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      `).join('');
      // attach events
      document.querySelectorAll(".cart-qty-inc").forEach(btn => btn.addEventListener("click", () => { let id = parseInt(btn.dataset.id); let item = cart.find(i=>i.id===id); if(item){item.quantity++; updateCartUI(); saveData(); renderProducts?.(); updateRecommendations?.(); } }));
      document.querySelectorAll(".cart-qty-dec").forEach(btn => btn.addEventListener("click", () => { let id = parseInt(btn.dataset.id); let item = cart.find(i=>i.id===id); if(item && item.quantity>1){item.quantity--;} else if(item && item.quantity===1){ cart = cart.filter(i=>i.id!==id);} updateCartUI(); saveData(); renderProducts?.(); updateRecommendations?.(); }));
      document.querySelectorAll(".cart-remove").forEach(btn => btn.addEventListener("click", () => { let id = parseInt(btn.dataset.id); cart = cart.filter(i=>i.id!==id); updateCartUI(); saveData(); renderProducts?.(); updateRecommendations?.(); }));
    }
  }
}
function addToCart(id) {
  let product = products.find(p => p.id === id);
  if (!product) return;
  let existing = cart.find(item => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });
  updateCartUI();
  saveData();
  if (typeof renderProducts === "function") renderProducts();
  if (typeof updateRecommendations === "function") updateRecommendations();
}

// ========== STORE PAGE FUNCTIONS ==========
let currentFilter = "all";
let currentSort = "featured";
let currentSearch = "";

function renderFilters() {
  const container = document.getElementById("categoryFilterList");
  if (!container) return;
  container.innerHTML = `<button data-cat="all" class="filter-btn ${currentFilter === "all" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-200 dark:bg-gray-800"} px-5 py-2 rounded-full text-sm font-semibold">ALL</button>` +
    categories.map(cat => `<button data-cat="${cat}" class="filter-btn ${currentFilter === cat ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-200 dark:bg-gray-800"} px-5 py-2 rounded-full text-sm font-semibold">${cat}</button>`).join('');
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.cat;
      renderFilters();
      renderProducts();
      updateRecommendations();
    });
  });
}

function getFilteredProducts() {
  let filtered = products.filter(p => {
    if (currentFilter !== "all" && p.category !== currentFilter) return false;
    if (currentSearch && !p.name.toLowerCase().includes(currentSearch.toLowerCase())) return false;
    return true;
  });
  if (currentSort === "price_asc") filtered.sort((a,b) => getFinalPrice(a) - getFinalPrice(b));
  else if (currentSort === "price_desc") filtered.sort((a,b) => getFinalPrice(b) - getFinalPrice(a));
  else filtered.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return filtered;
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
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
