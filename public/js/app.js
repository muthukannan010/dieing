// TEXCOLOR ERP - Core Client side engine

// Global Toast Alerts
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = message;
  toast.style.display = 'block';
  
  if (type === 'success') {
    toast.style.borderLeftColor = 'var(--success)';
  } else if (type === 'danger') {
    toast.style.borderLeftColor = 'var(--danger)';
  } else if (type === 'warning') {
    toast.style.borderLeftColor = 'var(--warning)';
  } else {
    toast.style.borderLeftColor = 'var(--primary)';
  }

  setTimeout(() => { toast.style.display = 'none'; }, 4000);
}

// Dark Mode Toggler
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'success');
}

// Check saved Dark Mode preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

// Notification Drawer Controls
function toggleNotificationDrawer() {
  const drawer = document.getElementById('notificationDrawer');
  if (drawer) {
    drawer.classList.toggle('open');
  }
}

// Command Palette controls (Ctrl+K)
function openCommandPalette() {
  document.getElementById('commandPalette').style.display = 'flex';
  document.getElementById('paletteSearch').focus();
}

function closeCommandPalette() {
  document.getElementById('commandPalette').style.display = 'none';
}

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openCommandPalette();
  }
  if (e.key === 'Escape') {
    closeCommandPalette();
  }
});

// Hide command palette when clicking outside card
document.getElementById('commandPalette')?.addEventListener('click', (e) => {
  if (e.target.id === 'commandPalette') {
    closeCommandPalette();
  }
});

function searchCommands() {
  const query = document.getElementById('paletteSearch').value.toLowerCase();
  const items = document.querySelectorAll('.palette-item');
  items.forEach(item => {
    const text = item.innerText.toLowerCase();
    if (text.includes(query)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// ---------------------------------------------
// Document Init Routing
// ---------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  // Init Auth handlers
  initAuthForms();

  if (path === '/dashboard') {
    loadDashboardStats();
  } else if (path === '/customer-portal') {
    loadCustomerPortal();
  } else if (path === '/calc-weight') {
    initWeightCalculator();
  } else if (path === '/calc-chemical') {
    initChemicalCalculator();
  } else if (path === '/colors') {
    initColorMatchingSystem();
  } else if (path === '/recipes') {
    loadRecipes();
  } else if (path === '/inventory') {
    loadInventory();
  } else if (path === '/machines') {
    loadMachines();
  } else if (path === '/orders') {
    loadOrders();
  } else if (path === '/production') {
    loadProduction();
  }
});

// Authentication Forms
function initAuthForms() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const password = e.target.password.value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          setTimeout(() => {
            if (data.role === 'Customer') {
              window.location.href = '/customer-portal';
            } else {
              window.location.href = '/dashboard';
            }
          }, 800);
        } else {
          showToast(data.message, 'danger');
        }
      } catch (err) {
        showToast('Server connection failed.', 'danger');
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const email = e.target.email.value;
      const password = e.target.password.value;
      const role = e.target.role.value;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, role })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          setTimeout(() => window.location.href = '/login', 1200);
        } else {
          showToast(data.message, 'danger');
        }
      } catch (err) {
        showToast('Registration failed.', 'danger');
      }
    });
  }

  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
        } else {
          showToast(data.message, 'danger');
        }
      } catch (err) {
        showToast('Reset request failed.', 'danger');
      }
    });
  }
}

// ---------------------------------------------
// ERP Dashboard Stats and ApexCharts
// ---------------------------------------------
function animateDashboardCountUp(elementId, targetValue, isCurrency = false, isPercentage = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  const duration = 1200;
  const startTime = performance.now();
  
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = progress * (2 - progress);
    const current = targetValue * ease;
    
    if (isCurrency) {
      el.innerText = '₹' + Math.floor(current).toLocaleString('en-IN');
    } else if (isPercentage) {
      el.innerText = current.toFixed(1) + '%';
    } else {
      el.innerText = Math.floor(current).toLocaleString();
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (isCurrency) {
        el.innerText = '₹' + targetValue.toLocaleString('en-IN');
      } else if (isPercentage) {
        el.innerText = targetValue.toFixed(1) + '%';
      } else {
        el.innerText = targetValue.toLocaleString();
      }
    }
  }
  requestAnimationFrame(update);
}

