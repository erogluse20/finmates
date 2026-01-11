function openAssetModal() {
    // Check if modal exists, if not create it
    let modal = document.getElementById('assetModal');
    if (!modal) {
        modal = createAssetModalStructure();
        document.body.appendChild(modal);
    }

    // Reset Search
    document.getElementById('assetSearchInput').value = '';

    // Get filter from current Type Selection
    const typeSelect = document.getElementById('typeSelect');
    const selectedType = typeSelect ? typeSelect.value : '';

    // Render list based on type
    renderModalList(selectedType);

    // Show
    modal.classList.add('open');
}

function closeAssetModal() {
    const modal = document.getElementById('assetModal');
    if (modal) modal.classList.remove('open');
}

function createAssetModalStructure() {
    const div = document.createElement('div');
    div.id = 'assetModal';
    div.className = 'modal-overlay';
    div.onclick = (e) => {
        if (e.target === div) closeAssetModal();
    };

    div.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <span class="modal-title">Varlık Seç</span>
                <button class="close-modal-btn" onclick="closeAssetModal()">&times;</button>
            </div>
            <div class="modal-search-box">
                <div class="search-input-wrapper">
                    <i class="ph ph-magnifying-glass search-icon"></i>
                    <input type="text" id="assetSearchInput" class="search-input" placeholder="Ara..." oninput="handleAssetSearch(this.value)">
                </div>
            </div>
            <div class="modal-body" id="modalAssetList">
                <!-- Items -->
            </div>
        </div>
    `;
    return div;
}

function renderModalList(filterType, searchQuery = '') {
    const list = document.getElementById('modalAssetList');
    list.innerHTML = '';

    // Access Global Data
    let data = typeof GLOBAL_ASSET_DATA !== 'undefined' ? GLOBAL_ASSET_DATA : [];

    // Filter
    let filtered = data;

    // 1. By Type (if selected)
    if (filterType) {
        filtered = filtered.filter(item => item.type === filterType);
    }

    // 2. By Search
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(item =>
            item.symbol.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q)
        );
    }

    // Render
    if (filtered.length === 0) {
        list.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-secondary)">Sonuç bulunamadı</div>`;
        return;
    }

    filtered.forEach(asset => {
        const item = document.createElement('div');
        item.className = 'asset-select-item';
        item.onclick = () => selectAssetFromModal(asset);

        item.innerHTML = `
            <img src="${asset.logo}" class="asset-logo-img" onerror="this.src='https://ui-avatars.com/api/?name=${asset.symbol}'">
            <div class="asset-info-col">
                <span class="asset-symbol-text">${asset.symbol}</span>
                <span class="asset-name-text">${asset.name}</span>
            </div>
        `;
        list.appendChild(item);
    });
}

function handleAssetSearch(val) {
    const typeSelect = document.getElementById('typeSelect');
    const selectedType = typeSelect ? typeSelect.value : '';
    renderModalList(selectedType, val);
}

function selectAssetFromModal(asset) {
    // 1. Set values in main form
    const assetSelect = document.getElementById('assetSelect'); // We are hijacking this even if it's hidden or we change it

    // Since we're replacing the select with a custom button trigger, let's update a hidden field or the button text
    // BUT to keep compatibility with existing CreatePortfolio.js logic, let's update the HIDDEN select functionality.

    // Add option if not exists
    assetSelect.innerHTML = `<option value="${asset.symbol}" selected>${asset.symbol}</option>`;
    assetSelect.value = asset.symbol;

    // Update the trigger button text to show selected
    const triggerBtn = document.getElementById('assetSelectTrigger');
    if (triggerBtn) {
        triggerBtn.innerHTML = `
            <div class="flex items-center gap-sm">
                <img src="${asset.logo}" style="width:20px; height:20px; border-radius:50%">
                <span>${asset.symbol}</span>
            </div>
            <i class="ph ph-caret-down"></i>
        `;
        triggerBtn.style.color = 'var(--text-primary)';
        triggerBtn.style.border = '1px solid var(--color-brand)';
    }

    closeAssetModal();
}
