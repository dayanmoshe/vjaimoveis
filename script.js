/**
 * VJA Imóveis - Dynamic Liquid Glass Catalog & Owner Property Management
 * Includes Full Edit Property & Photo Upload Feature
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
  // Image Compression Helper (Ensures fast upload and storage)
  // ========================================================================
  function compressImage(file, maxWidth = 1200, maxHeight = 900, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ========================================================================
  // 3. Properties State Management (JSON + Edits + LocalStorage)
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
      const editedMap = JSON.parse(localStorage.getItem('vja_edited_properties') || '{}');

      // Helper to apply user edits (including updated photos)
      const applyEdits = (prop) => {
        if (editedMap[prop.id]) {
          return { ...prop, ...editedMap[prop.id] };
        }
        return prop;
      };

      // Combine base with custom, filter deleted, and apply any edits
      const combined = [...baseProperties, ...localCustom]
        .filter(p => !deletedIds.includes(p.id))
        .map(applyEdits);

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
    const isAdmin = sessionStorage.getItem('vja_admin_logged') === 'true';

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

        // If admin is logged in, show a quick-edit button directly on the card
        const quickEditHtml = isAdmin
          ? `<button class="card-quick-edit-btn" data-id="${prop.id}" title="Alterar foto ou dados do imóvel"><i class="fa-solid fa-camera"></i> Editar Foto</button>`
          : '';

        const card = document.createElement('article');
        card.className = 'liquid-card lancamento-card';
        card.setAttribute('data-category', prop.category);
        card.setAttribute('data-tilt', '');

        card.innerHTML = `
          <div class="card-glass-specular"></div>
          <div class="card-thumb-wrap">
            <img src="${prop.image || 'cartaofrente.jpeg'}" alt="${prop.title}" class="card-thumb" loading="lazy" onerror="this.src='cartaofrente.jpeg'">
            ${tagHtml}
            ${quickEditHtml}
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

      // Bind quick edit buttons on cards
      if (isAdmin) {
        document.querySelectorAll('.card-quick-edit-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            openAdmin();
            openEditProperty(id);
          });
        });
      }
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
        renderProperties(); // Re-render to show quick edit buttons if active
      } else {
        alert('Senha incorreta! Por favor, tente novamente.');
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('vja_admin_logged');
      showLogin();
      renderProperties();
    });
  }

  // Admin Tabs (Novo Imóvel vs Gerenciar vs Editar)
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  const adminTabContents = document.querySelectorAll('.admin-tab-content');

  function switchAdminTab(targetTabId) {
    adminTabBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === targetTabId);
    });
    adminTabContents.forEach(c => {
      c.classList.toggle('active', c.id === targetTabId);
    });
  }

  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchAdminTab(tabId);
    });
  });

  // ========================================================================
  // 6. Cadastrar Novo Imóvel (Com Compressão e Upload de Foto)
  // ========================================================================
  const propImageFile = document.getElementById('propImageFile');
  const uploadDropzone = document.getElementById('uploadDropzone');
  const imagePreviewWrap = document.getElementById('imagePreviewWrap');
  const imagePreview = document.getElementById('imagePreview');
  const btnRemovePreview = document.getElementById('btnRemovePreview');
  let uploadedBase64Image = '';

  if (propImageFile) {
    propImageFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          uploadedBase64Image = await compressImage(file);
          imagePreview.src = uploadedBase64Image;
          uploadDropzone.style.display = 'none';
          imagePreviewWrap.style.display = 'flex';
        } catch (err) {
          alert('Erro ao processar imagem. Tente outro arquivo.');
        }
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
      switchAdminTab('manageTab');
    });
  }

  // ========================================================================
  // 7. EDITAR IMÓVEL E FAZER UPLOAD DE FOTOS (NOVA FUNCIONALIDADE)
  // ========================================================================
  const editTab = document.getElementById('editTab');
  const editPropertyForm = document.getElementById('editPropertyForm');
  const editPropHeading = document.getElementById('editPropHeading');
  const editImagePreview = document.getElementById('editImagePreview');
  const editPropImageFile = document.getElementById('editPropImageFile');
  const editPhotoStatus = document.getElementById('editPhotoStatus');
  const editPropImageUrl = document.getElementById('editPropImageUrl');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const btnCancelEditBottom = document.getElementById('btnCancelEditBottom');

  let currentEditUploadedImage = '';

  // Abrir tela de edição para um imóvel
  function openEditProperty(propId) {
    const prop = allProperties.find(p => p.id === propId);
    if (!prop) {
      alert('Imóvel não encontrado.');
      return;
    }

    // Preenche todos os campos do formulário de edição
    document.getElementById('editPropId').value = prop.id;
    document.getElementById('editPropTitle').value = prop.title;
    document.getElementById('editPropCategory').value = prop.category;
    document.getElementById('editPropLocation').value = prop.location;
    document.getElementById('editPropPrice').value = prop.price;
    document.getElementById('editPropDorms').value = prop.dorms;
    document.getElementById('editPropArea').value = prop.area;
    document.getElementById('editPropTag').value = prop.tag || '';
    document.getElementById('editPropFeatures').value = (prop.features || []).join(', ');
    document.getElementById('editPropWhatsappText').value = prop.whatsappText || '';

    // Imagem atual e reset de estado de upload
    editImagePreview.src = prop.image || 'cartaofrente.jpeg';
    editPropImageUrl.value = prop.image && !prop.image.startsWith('data:') ? prop.image : '';
    currentEditUploadedImage = '';
    if (editPropImageFile) editPropImageFile.value = '';
    if (editPhotoStatus) editPhotoStatus.style.display = 'none';

    // Título do cabeçalho
    if (editPropHeading) {
      editPropHeading.textContent = `Editando: ${prop.title}`;
    }

    // Alterna para a aba de edição
    switchAdminTab('editTab');
  }

  // Evento de seleção de arquivo para UPLOAD DA NOVA FOTO no formulário de edição
  if (editPropImageFile) {
    editPropImageFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          currentEditUploadedImage = await compressImage(file);
          editImagePreview.src = currentEditUploadedImage;
          if (editPhotoStatus) {
            editPhotoStatus.style.display = 'flex';
          }
        } catch (err) {
          alert('Erro ao carregar a foto selecionada. Tente outro arquivo.');
        }
      }
    });
  }

  // Cancelar edição
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => switchAdminTab('manageTab'));
  }
  if (btnCancelEditBottom) {
    btnCancelEditBottom.addEventListener('click', () => switchAdminTab('manageTab'));
  }

  // Submissão do formulário de edição
  if (editPropertyForm) {
    editPropertyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = document.getElementById('editPropId').value;
      const propIndex = allProperties.findIndex(p => p.id === id);
      if (propIndex === -1) {
        alert('Erro: Imóvel não localizado.');
        return;
      }

      const existingProp = allProperties[propIndex];
      const title = document.getElementById('editPropTitle').value.trim();
      const category = document.getElementById('editPropCategory').value;
      const location = document.getElementById('editPropLocation').value.trim();
      const price = document.getElementById('editPropPrice').value.trim();
      const dorms = document.getElementById('editPropDorms').value.trim();
      const area = document.getElementById('editPropArea').value.trim();
      const tag = document.getElementById('editPropTag').value.trim();
      const featuresRaw = document.getElementById('editPropFeatures').value.trim();
      const urlImage = editPropImageUrl.value.trim();
      const whatsappText = document.getElementById('editPropWhatsappText').value.trim();

      // Determina a foto final: nova foto carregada > URL inserida > foto existente
      const finalImage = currentEditUploadedImage || urlImage || existingProp.image || 'cartaofrente.jpeg';
      const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : existingProp.features;

      const updatedData = {
        title,
        category,
        location,
        price,
        dorms,
        area,
        tag,
        features,
        image: finalImage,
        whatsappText: whatsappText || `Olá! Tenho interesse no imóvel ${title} que vi no site da VJA Imóveis.`
      };

      // 1. Atualiza na lista de edições salvas no localStorage
      const editedMap = JSON.parse(localStorage.getItem('vja_edited_properties') || '{}');
      editedMap[id] = { ...(editedMap[id] || {}), ...updatedData };
      localStorage.setItem('vja_edited_properties', JSON.stringify(editedMap));

      // 2. Se for um imóvel customizado (adicionado pelo usuário), atualiza também no vja_custom_properties
      let customProps = JSON.parse(localStorage.getItem('vja_custom_properties') || '[]');
      const customIdx = customProps.findIndex(p => p.id === id);
      if (customIdx !== -1) {
        customProps[customIdx] = { ...customProps[customIdx], ...updatedData };
        localStorage.setItem('vja_custom_properties', JSON.stringify(customProps));
      }

      // 3. Atualiza no array em memória
      allProperties[propIndex] = { ...existingProp, ...updatedData };

      // 4. Re-renderiza o site completo
      renderProperties();
      updateCategoryCounts();
      renderManageList();

      alert(`✅ Imóvel "${title}" e foto atualizados com sucesso no catálogo!`);
      switchAdminTab('manageTab');
    });
  }

  // ========================================================================
  // 8. Renderizar Lista de Gerenciamento (Com botões Editar e Remover)
  // ========================================================================
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
        <div class="manage-prop-actions">
          <button class="btn-edit-prop" data-id="${prop.id}" title="Editar dados e trocar foto">
            <i class="fa-solid fa-pen-to-square"></i> Editar
          </button>
          <button class="btn-delete-prop" data-id="${prop.id}" title="Remover imóvel">
            <i class="fa-solid fa-trash"></i> Remover
          </button>
        </div>
      `;
      list.appendChild(item);
    });

    // Eventos dos botões Editar
    const editBtns = list.querySelectorAll('.btn-edit-prop');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditProperty(id);
      });
    });

    // Eventos dos botões Remover
    const deleteBtns = list.querySelectorAll('.btn-delete-prop');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const propToDelete = allProperties.find(p => p.id === id);
        if (confirm(`Deseja realmente remover o imóvel "${propToDelete ? propToDelete.title : 'selecionado'}" do catálogo?`)) {
          // Remove da lista em memória
          allProperties = allProperties.filter(p => p.id !== id);

          // Remove de custom properties
          let currentCustom = JSON.parse(localStorage.getItem('vja_custom_properties') || '[]');
          currentCustom = currentCustom.filter(p => p.id !== id);
          localStorage.setItem('vja_custom_properties', JSON.stringify(currentCustom));

          // Remove de edited properties
          let editedMap = JSON.parse(localStorage.getItem('vja_edited_properties') || '{}');
          delete editedMap[id];
          localStorage.setItem('vja_edited_properties', JSON.stringify(editedMap));

          // Marca nos deletados para não recarregar do JSON base
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
  // 9. Active Navigation State on Scroll
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
  // 10. General Contact Form Integration with WhatsApp
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