async function loadDashboardStats() {
  try {
    const res = await fetch('/api/dashboard/stats');
    const response = await res.json();
    if (!response.success) return showToast('Failed to load stats', 'danger');

    const d = response.data;
    
    animateDashboardCountUp('kpi-orders', d.totalOrders);
    animateDashboardCountUp('kpi-batches', d.activeBatches);
    animateDashboardCountUp('kpi-revenue', d.totalRevenue, true);
    animateDashboardCountUp('kpi-efficiency', d.productionEfficiency, false, true);

    // Show Notification Alert Dot
    if (d.notifications.length > 0) {
      document.getElementById('notif-dot').style.display = 'block';
      const drawerList = document.getElementById('drawer-notifications-list');
      drawerList.innerHTML = '';
      d.notifications.forEach(n => {
        const div = document.createElement('div');
        div.style.padding = '10px';
        div.style.backgroundColor = 'rgba(76,175,80,0.05)';
        div.style.borderRadius = '4px';
        div.style.border = '1px solid var(--border-color)';
        div.innerHTML = `<span style="font-size: 0.85rem;">${n.message}</span>`;
        drawerList.appendChild(div);
      });
    }

    // Show Inventory Alerts
    const alertsBox = document.getElementById('inventory-alerts-list');
    if (d.lowStockAlerts > 0) {
      alertsBox.innerHTML = `
        <div style="background-color: rgba(213,0,0,0.05); padding: 15px; border-radius: var(--radius-sm); border: 1px solid var(--danger);">
          <strong style="color: var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock Warning</strong>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 5px;">There are currently ${d.lowStockAlerts} items below safety limits.</p>
          <a href="/inventory" class="btn btn-secondary" style="margin-top: 10px; padding: 6px 12px; font-size: 0.8rem;">Adjust Stock</a>
        </div>
      `;
    }

    // Render Recent Orders Table
    const recentBody = document.getElementById('recent-orders-list');
    recentBody.innerHTML = '';
    d.recentOrders.forEach(o => {
      recentBody.innerHTML += `
        <tr>
          <td><strong>${o.order_no}</strong></td>
          <td>${o.customer_name || 'N/A'}</td>
          <td>${o.fabric_type_name || 'N/A'}</td>
          <td>${o.color_name}</td>
          <td><strong>${o.quantity_kg.toLocaleString()} KG</strong></td>
          <td><span class="status-badge status-${getStatusClass(o.status)}">${o.status}</span></td>
        </tr>
      `;
    });

    // Render Fabric Bar Chart using ApexCharts
    const fabricLabels = d.fabricStats.map(f => f.label || 'Unknown');
    const fabricValues = d.fabricStats.map(f => f.value);
    
    const barOptions = {
      series: [{ name: 'Volume Processed', data: fabricValues }],
      chart: { type: 'bar', height: 260, toolbar: { show: false } },
      colors: ['#4CAF50'],
      plotOptions: { bar: { borderRadius: 4, horizontal: false } },
      dataLabels: { enabled: false },
      xaxis: { categories: fabricLabels }
    };
    new ApexCharts(document.querySelector("#fabricThroughputChart"), barOptions).render();

    // Render Machine Allocation Pie Chart
    const statusCounts = d.machineList.map(m => m.count);
    const statusLabels = d.machineList.map(m => m.status);

    const pieOptions = {
      series: statusCounts,
      chart: { type: 'donut', height: 260 },
      labels: statusLabels,
      colors: ['#00C853', '#00b0ff', '#FFB300', '#D50000'] // Available, Running, Maintenance, Offline
    };
    new ApexCharts(document.querySelector("#machineAllocationChart"), pieOptions).render();

  } catch (err) {
    console.error(err);
    showToast('Failed to connect to stats API.', 'danger');
  }
}

function getStatusClass(status) {
  if (status === 'Pending') return 'pending';
  if (status === 'Scheduled') return 'process';
  if (status === 'Dyeing') return 'dyeing';
  if (status === 'Washing') return 'process';
  if (status === 'Drying') return 'process';
  if (status === 'Quality Check') return 'qc';
  if (status === 'Completed') return 'completed';
  return 'delivered';
}

// ---------------------------------------------
// Fabric Sizing Weight Calculator
// ---------------------------------------------
function initWeightCalculator() {
  const form = document.getElementById('fabricCalcForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const gsm = e.target.gsm.value;
    const width = e.target.width.value;
    const length = e.target.length.value;

    try {
      const res = await fetch('/api/calculate/fabric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gsm, width, length })
      });
      const response = await res.json();
      if (response.success) {
        const d = response.data;
        document.getElementById('fabricResultPanel').style.opacity = '1';
        document.getElementById('res-weight').innerText = d.weight.toLocaleString() + ' KG';
        document.getElementById('res-water').innerText = d.waterRequirement.toLocaleString() + ' Liters';
        document.getElementById('res-dye').innerText = d.dyeRequirement.toFixed(3) + ' KG';
        document.getElementById('res-cost').innerText = '$' + d.processingCost.toLocaleString(undefined, { minimumFractionDigits: 2 });
        showToast('Weight dimensions calculated.', 'success');
      }
    } catch (err) {
      showToast('Calculation failed.', 'danger');
    }
  });
}

// ---------------------------------------------
// Chemical Calculator
// ---------------------------------------------
function initChemicalCalculator() {
  const form = document.getElementById('chemCalcForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const weight = e.target['chem-weight'].value;
    const chemicalType = e.target['chem-type'].value;

    try {
      const res = await fetch('/api/calculate/chemical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight, chemicalType })
      });
      const response = await res.json();
      if (response.success) {
        const d = response.data;
        document.getElementById('chemResultPanel').style.opacity = '1';
        document.getElementById('chem-res-qty').innerText = d.quantity.toFixed(2) + ' KG';
        document.getElementById('chem-res-cost').innerText = '$' + d.cost.toLocaleString(undefined, { minimumFractionDigits: 2 });
        document.getElementById('chem-res-instructions').innerText = d.instructions;
        showToast('Chemical dosage calculated.', 'success');
      }
    } catch (err) {
      showToast('Dosage calculations failed.', 'danger');
    }
  });
}

