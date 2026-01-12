// State for the create form
let portfolioAssets = [];

function CreatePortfolioView() {
    return `
        <div class="page-header">
            <h1 class="page-title">Portföy Oluştur</h1>
            <p class="page-desc">
                Bu portföy, yatırım stratejinizi ve varlık dağılımınızı toplulukla paylaşmak için kullanılır. Gerçek alım-satım işlemleri içermez.
            </p>
        </div>

        <form onsubmit="return false;">
            <div class="form-group">
                <label class="form-label">Portföy Adı</label>
                <input type="text" class="form-control" placeholder="Portföyünüzü tanımlayan kısa bir isim yazın.">
            </div>

            <div class="form-group">
                <label class="form-label">Portföy Açıklaması</label>
                <textarea class="form-control" placeholder="Portföyün stratejisini, risk profilini veya hedeflerini kısaca açıklayın."></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Yatırım Türü</label>
                <select class="form-control" id="typeSelect" style="display:none" onchange="handleTypeChange(this)"></select>
                <button type="button" class="form-control" id="typeSelectTrigger" onclick="openTypeModal()" 
                    style="text-align: left; display: flex; justify-content: space-between; align-items: center; cursor: pointer; color: var(--text-secondary);">
                    <span>Yatırım Türü Seçiniz</span>
                    <i class="ph ph-caret-down"></i>
                </button>
            </div>

            <div class="form-group">
                <label class="form-label">Yatırım Aracı</label>
                <!-- Hidden Select for compatibility -->
                <select class="form-control" id="assetSelect" style="display:none"></select>
                
                <!-- Custom Trigger Button -->
                <button type="button" class="form-control" id="assetSelectTrigger" onclick="openAssetModal()" 
                    style="text-align: left; display: flex; justify-content: space-between; align-items: center; cursor: pointer; color: var(--text-secondary);">
                    <span>Yatırım Aracı Seçiniz</span>
                    <i class="ph ph-magnifying-glass"></i>
                </button>
                
                <div class="form-helper">Portföye eklemek istediğiniz varlık türünü veya enstrümanını ekleyin.</div>
            </div>

            <div class="form-group">
                <div class="flex items-center justify-between">
                    <label class="form-label" style="margin:0">Yatırım Oranı</label>
                    <span class="range-value-badge" id="rangeValue">50 %</span>
                </div>
                <div class="range-container">
                    <input type="range" min="1" max="100" value="50" class="range-slider" id="ratioSlider">
                </div>
                <div class="form-helper">Bu yatırım aracının portföy içindeki yüzdesini belirtin.</div>
            </div>

            <button type="button" class="btn-outline-dashed" onclick="handleAddAsset()">
                <i class="ph ph-plus"></i> Yatırım Aracı Ekle
            </button>
            
            <!-- Asset List Container -->
            <div id="addedAssetsList" style="margin-top: 24px; display: flex; flex-direction: column; gap: 8px;">
                <!-- Assets will appear here -->
            </div>

            <button type="button" class="btn-primary" onclick="handleShare()">
                Paylaş
            </button>
        </form>
    `;
}

// Logic to populate second dropdown
function handleTypeChange(selectElem) {
    const type = selectElem.value;
    const assetSelect = document.getElementById('assetSelect');
    const triggerBtn = document.getElementById('assetSelectTrigger');

    // Reset internal select
    assetSelect.value = "";

    // Reset Trigger UI
    if (triggerBtn) {
        triggerBtn.innerHTML = `<span>Yatırım Aracı Seçiniz (${type ? type.toUpperCase() : ''})</span> <i class="ph ph-magnifying-glass"></i>`;
        triggerBtn.style.color = 'var(--text-secondary)';
        triggerBtn.style.border = '1px solid var(--border-color)';
    }

    // In this new modal version, we don't populate the select options here. 
    // The Modal handles filtering based on 'typeSelect' value dynamically when opened.
}

