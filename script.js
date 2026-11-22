/**
 * VJA Imóveis - Dynamic Liquid Glass Catalog & Owner Property Management
 */

document.addEventListener('DOMContentLoaded', () => {
  // ========================================================================
  // 1. Mobile Menu Toggle & Smooth Scroll
  // ========================================================================
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // ========================================================================
  // 2. Dynamic Specular Light & 3D Tilt Effects
  // ========================================================================
  function bindDynamicEffects() {
    const cards = document.querySelectorAll('.liquid-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    });

    const tiltCards = document.querySelectorAll('[data-tilt]');
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = -(y / (rect.height / 2)) * 5;
        const rotateY = (x / (rect.width / 2)) * 5;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // ========================================================================
  // 3. Properties State Management (Default JSON + LocalStorage)
  // ========================================================================
  let allProperties = [];
  let activeFilter = 'all';
  let searchTerm = '';

  const lancamentosGrid = document.getElementById('lancamentosGrid');
  const noResults = document.getElementById('noResults');

  // Human-readable labels for categories
  const categoryLabels = {
    'zona-norte': 'Zona Norte',
    'zona-sul': 'Zona Sul',
    'zona-leste': 'Zona Leste',
    'zona-oeste': 'Zona Oeste',
    'centro-paulista': 'Centro & Paulista',
    'barueri': 'Barueri',
    'osasco': 'Osasco'
  };

  async function initProperties() {
    try {
      // 1. Fetch base properties from properties.json
      const res = await fetch('properties.json');
      const baseProperties = await res.json();

      // 2. Check for locally added/modified properties in localStorage
      const localCustom = JSON.parse(localStorage.getItem('vja_custom_properties') || '[]');
      const deletedIds = JSON.parse(localStorage.getItem('vja_deleted_properties') || '[]');

      // Merge base with custom, filtering out any deleted IDs
      const combined = [...baseProperties, ...localCustom].filter(p => !deletedIds.includes(p.id));

      allProperties = combined;
      renderProperties();
      updateCategoryCounts();
      renderManageList();
    } catch (err) {
      console.error('Erro ao carregar catálogo de imóveis:', err);
    }
  }

  // Render properties to grid
  function renderProperties() {
    if (!lancamentosGrid) return;

    lancamentosGrid.innerHTML = '';

    const filtered = allProperties.filter(prop => {
      const matchesCategory = (activeFilter === 'all' || prop.category === activeFilter);
      const searchTarget = `${prop.title} ${prop.location} ${prop.city} ${prop.dorms} ${prop.price} ${categoryLabels[prop.category] || ''}`.toLowerCase();
      const matchesSearch = !searchTerm || searchTarget.includes(searchTerm);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      noResults.style.display = 'flex';
    } else {
      noResults.style.display = 'none';

      filtered.forEach(prop => {
        const catName = categoryLabels[prop.category] || prop.category;
        const tagHtml = prop.tag 
          ? `<span class="tag-status ${prop.tagClass || ''}">${prop.tag}</span>` 
          : '';

        const whatsappMsg = prop.whatsappText 
          ? encodeURIComponent(prop.whatsappText) 
          : encodeURIComponent(`Olá! Tenho interesse no imóvel ${prop.title} que vi no site da VJA Imóveis.`);

        const featuresHtml = (prop.features || []).map(f => `<li><i class="fa-solid fa-circle-check"></i> ${f}</li>`).join('');

        const card = document.createElement('article');
        card.className = 'liquid-card lancamento-card';
        card.setAttribute('data-category', prop.category);
        card.setAttribute('data-tilt', '');

        card.innerHTML = `
          <div class="card-glass-specular"></div>
          <div class="card-thumb-wrap">
            <img src="${prop.image || 'cartaofrente.jpeg'}" alt="${prop.title}" class="card-thumb" loading="lazy" onerror="this.src='cartaofrente.jpeg'">
            ${tagHtml}
            <span class="tag-location"><i class="fa-solid fa-location-dot"></i> ${catName}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${prop.title}</h3>
            <p class="card-location-sub">${prop.location} - ${prop.city || 'SP'}</p>
            <div class="card-price-box">
              <span class="price-prefix">A partir de</span>
              <span class="price-value">${prop.price}</span>
            </div>
            <ul class="card-specs">
              <li><i class="fa-solid fa-bed"></i> ${prop.dorms}</li>
              <li><i class="fa-solid fa-expand"></i> ${prop.area}</li>
              ${featuresHtml}
            </ul>
            <p class="card-note"><i class="fa-solid fa-key"></i> Consulte condições facilitadas e financiamento.</p>
            <a href="https://wa.me/5511932774040?text=${whatsappMsg}" target="_blank" class="btn btn-gold-liquid w-100">
              <i class="fa-brands fa-whatsapp"></i>
              <span>Consultar Oportunidade</span>
            </a>
          </div>
        `;

        lancamentosGrid.appendChild(card);
      });
    }

    // Rebind light and tilt
    bindDynamicEffects();
  }

  // Update counter badges on region buttons
  function updateCategoryCounts() {
    const totalCount = allProperties.length;
    const countEl = (id, cat) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = cat === 'all' 
          ? totalCount 
          : allProperties.filter(p => p.category === cat).length;
      }
    };

    countEl('countAll', 'all');
    countEl('countZN', 'zona-norte');
    countEl('countZS', 'zona-sul');
    countEl('countZL', 'zona-leste');
    countEl('countZO', 'zona-oeste');
    countEl('countCentro', 'centro-paulista');
    countEl('countBarueri', 'barueri');
    countEl('countOsasco', 'osasco');

    const metricTotal = document.getElementById('metricTotalProps');
    if (metricTotal) {
      metricTotal.textContent = `${totalCount}+`;
    }

    const manageCount = document.getElementById('manageCount');
    if (manageCount) {
      manageCount.textContent = totalCount;
    }
  }

  // ========================================================================
  // 4. Filtering Tabs & Search Input
  // ========================================================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const propertySearch = document.getElementById('propertySearch');
  const resetFilterBtn = document.getElementById('resetFilterBtn');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      renderProperties();
    });
  });

  if (propertySearch) {
    propertySearch.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderProperties();
    });
  }

  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      activeFilter = 'all';
      searchTerm = '';
      if (propertySearch) propertySearch.value = '';
      filterButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === 'all'));
      renderProperties();
    });
  }

  // ========================================================================
  // 5. Admin Panel (Área da Proprietária / Gestão)
  // ========================================================================
  const adminModal = document.getElementById('adminModal');
  const openAdminBtn = document.getElementById('openAdminBtn');
  const quickAddBtn = document.getElementById('quickAddBtn');
  const footerAdminLink = document.getElementById('footerAdminLink');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  
  const adminAuthView = document.getElementById('adminAuthView');
  const adminDashboardView = document.getElementById('adminDashboardView');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  // Password for owner (CRECI: 55121 or vja55121 or vja2026)
  const VALID_PASSWORDS = ['vja55121', '55121', 'vja2026', 'stephany'];

  function openAdmin() {
    if (adminModal) {
      adminModal.classList.add('active');
      const isAuthenticated = sessionStorage.getItem('vja_admin_logged') === 'true';
      if (isAuthenticated) {
        showDashboard();
      } else {
        showLogin();
      }
    }
  }

  function closeAdmin() {
    if (adminModal) {
      adminModal.classList.remove('active');
    }
  }

  if (openAdminBtn) openAdminBtn.addEventListener('click', openAdmin);
  if (quickAddBtn) quickAddBtn.addEventListener('click', openAdmin);
  if (footerAdminLink) {
    footerAdminLink.addEventListener('click', (e) => {
      e.preventDefault();
      openAdmin();
    });
  }
  if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdmin);

  // Close when clicking outside modal card
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) closeAdmin();
    });
  }

  function showLogin() {
    adminAuthView.style.display = 'block';
    adminDashboardView.style.display = 'none';
  }

  function showDashboard() {
    adminAuthView.style.display = 'none';
    adminDashboardView.style.display = 'block';
    renderManageList();
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('adminPass').value.trim().toLowerCase();
      if (VALID_PASSWORDS.includes(pass)) {
        sessionStorage.setItem('vja_admin_logged', 'true');
        showDashboard();
        adminLoginForm.reset();
      } else {
        alert('Senha incorreta! Por favor, tente novamente.');
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('vja_admin_logged');
      showLogin();
    });
  }

  // Admin Tabs (Novo Imóvel vs Gerenciar)
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  const adminTabContents = document.querySelectorAll('.admin-tab-content');

  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      adminTabBtns.forEach(b => b.classList.remove('active'));
      adminTabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');
    });
  });

  // Image Upload with Instant Preview
  const propImageFile = document.getElementById('propImageFile');
  const uploadDropzone = document.getElementById('uploadDropzone');
  const imagePreviewWrap = document.getElementById('imagePreviewWrap');
  const imagePreview = document.getElementById('imagePreview');
  const btnRemovePreview = document.getElementById('btnRemovePreview');
  let uploadedBase64Image = '';

  if (propImageFile) {
    propImageFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedBase64Image = event.target.result;
          imagePreview.src = uploadedBase64Image;
          uploadDropzone.style.display = 'none';
          imagePreviewWrap.style.display = 'flex';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (btnRemovePreview) {
    btnRemovePreview.addEventListener('click', () => {
      uploadedBase64Image = '';
      propImageFile.value = '';
      imagePreview.src = '';
      uploadDropzone.style.display = 'flex';
      imagePreviewWrap.style.display = 'none';
    });
  }

  // Add New Property Submission
  const newPropertyForm = document.getElementById('newPropertyForm');
  if (newPropertyForm) {
    newPropertyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('propTitle').value.trim();
      const category = document.getElementById('propCategory').value;
      const location = document.getElementById('propLocation').value.trim();
      const price = document.getElementById('propPrice').value.trim();
      const dorms = document.getElementById('propDorms').value.trim();
      const area = document.getElementById('propArea').value.trim();
      const tag = document.getElementById('propTag').value.trim() || 'Lançamento';
      const featuresRaw = document.getElementById('propFeatures').value.trim();
      const imageUrlInput = document.getElementById('propImageUrl').value.trim();
      const customWhatsapp = document.getElementById('propWhatsappText').value.trim();

      const image = uploadedBase64Image || imageUrlInput || 'cartaofrente.jpeg';
      const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : ['Excelente Localização', 'Lazer Completo'];

      const newProp = {
        id: 'prop-' + Date.now(),
        title,
        category,
        location,
        city: 'São Paulo e Região',
        price,
        dorms,
        area,
        features,
        tag,
        tagClass: 'tag-destaque',
        image,
        whatsappText: customWhatsapp || `Olá! Tenho interesse no imóvel ${title} que vi no site da VJA Imóveis.`
      };

      // Save to local storage custom list
      const currentCustom = JSON.parse(localStorage.getItem('vja_custom_properties') || '[]');
      currentCustom.unshift(newProp);
      localStorage.setItem('vja_custom_properties', JSON.stringify(currentCustom));

      // Add to runtime properties
      allProperties.unshift(newProp);

      // Re-render
      renderProperties();
      updateCategoryCounts();
      renderManageList();

      // Reset form
      newPropertyForm.reset();
      if (btnRemovePreview) btnRemovePreview.click();

      alert(`✅ Imóvel "${title}" cadastrado com sucesso na região ${categoryLabels[category]}!`);
      closeAdmin();
    });
  }

  // Render Manage & Delete List
  function renderManageList() {
    const list = document.getElementById('managePropertiesList');
    if (!list) return;

    list.innerHTML = '';
    allProperties.forEach(prop => {
      const item = document.createElement('div');
      item.className = 'manage-prop-item';
      item.innerHTML = `
        <div class="manage-prop-info">
          <img src="${prop.image || 'cartaofrente.jpeg'}" alt="${prop.title}" class="manage-prop-thumb" onerror="this.src='cartaofrente.jpeg'">
          <div>
            <div class="manage-prop-title">${prop.title}</div>
            <div class="manage-prop-cat">${categoryLabels[prop.category] || prop.category} • ${prop.dorms}</div>
            <div class="manage-prop-price">${prop.price}</div>
          </div>
        </div>
        <button class="btn-delete-prop" data-id="${prop.id}">
          <i class="fa-solid fa-trash"></i> Remover
        </button>
      `;
      list.appendChild(item);
    });

    // Bind delete events
    const deleteBtns = list.querySelectorAll('.btn-delete-prop');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const propToDelete = allProperties.find(p => p.id === id);
        if (confirm(`Deseja realmente remover o imóvel "${propToDelete ? propToDelete.title : 'selecionado'}" do catálogo?`)) {
          // Remove from runtime
          allProperties = allProperties.filter(p => p.id !== id);

          // Remove from custom local storage if present
          let currentCustom = JSON.parse(localStorage.getItem('vja_custom_properties') || '[]');
          currentCustom = currentCustom.filter(p => p.id !== id);
          localStorage.setItem('vja_custom_properties', JSON.stringify(currentCustom));

          // Mark as deleted in deleted_ids so base properties stay hidden too
          const deletedIds = JSON.parse(localStorage.getItem('vja_deleted_properties') || '[]');
          if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem('vja_deleted_properties', JSON.stringify(deletedIds));
          }

          renderProperties();
          updateCategoryCounts();
          renderManageList();
        }
      });
    });
  }

  // Export Catalog JSON (Backup)
  const exportCatalogBtn = document.getElementById('exportCatalogBtn');
  if (exportCatalogBtn) {
    exportCatalogBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allProperties, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "vja_imoveis_catalogo.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  // ========================================================================
  // 6. Active Navigation State on Scroll
  // ========================================================================
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => observer.observe(section));

  // ========================================================================
  // 7. General Contact Form Integration with WhatsApp
  // ========================================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nome = document.getElementById('nome').value.trim();
      const telefone = document.getElementById('telefone').value.trim();
      const interesse = document.getElementById('interesse').value;
      const mensagem = document.getElementById('mensagem').value.trim();

      const phoneNumber = '5511932774040'; // Stephany Amorim WhatsApp

      let text = `*Contato via Site - VJA Imóveis*\n`;
      text += `*Nome:* ${nome}\n`;
      text += `*WhatsApp:* ${telefone}\n`;
      text += `*Interesse:* ${interesse}\n`;
      if (mensagem) {
        text += `*Mensagem:* ${mensagem}\n`;
      }

      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;

      window.open(whatsappUrl, '_blank');
      contactForm.reset();
    });
  }

  // Initialize properties on startup
  initProperties();
});
