// Product data - loaded from API
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Format price in INR
function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

// Load products from DummyJSON API
async function loadProducts() {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) loadingElement.style.display = 'block';

  try {
    const response = await fetch('https://dummyjson.com/products?limit=20');
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    products = data.products.map(item => ({
      id: item.id,
      name: item.title,
      price: Math.round(item.price * 80), // Convert USD to INR
      image: item.thumbnail || '/images/placeholder.jpg',
      category: item.category,
      brand: item.brand,
      rating: item.rating
    }));
    
    renderProducts();
  } catch (error) {
    console.error("Failed to load products:", error);
    products = []; // Fallback to empty array
    renderProducts();
  } finally {
    if (loadingElement) loadingElement.style.display = 'none';
  }
}

// Render products to the page
function renderProducts() {
  const container = document.getElementById('products-container');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '<p class="no-products">No products available. Please check back later.</p>';
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="product">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <h3>${product.name}</h3>
      <p class="price">${formatPrice(product.price)}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    </div>
  `).join('');
}

/* ======================
   CART FUNCTIONALITY
   ====================== */

// Add item to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    cart.push(product);
    updateCart();
    showNotification(`${product.name} added to cart!`);
  }
}

// Update cart UI and storage
function updateCart() {
  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart counter
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = cart.length;
  }
  
  // Refresh cart modal if open
  if (document.getElementById('cart-modal').style.display === 'block') {
    showCart();
  }
}

// Show cart modal
function showCart() {
  const modal = document.getElementById('cart-modal');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  
  if (modal && cartItems && cartTotal) {
    // Calculate total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    // Render cart items
    cartItems.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" width="50">
        <div>
          <h4>${item.name}</h4>
          <p>${formatPrice(item.price)}</p>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${index})">×</button>
      </div>
    `).join('');
    
    // Update total
    cartTotal.textContent = formatPrice(total);
    modal.style.display = 'block';
  }
}

// Remove item from cart
function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    updateCart();
  }
}

// Close cart modal
function closeCart() {
  document.getElementById('cart-modal').style.display = 'none';
}

// Show notification
function showNotification(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('ShopPWA', { body: message });
  }
}

/* ======================
   INITIALIZATION
   ====================== */

document.addEventListener('DOMContentLoaded', () => {
  // Load products first
  loadProducts();
  
  // Initialize cart
  updateCart();
  
  // Set up event listeners
  document.getElementById('cart-button').addEventListener('click', showCart);
  document.getElementById('close-cart').addEventListener('click', closeCart);
  
  // Online/offline detection
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
});

function updateOnlineStatus() {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.style.display = navigator.onLine ? 'none' : 'block';
  }
}

// Make functions available globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.showCart = showCart;
window.closeCart = closeCart;