// ---------------------------------------------
// Color Matching System
// ---------------------------------------------
let presetColors = [];
async function initColorMatchingSystem() {
  try {
    const res = await fetch('/api/colors');
    const response = await res.json();
    if (response.success) {
      presetColors = response.data;
      const presetsDiv = document.getElementById('preset-shades-container');
      presetsDiv.innerHTML = '';
      presetColors.forEach(c => {
        presetsDiv.innerHTML += `
          <button class="btn btn-secondary" style="background-color: ${c.hex_code}; color: ${getContrastYIQ(c.hex_code)}; border: none;" onclick="updateColorMatches('${c.hex_code}')">
            ${c.name}
          </button>
        `;
      });
    }
  } catch (e) {
    console.error(e);
  }
}

async function updateColorMatches(hex) {
  if (hex.length !== 7 || !hex.startsWith('#')) return;
  document.getElementById('hexPicker').value = hex;
  document.getElementById('hexText').value = hex;
  
  const box = document.getElementById('livePreviewBox');
  box.style.backgroundColor = hex;
  box.style.color = getContrastYIQ(hex);
  box.innerText = hex;

  try {
    const res = await fetch(`/api/colors/match?hex=${encodeURIComponent(hex)}`);
    const response = await res.json();
    if (response.success) {
      const d = response.data;

      document.getElementById('swatch-complementary').style.backgroundColor = d.complementary;
      document.getElementById('val-complementary').innerText = d.complementary;

      document.getElementById('swatch-analogous1').style.backgroundColor = d.analogous[0];
      document.getElementById('val-analogous1').innerText = d.analogous[0];

      document.getElementById('swatch-analogous2').style.backgroundColor = d.analogous[1];
      document.getElementById('val-analogous2').innerText = d.analogous[1];

      document.getElementById('swatch-shade-light').style.backgroundColor = d.shades.light;
      document.getElementById('val-shade-light').innerText = d.shades.light;

      document.getElementById('swatch-shade-medium').style.backgroundColor = d.shades.medium;
      document.getElementById('val-shade-medium').innerText = d.shades.medium;

      document.getElementById('swatch-shade-dark').style.backgroundColor = d.shades.dark;
      document.getElementById('val-shade-dark').innerText = d.shades.dark;
    }
  } catch (err) {
    console.error(err);
  }
}

function getContrastYIQ(hexcolor){
  hexcolor = hexcolor.replace("#", "");
  if (hexcolor.length === 3) {
    hexcolor = hexcolor[0] + hexcolor[0] + hexcolor[1] + hexcolor[1] + hexcolor[2] + hexcolor[2];
  }
  var r = parseInt(hexcolor.substr(0,2),16);
  var g = parseInt(hexcolor.substr(2,2),16);
  var b = parseInt(hexcolor.substr(4,2),16);
  var yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
}

// ---------------------------------------------
// Dye Recipe Formulation catalog
// ---------------------------------------------
async function loadRecipes() {
  try {
    const res = await fetch('/api/recipes');
    const response = await res.json();
    if (!response.success) return;

    const body = document.getElementById('recipes-table-body');
    body.innerHTML = '';

    response.data.forEach(r => {
      body.innerHTML += `
        <tr>
          <td><strong>${r.name}</strong></td>
          <td>${r.color_name}</td>
          <td>${r.dye_percentage}%</td>
          <td>1:${r.water_ratio}</td>
          <td>${r.temperature}°C</td>
          <td>${r.duration} Mins</td>
          <td><span style="font-weight: 700; color: var(--primary);">V${r.version}</span></td>
          <td class="table-actions">
            <button class="action-btn btn-edit" onclick="editRecipe(${JSON.stringify(r).replace(/"/g, '&quot;')})" title="Edit Recipe"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="action-btn btn-edit" style="color: var(--success);" onclick="cloneRecipe(${r.id})" title="Clone Recipe"><i class="fa-regular fa-copy"></i></button>
            <button class="action-btn btn-delete" onclick="deleteRecipe(${r.id})" title="Delete Recipe"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        </tr>
      `;
    });

    // Initialize jQuery DataTable for nice searches
    $('#recipes-datatable').DataTable({ destroy: true, order: [[0, 'asc']] });
  } catch (err) {
    console.error(err);
  }
}

function openRecipeModal() {
  document.getElementById('recipeForm').reset();
  document.getElementById('recipe-id').value = '';
  document.getElementById('recipeModalTitle').innerText = 'Add Dye Formulation';
  document.getElementById('recipeModal').style.display = 'flex';
}

function closeRecipeModal() {
  document.getElementById('recipeModal').style.display = 'none';
}