// Handle Add Asset Button Click
function handleAddAsset() {
    const assetSelect = document.getElementById('assetSelect');
    const ratioSlider = document.getElementById('ratioSlider');
    const typeSelect = document.getElementById('typeSelect');

    const assetName = assetSelect.value;
    const percent = parseInt(ratioSlider.value);

    if (!assetName || assetName === "") {
        alert("Lütfen bir yatırım aracı seçin.");
        return;
    }

    // Validation: Check total limit
    const currentTotal = portfolioAssets.reduce((sum, item) => sum + item.percent, 0);
    if (currentTotal + percent > 100) {
        alert(`Toplam oran %100'ü geçemez! Mevcut boş alan: %${100 - currentTotal}`);
        return;
    }

    // Add to state
    portfolioAssets.push({
        symbol: assetName,
        percent: percent,
        type: typeSelect.value
    });

    // Render list
    renderAssetList();

    // Update Slider UX
    updateSliderState();

    // Reset Dropdowns
    typeSelect.value = "";
    assetSelect.value = "";

    const triggerBtn = document.getElementById('assetSelectTrigger');
    if (triggerBtn) {
        triggerBtn.innerHTML = `<span>Yatırım Aracı Seçiniz</span> <i class="ph ph-magnifying-glass"></i>`;
        triggerBtn.style.color = 'var(--text-secondary)';
        triggerBtn.style.border = '1px solid var(--border-color)';
    }

    const typeTriggerBtn = document.getElementById('typeSelectTrigger');
    if (typeTriggerBtn) {
        typeTriggerBtn.innerHTML = `<span>Yatırım Türü Seçiniz</span> <i class="ph ph-caret-down"></i>`;
        typeTriggerBtn.style.color = 'var(--text-secondary)';
        typeTriggerBtn.style.border = '1px solid var(--border-color)';
    }
}

function updateSliderState() {
    const currentTotal = portfolioAssets.reduce((sum, item) => sum + item.percent, 0);
    const remaining = 100 - currentTotal;

    const slider = document.getElementById('ratioSlider');
    const badge = document.getElementById('rangeValue');
    const helperText = document.querySelector('.range-helper-text'); // We will add this class

    if (slider) {
        slider.max = remaining;
        // If current value is greater than max, clamp it
        if (parseInt(slider.value) > remaining) {
            slider.value = remaining;
            badge.textContent = `${remaining} %`;
        } else if (parseInt(slider.value) === 0 && remaining > 0) {
            // Reset to a reasonable default if 0 but space exists
            slider.value = Math.min(50, remaining);
            badge.textContent = `${slider.value} %`;
        }

        // Disable if full
        if (remaining === 0) {
            slider.disabled = true;
            slider.value = 0;
            badge.textContent = "0 %";
        } else {
            slider.disabled = false;
        }
    }
}

