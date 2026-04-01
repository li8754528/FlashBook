const API = '';

let currentPage = 1;
let charts = {};
let categories = [];
let editingBill = null;
let deletingBillId = null;

document.addEventListener('DOMContentLoaded', () => {
  initStatsFilters();
  initTabs();
  loadOverview();
  loadCategories();
  loadDailyChart();
  loadCategoryChart();
  loadBills();
});

function initStatsFilters() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  
  const yearSelect = document.getElementById('statsYear');
  for (let y = currentYear; y >= currentYear - 5; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = `${y}年`;
    yearSelect.appendChild(opt);
  }
  yearSelect.value = currentYear;
  
  document.getElementById('statsMonth').value = currentMonth;
  document.getElementById('filterMonth').value = `${currentYear}-${currentMonth}`;
}

function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.${tab.dataset.tab}-section`).classList.add('active');
    });
  });
  document.querySelector('.charts-section').classList.add('active');
}

async function loadOverview() {
  try {
    const res = await fetch(`${API}/api/reports/overview`);
    const { data } = await res.json();
    document.getElementById('todayTotal').textContent = `¥${data.today.toFixed(2)}`;
    document.getElementById('monthTotal').textContent = `¥${data.month.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `¥${data.totalAmount.toFixed(2)}`;
  } catch (e) {
    console.error('加载概览失败:', e);
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API}/api/categories`);
    const { data } = await res.json();
    categories = data;
    
    const select = document.getElementById('filterCategory');
    select.innerHTML = '<option value="">全部分类</option>';
    data.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.icon} ${cat.name}`;
      select.appendChild(opt);
    });
    
    const editSelect = document.getElementById('editCategory');
    editSelect.innerHTML = '<option value="">请选择</option>';
    data.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.icon} ${cat.name}`;
      editSelect.appendChild(opt);
    });
  } catch (e) {
    console.error('加载分类失败:', e);
  }
}

async function loadDailyChart() {
  try {
    const year = document.getElementById('statsYear').value;
    const month = document.getElementById('statsMonth').value;
    
    const ctx = document.getElementById('dailyChart').getContext('2d');
    if (charts.daily) charts.daily.destroy();
    
    if (month) {
      const res = await fetch(`${API}/api/reports/daily?year=${year}&month=${month}`);
      const { data } = await res.json();
      
      document.getElementById('dailyChartTitle').textContent = `${year}年${parseInt(month)}月每日消费`;
      
      charts.daily = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.date.substring(5)),
          datasets: [{
            label: '消费金额',
            data: data.map(d => d.total),
            backgroundColor: 'rgba(102, 126, 234, 0.7)',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, title: { display: true, text: '金额(元)' } } }
        }
      });
    } else {
      const res = await fetch(`${API}/api/reports/monthly?year=${year}`);
      const { data } = await res.json();
      
      document.getElementById('dailyChartTitle').textContent = `${year}年每月消费`;
      
      const monthLabels = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
      const monthData = Array(12).fill(0);
      data.forEach(d => { monthData[parseInt(d.month) - 1] = d.total; });
      
      charts.daily = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthLabels,
          datasets: [{
            label: '消费金额',
            data: monthData,
            backgroundColor: 'rgba(102, 126, 234, 0.7)',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, title: { display: true, text: '金额(元)' } } }
        }
      });
    }
  } catch (e) {
    console.error('加载图表失败:', e);
  }
}

async function loadCategoryChart() {
  try {
    const year = document.getElementById('statsYear').value;
    const month = document.getElementById('statsMonth').value;
    let url = `${API}/api/reports/by-category`;
    
    if (month) {
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
      url += `?startDate=${startDate}&endDate=${endDate}`;
    } else {
      url += `?startDate=${year}-01-01&endDate=${year}-12-31`;
    }
    
    const res = await fetch(url);
    const { data } = await res.json();
    
    const ctx = document.getElementById('categoryChart').getContext('2d');
    if (charts.category) charts.category.destroy();
    
    charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.category_name || '未分类'),
        datasets: [{
          data: data.map(d => d.total),
          backgroundColor: data.map(d => d.category_color || '#999')
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'right' } }
      }
    });
  } catch (e) {
    console.error('加载分类图表失败:', e);
  }
}

async function loadBills() {
  try {
    const month = document.getElementById('filterMonth').value;
    const categoryId = document.getElementById('filterCategory').value;
    
    let url = `${API}/api/bills?page=${currentPage}&limit=20`;
    if (month) {
      const [y, m] = month.split('-');
      const startDate = `${y}-${m}-01`;
      const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
      const endDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    if (categoryId) url += `&categoryId=${categoryId}`;
    
    const res = await fetch(url);
    const { data, total, pages } = await res.json();
    
    const list = document.getElementById('billsList');
    list.innerHTML = data.length === 0 ? '<p style="text-align:center;color:#999">暂无账单记录</p>' : '';
    
    data.forEach(bill => {
      const item = document.createElement('div');
      item.className = 'bill-item';
      item.dataset.id = bill.id;
      item.innerHTML = `
        <div class="bill-actions">
          <button class="bill-action-btn btn-edit" onclick="openEditModal(${bill.id})">
            <span class="icon">✏️</span>
            <span>修改</span>
          </button>
          <button class="bill-action-btn btn-delete" onclick="openDeleteModal(${bill.id}, '${bill.description || bill.merchant || '未知消费'}', ${bill.amount})">
            <span class="icon">🗑️</span>
            <span>删除</span>
          </button>
        </div>
        <div class="bill-item-inner">
          <div class="bill-icon" style="background:${bill.category_color || '#eee'}20">
            ${bill.category_icon || '📝'}
          </div>
          <div class="bill-info">
            <div class="bill-desc">${bill.description || bill.merchant || '未知消费'}</div>
            <div class="bill-meta">${bill.transaction_date}${bill.merchant ? ' · ' + bill.merchant : ''}${bill.payment_method ? ' · ' + bill.payment_method : ''}</div>
          </div>
          <div class="bill-amount">¥${bill.amount.toFixed(2)}</div>
        </div>
      `;
      
      let startX = 0;
      let isDragging = false;
      
      // 关闭其他已滑开的项
      function closeOthers() {
        document.querySelectorAll('.bill-item.swiped').forEach(el => {
          if (el !== item) el.classList.remove('swiped');
        });
      }
      
      // 触摸事件
      item.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      }, { passive: true });
      
      item.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        
        if (diffX > 50) {
          closeOthers();
          item.classList.add('swiped');
        } else if (diffX < -50) {
          item.classList.remove('swiped');
        }
      }, { passive: true });
      
      // 鼠标拖拽事件
      item.addEventListener('mousedown', (e) => {
        if (e.target.closest('.bill-action-btn')) return;
        startX = e.clientX;
        isDragging = true;
      });
      
      item.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const diffX = startX - e.clientX;
        
        if (diffX > 30) {
          closeOthers();
          item.classList.add('swiped');
          isDragging = false;
        } else if (diffX < -30) {
          item.classList.remove('swiped');
          isDragging = false;
        }
      });
      
      item.addEventListener('mouseup', () => { isDragging = false; });
      item.addEventListener('mouseleave', () => { isDragging = false; });
      
      list.appendChild(item);
    });
    
    renderPagination(pages);
  } catch (e) {
    console.error('加载账单失败:', e);
  }
}

function renderPagination(pages) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = `
    <button ${currentPage <= 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">上一页</button>
    <span>第${currentPage}页/共${pages}页</span>
    <button ${currentPage >= pages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">下一页</button>
  `;
}

function changePage(page) {
  currentPage = page;
  loadBills();
}

// 编辑弹窗
async function openEditModal(id) {
  try {
    const res = await fetch(`${API}/api/bills/${id}`);
    const { data } = await res.json();
    editingBill = data;
    
    document.getElementById('editId').value = data.id;
    document.getElementById('editAmount').value = data.amount;
    document.getElementById('editDate').value = data.transaction_date;
    document.getElementById('editCategory').value = data.category_id || '';
    document.getElementById('editDescription').value = data.description || '';
    document.getElementById('editMerchant').value = data.merchant || '';
    document.getElementById('editLocation').value = data.location || '';
    document.getElementById('editPayment').value = data.payment_method || '';
    
    document.getElementById('editModal').classList.add('active');
  } catch (e) {
    console.error('加载账单详情失败:', e);
  }
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
  editingBill = null;
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('editId').value;
  const data = {
    amount: parseFloat(document.getElementById('editAmount').value),
    transaction_date: document.getElementById('editDate').value,
    category_id: document.getElementById('editCategory').value || null,
    description: document.getElementById('editDescription').value,
    merchant: document.getElementById('editMerchant').value,
    location: document.getElementById('editLocation').value,
    payment_method: document.getElementById('editPayment').value
  };
  
  try {
    await fetch(`${API}/api/bills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    closeEditModal();
    loadBills();
    loadOverview();
    loadDailyChart();
    loadCategoryChart();
  } catch (e) {
    console.error('更新失败:', e);
  }
});