function editRecipe(r) {
  document.getElementById('recipe-id').value = r.id;
  document.getElementById('rec-name').value = r.name;
  document.getElementById('rec-color').value = r.color_name;
  document.getElementById('rec-dye').value = r.dye_percentage;
  document.getElementById('rec-water').value = r.water_ratio;
  document.getElementById('rec-temp').value = r.temperature;
  document.getElementById('rec-duration').value = r.duration;
  document.getElementById('rec-formula').value = r.formula_details;

  document.getElementById('recipeModalTitle').innerText = 'Edit Recipe Formulation';
  document.getElementById('recipeModal').style.display = 'flex';
}

const recipeForm = document.getElementById('recipeForm');
recipeForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('recipe-id').value;
  const name = document.getElementById('rec-name').value;
  const color_name = document.getElementById('rec-color').value;
  const dye_percentage = document.getElementById('rec-dye').value;
  const water_ratio = document.getElementById('rec-water').value;
  const temperature = document.getElementById('rec-temp').value;
  const duration = document.getElementById('rec-duration').value;
  const formula_details = document.getElementById('rec-formula').value;

  const payload = { name, color_name, dye_percentage, water_ratio, temperature, duration, formula_details };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/recipes/${id}` : '/api/recipes';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      closeRecipeModal();
      loadRecipes();
    } else {
      showToast(data.message, 'danger');
    }
  } catch (err) {
    showToast('Failed to save recipe.', 'danger');
  }
});

async function cloneRecipe(id) {
  try {
    const res = await fetch(`/api/recipes/${id}/clone`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadRecipes();
    }
  } catch (err) {
    showToast('Clone failed.', 'danger');
  }
}

async function deleteRecipe(id) {
  if (!confirm('Are you sure you want to delete this recipe formulation?')) return;
  try {
    const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadRecipes();
    }
  } catch (err) {
    showToast('Delete failed.', 'danger');
  }
}

// ---------------------------------------------
// Warehouse Stock & Suppliers
// ---------------------------------------------
async function loadInventory() {
  try {
    const res = await fetch('/api/inventory');
    const response = await res.json();
    if (!response.success) return;

    const { items, suppliers } = response.data;
    
    // Load suppliers options into the modal selector dropdown
    const select = document.getElementById('inv-supplier');
    if (select) {
      select.innerHTML = '<option value="">-- Choose Supplier --</option>';
      suppliers.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
      });
    }

    const body = document.getElementById('inventory-table-body');
    body.innerHTML = '';

    items.forEach(i => {
      const isLow = i.quantity <= i.threshold;
      const warningClass = isLow ? 'style="color: var(--danger); font-weight:700;"' : '';
      body.innerHTML += `
        <tr>
          <td><strong>${i.item_name}</strong></td>
          <td>${i.item_type}</td>
          <td ${warningClass}>${i.quantity} ${i.unit}</td>
          <td>${i.threshold} ${i.unit}</td>
          <td>${i.supplier_name || 'Generic'}</td>
          <td>
            <div style="display: flex; gap: 5px;">
              <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="adjustStockLevel(${i.id}, 'inward')"><i class="fa-solid fa-plus"></i> Inward</button>
              <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; border-color: var(--warning); color: var(--warning);" onclick="adjustStockLevel(${i.id}, 'outward')"><i class="fa-solid fa-minus"></i> Outward</button>
            </div>
          </td>
          <td>
            <button class="action-btn btn-delete" onclick="deleteStockItem(${i.id})"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

function openInventoryModal() {
  document.getElementById('inventoryForm').reset();
  document.getElementById('inventoryModal').style.display = 'flex';
}

function closeInventoryModal() {
  document.getElementById('inventoryModal').style.display = 'none';
}

const inventoryForm = document.getElementById('inventoryForm');
inventoryForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const item_name = document.getElementById('inv-name').value;
  const item_type = document.getElementById('inv-type').value;
  const quantity = document.getElementById('inv-qty').value;
  const unit = document.getElementById('inv-unit').value;
  const threshold = document.getElementById('inv-threshold').value;
  const supplier_id = document.getElementById('inv-supplier').value;

  const payload = { item_name, item_type, quantity, unit, threshold, supplier_id };

  try {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      closeInventoryModal();
      loadInventory();
    }
  } catch (err) {
    showToast('Failed to add item.', 'danger');
  }
});

async function adjustStockLevel(id, adjustment_type) {
  const quantity = prompt('Enter adjustment quantity amount:');
  if (!quantity || isNaN(parseFloat(quantity))) return;

  try {
    const res = await fetch(`/api/inventory/${id}/adjust`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustment_type, quantity })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadInventory();
    }
  } catch (err) {
    showToast('Failed to adjust stock level.', 'danger');
  }
}

async function deleteStockItem(id) {
  if (!confirm('Are you sure you want to delete this stock item?')) return;
  try {
    const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadInventory();
    }
  } catch (err) {
    showToast('Failed to delete stock item.', 'danger');
  }
}

// Suppliers modal
function openSupplierModal() {
  document.getElementById('supplierForm').reset();
  document.getElementById('supplierModal').style.display = 'flex';
}