function renderAssetList() {
    const listContainer = document.getElementById('addedAssetsList');
    listContainer.innerHTML = '';

    portfolioAssets.forEach((asset, index) => {
        const item = document.createElement('div');
        item.className = 'asset-item-row';
        item.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            background: rgba(255,255,255,0.05); 
            padding: 12px; 
            border-radius: 8px;
            border: 1px solid var(--border-color);
        `;

        item.innerHTML = `
            <div class="flex items-center gap-sm">
                <div style="background: var(--color-brand); width: 8px; height: 8px; border-radius: 50%;"></div>
                <strong>${asset.symbol}</strong>
            </div>
            <div class="flex items-center gap-sm">
                <span>%${asset.percent}</span>
                <button onclick="editAsset(${index})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-right: 8px;">
                    <i class="ph-fill ph-pencil-simple"></i>
                </button>
                <button onclick="removeAsset(${index})" style="background: none; border: none; color: var(--color-danger); cursor: pointer;">
                    <i class="ph-fill ph-trash"></i>
                </button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

function removeAsset(index) {
    portfolioAssets.splice(index, 1);
    renderAssetList();
    updateSliderState(); // Re-calculate limits
}

function editAsset(index) {
    const asset = portfolioAssets[index];

    // Remove from list temporarily (so the user can edit and re-add)
    portfolioAssets.splice(index, 1);

    // Update UI to reflect removal (freeing up the percentage)
    renderAssetList();
    updateSliderState();

    // Populate Form
    const typeSelect = document.getElementById('typeSelect');
    const assetSelect = document.getElementById('assetSelect');
    const ratioSlider = document.getElementById('ratioSlider');
    const badge = document.getElementById('rangeValue');

    // Set Type
    typeSelect.value = asset.type;

    // Trigger population of assets
    handleTypeChange(typeSelect);

    // Set Asset
    assetSelect.innerHTML = `<option value="${asset.symbol}" selected>${asset.symbol}</option>`;
    assetSelect.value = asset.symbol;

    // Update Trigger UI to show selected asset
    const triggerBtn = document.getElementById('assetSelectTrigger');
    if (triggerBtn) {
        // Find logo from global data if possible, or use avatar fallback
        const globalToken = typeof GLOBAL_ASSET_DATA !== 'undefined' ? GLOBAL_ASSET_DATA.find(a => a.symbol === asset.symbol) : null;
        const logoUrl = globalToken ? globalToken.logo : `https://ui-avatars.com/api/?name=${asset.symbol}`;

        triggerBtn.innerHTML = `
            <div class="flex items-center gap-sm">
                <img src="${logoUrl}" style="width:20px; height:20px; border-radius:50%">
                <span>${asset.symbol}</span>
            </div>
            <i class="ph ph-caret-down"></i>
        `;
        triggerBtn.style.color = 'var(--text-primary)';
        triggerBtn.style.border = '1px solid var(--color-brand)';
    }

    // Set Percentage
    ratioSlider.value = asset.percent;
    badge.textContent = `${asset.percent} %`;
}

async function handleShare() {
    if (!(await checkAuth())) return;

    const titleInput = document.querySelector('input[placeholder*="Portföyünüzü tanımlayan"]');
    const descInput = document.querySelector('textarea');

    const title = titleInput.value;
    const description = descInput.value;

    if (!title || !description) {
        alert("Lütfen başlık ve açıklama giriniz.");
        return;
    }

    const currentTotal = portfolioAssets.reduce((sum, item) => sum + item.percent, 0);
    if (currentTotal !== 100) {
        alert(`Portföy toplamı %100 olmalıdır. Mevcut: %${currentTotal}`);
        return;
    }

    // Check if we are updating or creating
    const isUpdate = !!window.EDIT_PORTFOLIO_ID;

    // Get Current User
    const user = await sb_auth.getUser();

    // Prepare Payload
    const postPayload = {
        user_id: user.id,
        title: title,
        description: description,
        assets: portfolioAssets
    };

    let result;
    if (isUpdate) {
        result = await sb.from('posts').update(postPayload).eq('id', window.EDIT_PORTFOLIO_ID);
    } else {
        result = await sb.from('posts').insert(postPayload);
    }

    if (result.error) {
        console.error('Save error:', result.error);
        alert('Kaydedilirken bir hata oluştu: ' + result.error.message);
        return;
    }

    // Clear Edit ID
    window.EDIT_PORTFOLIO_ID = null;

    // Navigate to Profile
    navigate('/profile');
}

// Logic to attach event listeners after render
function initCreatePortfolio() {
    // Reset state when view initializes
    portfolioAssets = [];

    const slider = document.getElementById('ratioSlider');
    const badge = document.getElementById('rangeValue');

    if (slider && badge) {
        slider.addEventListener('input', (e) => {
            badge.textContent = `${e.target.value} %`;
        });
    }

    // Check for Edit Mode
    if (window.EDIT_PORTFOLIO_ID) {
        const existingPosts = JSON.parse(localStorage.getItem('finmates_posts') || '[]');
        const post = existingPosts.find(p => p.id === window.EDIT_PORTFOLIO_ID);

        if (post) {
            // Populate Fields
            document.querySelector('.page-title').textContent = 'Portföy Düzenle';
            document.querySelector('input[placeholder*="Portföyünüzü tanımlayan"]').value = post.title;
            document.querySelector('textarea').value = post.description;
            // Change button text
            document.querySelector('.btn-primary').textContent = 'Güncelle & Paylaş';

            // Populate Assets
            portfolioAssets = [...post.assets];
            renderAssetList();
            updateSliderState();
        }
    } else {
        // Initial check for clean state
        updateSliderState();
    }
}