// 删除弹窗
function openDeleteModal(id, desc, amount) {
  deletingBillId = id;
  document.getElementById('deleteInfo').textContent = `${desc} - ¥${amount.toFixed(2)}`;
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  deletingBillId = null;
}

document.getElementById('confirmDelete').addEventListener('click', async () => {
  if (!deletingBillId) return;
  
  try {
    await fetch(`${API}/api/bills/${deletingBillId}`, { method: 'DELETE' });
    closeDeleteModal();
    loadBills();
    loadOverview();
    loadDailyChart();
    loadCategoryChart();
  } catch (e) {
    console.error('删除失败:', e);
  }
});

// 点击弹窗外部关闭
document.getElementById('editModal').addEventListener('click', (e) => {
  if (e.target.id === 'editModal') closeEditModal();
});

document.getElementById('deleteModal').addEventListener('click', (e) => {
  if (e.target.id === 'deleteModal') closeDeleteModal();
});

// 事件监听
document.getElementById('statsYear').addEventListener('change', () => { loadDailyChart(); loadCategoryChart(); });
document.getElementById('statsMonth').addEventListener('change', () => { loadDailyChart(); loadCategoryChart(); });
document.getElementById('filterMonth').addEventListener('change', () => { currentPage = 1; loadBills(); });
document.getElementById('filterCategory').addEventListener('change', () => { currentPage = 1; loadBills(); });