function closeSupplierModal() {
  document.getElementById('supplierModal').style.display = 'none';
}

const supplierForm = document.getElementById('supplierForm');
supplierForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('sup-name').value;
  const contact_person = document.getElementById('sup-contact').value;
  const phone = document.getElementById('sup-phone').value;
  const email = document.getElementById('sup-email').value;

  try {
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact_person, phone, email })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      closeSupplierModal();
      loadInventory();
    }
  } catch (err) {
    showToast('Failed to save supplier.', 'danger');
  }
});

// ---------------------------------------------
// Visual Machine Monitoring Dashboard
// ---------------------------------------------
async function loadMachines() {
  try {
    const res = await fetch('/api/machines');
    const response = await res.json();
    if (!response.success) return;

    const grid = document.getElementById('machines-grid-container');
    if (!grid) return;
    
    grid.innerHTML = '';

    response.data.forEach(m => {
      const statusClass = m.status.toLowerCase();
      
      grid.innerHTML += `
        <div class="machine-card ${statusClass}">
          <h4 style="color: var(--dark-green); font-family: 'Poppins', sans-serif;">${m.machine_code}</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 15px;">${m.name}</p>
          <div class="result-item">
            <span>Capacity Limit:</span>
            <strong>${m.capacity} KG</strong>
          </div>
          <div class="result-item" style="border: none; margin-bottom: 10px;">
            <span>Current State:</span>
            <span class="status-badge status-${statusClass}">${m.status}</span>
          </div>
          <div style="display: flex; gap: 5px;">
            <select class="form-field" style="padding: 6px; font-size: 0.8rem;" onchange="updateMachineStatus(${m.id}, this.value)">
              <option value="Available" ${m.status === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Running" ${m.status === 'Running' ? 'selected' : ''}>Running</option>
              <option value="Maintenance" ${m.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
              <option value="Offline" ${m.status === 'Offline' ? 'selected' : ''}>Offline</option>
            </select>
            <button class="action-btn btn-delete" style="color: var(--danger);" onclick="deleteMachine(${m.id})"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
      `;
    });
  } catch (e) {
    console.error(e);
  }
}

async function updateMachineStatus(id, status) {
  try {
    const res = await fetch(`/api/machines/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadMachines();
    }
  } catch (err) {
    showToast('Failed to update machine state.', 'danger');
  }
}

function openMachineModal() {
  document.getElementById('machineForm').reset();
  document.getElementById('machineModal').style.display = 'flex';
}

function closeMachineModal() {
  document.getElementById('machineModal').style.display = 'none';
}

const machineForm = document.getElementById('machineForm');
machineForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('mac-name').value;
  const machine_code = document.getElementById('mac-code').value;
  const capacity = document.getElementById('mac-capacity').value;
  const status = document.getElementById('mac-status').value;
  const maintenance_schedule = document.getElementById('mac-maintenance').value;

  try {
    const res = await fetch('/api/machines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, machine_code, capacity, status, maintenance_schedule })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      closeMachineModal();
      loadMachines();
    }
  } catch (err) {
    showToast('Failed to save machine.', 'danger');
  }
});

async function deleteMachine(id) {
  if (!confirm('Are you sure you want to remove this machine record?')) return;
  try {
    const res = await fetch(`/api/machines/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadMachines();
    }
  } catch (err) {
    showToast('Failed to delete machine.', 'danger');
  }
}

// ---------------------------------------------
// Orders Ledger with QRCode Tags
// ---------------------------------------------
async function loadOrders() {
  const search = document.getElementById('orderSearch')?.value || '';
  const status = document.getElementById('orderStatusFilter')?.value || '';

  try {
    const res = await fetch(`/api/orders?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`);
    const response = await res.json();
    if (!response.success) return;

    const { orders, customers, fabricTypes } = response.data;
    
    // Load select options
    const custSelect = document.getElementById('order-customer');
    if (custSelect) {
      custSelect.innerHTML = '<option value="">-- Choose Customer --</option>';
      customers.forEach(c => {
        custSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
    }

    const fabricSelect = document.getElementById('order-fabric');
    if (fabricSelect) {
      fabricSelect.innerHTML = '<option value="">-- Choose Fabric --</option>';
      fabricTypes.forEach(f => {
        fabricSelect.innerHTML += `<option value="${f.id}">${f.name}</option>`;
      });
    }

    const body = document.getElementById('orders-table-body');
    if (!body) return;

    body.innerHTML = '';
    orders.forEach(o => {
      let actionHTML = `
        <td class="table-actions">
          <button class="action-btn btn-edit" onclick="editOrder(${JSON.stringify(o).replace(/"/g, '&quot;')})" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="action-btn btn-delete" onclick="deleteOrder(${o.id})" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      `;

      body.innerHTML += `
        <tr>
          <td><strong>${o.order_no}</strong></td>
          <td>${o.customer_name || 'N/A'}</td>
          <td>${o.fabric_type_name || 'N/A'}</td>
          <td>${o.color_name}</td>
          <td><strong>${o.quantity_kg.toLocaleString()} KG</strong></td>
          <td><small>GSM: ${o.gsm} | W: ${o.width_inches}m</small></td>
          <td><span class="status-badge status-${getStatusClass(o.status)}">${o.status}</span></td>
          <td>${o.delivery_date}</td>
          <td>
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="generateRoutingTag('${o.order_no}')">
              <i class="fa-solid fa-qrcode"></i> Tag
            </button>
          </td>
          ${actionHTML}
        </tr>
      `;
    });

    $('#orders-datatable').DataTable({ destroy: true, order: [[0, 'desc']], searching: false, lengthChange: false });
  } catch (err) {
    console.error(err);
  }
}

function openOrderModal() {
  document.getElementById('orderForm').reset();
  document.getElementById('order-id').value = '';
  document.getElementById('orderModalTitle').innerText = 'Place Dyeing Order';
  document.getElementById('order-status-group').style.display = 'none';
  document.getElementById('orderModal').style.display = 'flex';
}

function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
}

function editOrder(o) {
  document.getElementById('order-id').value = o.id;
  document.getElementById('order-customer').value = o.customer_id;
  document.getElementById('order-fabric').value = o.fabric_type_id;
  document.getElementById('order-color').value = o.color_name;
  document.getElementById('order-qty').value = o.quantity_kg;
  document.getElementById('order-gsm').value = o.gsm;
  document.getElementById('order-width').value = o.width_inches;
  document.getElementById('order-length').value = o.length_meters;
  document.getElementById('order-dye-type').value = o.dye_type;
  document.getElementById('order-status').value = o.status;
  document.getElementById('order-delivery').value = o.delivery_date;

  document.getElementById('orderModalTitle').innerText = 'Edit Order Details';
  document.getElementById('order-status-group').style.display = 'block';
  document.getElementById('orderModal').style.display = 'flex';
}

const orderForm = document.getElementById('orderForm');
orderForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('order-id').value;
  const customer_id = document.getElementById('order-customer').value;
  const fabric_type_id = document.getElementById('order-fabric').value;
  const color_name = document.getElementById('order-color').value;
  const quantity_kg = document.getElementById('order-qty').value;
  const gsm = document.getElementById('order-gsm').value;
  const width_inches = document.getElementById('order-width').value;
  const length_meters = document.getElementById('order-length').value;
  const dye_type = document.getElementById('order-dye-type').value;
  const status = document.getElementById('order-status').value || 'Pending';
  const delivery_date = document.getElementById('order-delivery').value;

  const payload = { customer_id, fabric_type_id, color_name, quantity_kg, gsm, width_inches, length_meters, dye_type, status, delivery_date };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/orders/${id}` : '/api/orders';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      closeOrderModal();
      loadOrders();
    }
  } catch (err) {
    showToast('Failed to save order.', 'danger');
  }
});

async function deleteOrder(id) {
  if (!confirm('Are you sure you want to delete this order?')) return;
  try {
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadOrders();
    }
  } catch (err) {
    showToast('Failed to delete order.', 'danger');
  }
}

// QR Code Labels Generation
function generateRoutingTag(orderNo) {
  const container = document.getElementById('qrcode-container');
  container.innerHTML = '';
  
  new QRCode(container, {
    text: `TEXCOLOR-ROUTING-TAG:${orderNo}`,
    width: 150,
    height: 150,
    colorDark : "#1B1B1B",
    colorLight : "#F5FFF5",
    correctLevel : QRCode.CorrectLevel.H
  });

  document.getElementById('qrModalText').innerText = `Batch Routing Tag for order ${orderNo}. Print and attach to fabric roll before pre-treatment.`;
  document.getElementById('qrModal').style.display = 'flex';
}

function closeQrModal() {
  document.getElementById('qrModal').style.display = 'none';
}

// ---------------------------------------------
// Floor Scheduler Batch Scheduling
// ---------------------------------------------
async function loadProduction() {
  try {
    const res = await fetch('/api/batches');
    const response = await res.json();
    if (!response.success) return;

    const { batches, orders, machines, recipes } = response.data;

    // Load schedule selections
    const ordSelect = document.getElementById('batch-order');
    if (ordSelect) {
      ordSelect.innerHTML = '<option value="">-- Choose Order --</option>';
      orders.forEach(o => {
        ordSelect.innerHTML += `<option value="${o.id}">${o.order_no} (${o.quantity_kg} KG)</option>`;
      });
    }

    const macSelect = document.getElementById('batch-machine');
    if (macSelect) {
      macSelect.innerHTML = '<option value="">-- Choose Vessel --</option>';
      machines.forEach(m => {
        macSelect.innerHTML += `<option value="${m.id}">${m.name} (${m.capacity} KG)</option>`;
      });
    }

    const recSelect = document.getElementById('batch-recipe');
    if (recSelect) {
      recSelect.innerHTML = '<option value="">-- Choose Recipe --</option>';
      recipes.forEach(r => {
        recSelect.innerHTML += `<option value="${r.id}">${r.name}</option>`;
      });
    }

    const body = document.getElementById('batches-table-body');
    if (!body) return;

    body.innerHTML = '';
    batches.forEach(b => {
      const formattedStart = b.started_at ? b.started_at.replace('T', ' ') : 'N/A';
      const formattedEnd = b.completed_at ? b.completed_at.replace('T', ' ') : '-';
      
      body.innerHTML += `
        <tr>
          <td><strong>${b.batch_no}</strong></td>
          <td>${b.order_no || 'N/A'}</td>
          <td>${b.machine_name || 'N/A'}</td>
          <td>${b.operator_name}</td>
          <td>${b.recipe_name || 'N/A'}</td>
          <td>${formattedStart}</td>
          <td>${formattedEnd}</td>
          <td><span class="status-badge status-${getStatusClass(b.status)}">${b.status}</span></td>
          <td>
            <div style="display: flex; gap: 5px;">
              <select class="form-field" style="padding: 5px 8px; font-size: 0.8rem; width: auto;" onchange="updateBatchStatus(${b.id}, this.value)">
                <option value="In Process" ${b.status === 'In Process' ? 'selected' : ''}>In Process</option>
                <option value="Dyeing" ${b.status === 'Dyeing' ? 'selected' : ''}>Dyeing</option>
                <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
              <button class="action-btn btn-delete" style="color: var(--danger);" onclick="deleteBatch(${b.id})"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </td>
        </tr>
      `;
    });

    $('#batches-datatable').DataTable({ destroy: true, order: [[0, 'desc']], searching: false, lengthChange: false });
  } catch (err) {
    console.error(err);
  }
}

function openBatchModal() {
  document.getElementById('batchForm').reset();
  document.getElementById('batchModal').style.display = 'flex';
}

function closeBatchModal() {
  document.getElementById('batchModal').style.display = 'none';
}

const batchForm = document.getElementById('batchForm');
batchForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const order_id = document.getElementById('batch-order').value;
  const machine_id = document.getElementById('batch-machine').value;
  const recipe_id = document.getElementById('batch-recipe').value;
  const operator_name = document.getElementById('batch-operator').value;

  try {
    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id, machine_id, recipe_id, operator_name })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      closeBatchModal();
      loadProduction();
    }
  } catch (err) {
    showToast('Failed to schedule batch.', 'danger');
  }
});

async function updateBatchStatus(id, status) {
  try {
    const res = await fetch(`/api/batches/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadProduction();
    }
  } catch (err) {
    showToast('Failed to update batch status.', 'danger');
  }
}

async function deleteBatch(id) {
  if (!confirm('Are you sure you want to stop tracking this production batch?')) return;
  try {
    const res = await fetch(`/api/batches/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadProduction();
    }
  } catch (err) {
    showToast('Failed to delete batch.', 'danger');
  }
}

// ---------------------------------------------
// Customer Portal Engine
// ---------------------------------------------
async function loadCustomerPortal() {
  try {
    const res = await fetch('/api/orders');
    const response = await res.json();
    if (!response.success) return;

    const { orders, fabricTypes } = response.data;
    
    // Load Customer Orders
    const body = document.getElementById('customer-orders-body');
    body.innerHTML = '';

    if (orders.length === 0) {
      body.innerHTML = '<tr><td colspan="7" style="text-align: center;">No orders logged yet. Place one above!</td></tr>';
    } else {
      orders.forEach(o => {
        body.innerHTML += `
          <tr>
            <td><strong>${o.order_no}</strong></td>
            <td>${o.fabric_type_name || 'N/A'}</td>
            <td>${o.color_name}</td>
            <td><strong>${o.quantity_kg.toLocaleString()} KG</strong></td>
            <td>${o.delivery_date}</td>
            <td><span class="status-badge status-${getStatusClass(o.status)}">${o.status}</span></td>
            <td>
              <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="generateRoutingTag('${o.order_no}')">
                <i class="fa-solid fa-qrcode"></i> Tag
              </button>
            </td>
          </tr>
        `;
      });
    }

    // Load Customer Form fabric types options
    const fSelect = document.getElementById('cust-fabric');
    fSelect.innerHTML = '<option value="">-- Choose Fabric --</option>';
    fabricTypes.forEach(f => {
      fSelect.innerHTML += `<option value="${f.id}">${f.name}</option>`;
    });

  } catch (e) {
    console.error(e);
  }
}

const customerOrderForm = document.getElementById('customerOrderForm');
customerOrderForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  // Assume customer places order for themselves. The backend will assign customer_id from profile context.
  const fabric_type_id = document.getElementById('cust-fabric').value;
  const color_name = document.getElementById('cust-color').value;
  const quantity_kg = document.getElementById('cust-qty').value;
  const gsm = document.getElementById('cust-gsm').value;
  const width_inches = document.getElementById('cust-width').value;
  const length_meters = document.getElementById('cust-length').value;
  const dye_type = document.getElementById('cust-dye').value;
  const delivery_date = document.getElementById('cust-delivery').value;

  // We fetch customer id. For mock simplification, select first customer ID (1) or bind from session
  const payload = { customer_id: 1, fabric_type_id, color_name, quantity_kg, gsm, width_inches, length_meters, dye_type, delivery_date };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      customerOrderForm.reset();
      loadCustomerPortal();
    }
  } catch (err) {
    showToast('Failed to log order.', 'danger');
  }
});

// ---------------------------------------------
// Dynamic Reports and Exporters (PDF & Excel)
// ---------------------------------------------
let activeReportType = '';
let activeReportData = null;

async function loadReport(type) {
  activeReportType = type;
  try {
    const res = await fetch(`/api/reports?type=${type}`);
    const response = await res.json();
    if (!response.success) return showToast('Failed to compile report.', 'danger');

    activeReportData = response.data;
    const { title, summary, totalOrders, completedOrders, totalFabricWeight, tableData } = activeReportData;

    document.getElementById('report-view-panel').style.display = 'block';
    document.getElementById('report-rendered-title').innerText = title;
    document.getElementById('report-rendered-summary').innerText = summary;
    document.getElementById('rep-kpi-orders').innerText = totalOrders;
    document.getElementById('rep-kpi-completed').innerText = completedOrders;
    document.getElementById('rep-kpi-volume').innerText = Math.round(totalFabricWeight).toLocaleString() + ' KG';

    const thMetric = document.getElementById('th-metric');
    const thDetails = document.getElementById('th-details');
    const thVol = document.getElementById('th-vol');
    const thFinancial = document.getElementById('th-financial');

    // Headers config
    if (type === 'chemical') {
      thMetric.innerText = 'Chemical Name';
      thDetails.innerText = 'Process Application';
      thVol.innerText = 'Usage Volume';
      thFinancial.innerText = 'Estimated Expense';
    } else if (type === 'revenue') {
      thMetric.innerText = 'Fabric Category';
      thDetails.innerText = 'Volume Processed';
      thVol.innerText = 'Gross Billings';
      thFinancial.innerText = 'Estimated Net Profit';
    } else if (type === 'production') {
      thMetric.innerText = 'Vessel Code';
      thDetails.innerText = 'Chamber Name';
      thVol.innerText = 'Capacity Limit';
      thFinancial.innerText = 'Current State';
    } else if (type === 'inventory') {
      thMetric.innerText = 'Item Name';
      thDetails.innerText = 'Category';
      thVol.innerText = 'Current Balance';
      thFinancial.innerText = 'Safety Alert';
    } else {
      thMetric.innerText = 'Job Status Phase';
      thDetails.innerText = 'Active Batches';
      thVol.innerText = 'Load Weights (KG)';
      thFinancial.innerText = 'Tracking Type';
    }

    const tbody = document.getElementById('report-table-body');
    tbody.innerHTML = '';
    
    tableData.forEach(row => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${row.metric}</strong></td>
          <td>${row.details}</td>
          <td><strong>${row.volume}</strong></td>
          <td><span class="status-badge status-completed" style="background-color: var(--primary-light); color: var(--dark-green);">${row.financial}</span></td>
        </tr>
      `;
    });

    showToast('Report generated successfully!', 'success');
  } catch (err) {
    showToast('Reports compilation request failed.', 'danger');
  }
}

// PDF Exporter (jsPDF + jsPDF-AutoTable CDNs loaded in header)
function exportReportToPDF() {
  if (!activeReportData) return showToast('Please select a report first.', 'warning');
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("TEXCOLOR ERP - Enterprise System", 14, 20);

  doc.setFontSize(12);
  doc.setFont("Helvetica", "normal");
  doc.text(activeReportData.title, 14, 28);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Metrics: ${activeReportData.summary}`, 14, 34);

  const headers = [
    [
      document.getElementById('th-metric').innerText,
      document.getElementById('th-details').innerText,
      document.getElementById('th-vol').innerText,
      document.getElementById('th-financial').innerText
    ]
  ];

  const rows = activeReportData.tableData.map(r => [r.metric, r.details, r.volume, r.financial]);

  doc.autoTable({
    startY: 42,
    head: headers,
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80] }
  });

  doc.save(`texcolor_report_${activeReportType}_${Date.now()}.pdf`);
  showToast('PDF Report downloaded.', 'success');
}

// Excel Exporter (ExcelJS CDN loaded in header)
async function exportReportToExcel() {
  if (!activeReportData) return showToast('Please select a report first.', 'warning');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(activeReportType);

  worksheet.columns = [
    { header: document.getElementById('th-metric').innerText, key: 'metric', width: 25 },
    { header: document.getElementById('th-details').innerText, key: 'details', width: 30 },
    { header: document.getElementById('th-vol').innerText, key: 'volume', width: 20 },
    { header: document.getElementById('th-financial').innerText, key: 'financial', width: 25 }
  ];

  activeReportData.tableData.forEach(r => {
    worksheet.addRow({
      metric: r.metric,
      details: r.details,
      volume: r.volume,
      financial: r.financial
    });
  });

  // Style Header Row
  worksheet.getRow(1).font = { bold: true };
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `texcolor_report_${activeReportType}_${Date.now()}.xlsx`;
  link.click();
  
  showToast('Excel spreadsheet downloaded.', 'success');
}
