// State for the create form
let portfolioAssets = [];
let creationMode = 'PERCENT'; // 'PERCENT' or 'AMOUNT'
let selectedCurrency = 'TL';
const CURRENCIES = ['TL', 'USD', 'EUR', 'GOLD'];

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

            <!-- Mode Toggle -->
            <div class="form-group">
                <div style="background: var(--surface-hover); padding: 4px; border-radius: 8px; display: flex; gap: 4px; margin-bottom: 12px;">
                    <button type="button" class="mode-btn active" id="modePercent" onclick="setCreationMode('PERCENT')" 
                        style="flex:1; border:none; padding:8px; border-radius:6px; background:var(--bg-body); color:var(--text-primary); cursor:pointer; font-weight:500; transition:all 0.2s;">
                        Yüzde (%)
                    </button>
                    <button type="button" class="mode-btn" id="modeAmount" onclick="setCreationMode('AMOUNT')" 
                        style="flex:1; border:none; padding:8px; border-radius:6px; background:transparent; color:var(--text-secondary); cursor:pointer; font-weight:500; transition:all 0.2s;">
                        Tutar (Para)
                    </button>
                </div>
            </div>

            <!-- Currency Selection (Visible only in AMOUNT mode) -->
            <div class="form-group" id="currencyGroup" style="display:none;">
                <label class="form-label">Para Birimi</label>
                <select class="form-control" onchange="setCurrency(this.value)">
                    ${CURRENCIES.map(c => `<option value="${c}" ${c === selectedCurrency ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
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
                    <label class="form-label" style="margin:0" id="inputLabel">Yatırım Oranı</label>
                    <span class="range-value-badge" id="rangeValue">50 %</span>
                </div>
                
                <!-- Percent Input (Slider) -->
                <div class="range-container" id="sliderContainer">
                    <input type="range" min="1" max="100" value="50" class="range-slider" id="ratioSlider">
                </div>
                
                <!-- Amount Input (Number) -->
                <div id="amountInputContainer" style="display:none;">
                    <input type="number" class="form-control" id="amountInput" placeholder="Tutar giriniz" min="0" step="any">
                </div>

                <div class="form-helper" id="inputHelper">Bu yatırım aracının portföy içindeki yüzdesini belirtin.</div>
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

function setCreationMode(mode) {
    creationMode = mode;

    // Update Mode Buttons
    document.getElementById('modePercent').style.background = mode === 'PERCENT' ? 'var(--bg-body)' : 'transparent';
    document.getElementById('modePercent').style.color = mode === 'PERCENT' ? 'var(--text-primary)' : 'var(--text-secondary)';

    document.getElementById('modeAmount').style.background = mode === 'AMOUNT' ? 'var(--bg-body)' : 'transparent';
    document.getElementById('modeAmount').style.color = mode === 'AMOUNT' ? 'var(--text-primary)' : 'var(--text-secondary)';

    // Toggle Inputs
    const sliderContainer = document.getElementById('sliderContainer');
    const amountInputContainer = document.getElementById('amountInputContainer');
    const currencyGroup = document.getElementById('currencyGroup');
    const inputLabel = document.getElementById('inputLabel');
    const rangeValue = document.getElementById('rangeValue');
    const inputHelper = document.getElementById('inputHelper');

    if (mode === 'AMOUNT') {
        sliderContainer.style.display = 'none';
        amountInputContainer.style.display = 'block';
        currencyGroup.style.display = 'block';
        inputLabel.textContent = 'Yatırım Tutarı';
        rangeValue.style.display = 'none';
        inputHelper.textContent = 'Bu yatırım aracı için ayıracağınız tutarı girin.';
        // Reset assets if switching modes (simplification to avoid complex conversion logic issues)
        if (portfolioAssets.length > 0 && !confirm("Mod değiştirildiğinde mevcut liste sıfırlanacaktır. Devam edilsin mi?")) {
            // Revert
            setCreationMode(mode === 'PERCENT' ? 'AMOUNT' : 'PERCENT');
            return;
        }
        portfolioAssets = [];
        renderAssetList();
    } else {
        sliderContainer.style.display = 'block';
        amountInputContainer.style.display = 'none';
        currencyGroup.style.display = 'none';
        inputLabel.textContent = 'Yatırım Oranı';
        rangeValue.style.display = 'block';
        inputHelper.textContent = 'Bu yatırım aracının portföy içindeki yüzdesini belirtin.';

        if (portfolioAssets.length > 0 && !confirm("Mod değiştirildiğinde mevcut liste sıfırlanacaktır. Devam edilsin mi?")) {
            // Revert
            setCreationMode(mode === 'PERCENT' ? 'AMOUNT' : 'PERCENT');
            return;
        }
        portfolioAssets = [];
        renderAssetList();
        updateSliderState();
    }
}

function setCurrency(curr) {
    selectedCurrency = curr;
    renderAssetList(); // Update symbols in list
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
    const typeSelect = document.getElementById('typeSelect');
    const assetName = assetSelect.value;

    if (!assetName || assetName === "") {
        alert("Lütfen bir yatırım aracı seçin.");
        return;
    }

    let val = 0;

    if (creationMode === 'PERCENT') {
        const ratioSlider = document.getElementById('ratioSlider');
        val = parseInt(ratioSlider.value);

        // Validation: Check total limit
        const currentTotal = portfolioAssets.reduce((sum, item) => sum + item.percent, 0);
        if (currentTotal + val > 100) {
            alert(`Toplam oran %100'ü geçemez! Mevcut boş alan: %${100 - currentTotal}`);
            return;
        }
    } else {
        const amountInput = document.getElementById('amountInput');
        val = parseFloat(amountInput.value);

        if (!val || val <= 0) {
            alert("Lütfen geçerli bir tutar girin.");
            return;
        }
    }

    // Add to state
    const newItem = {
        symbol: assetName,
        type: typeSelect.value
    };

    if (creationMode === 'PERCENT') {
        newItem.percent = val;
    } else {
        newItem.amount = val;
    }

    portfolioAssets.push(newItem);

    // Render list
    renderAssetList();

    // Update UX
    if (creationMode === 'PERCENT') {
        updateSliderState();
    } else {
        document.getElementById('amountInput').value = '';
    }

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

    // Calculate total if needed
    const totalAmount = creationMode === 'AMOUNT' ? portfolioAssets.reduce((sum, item) => sum + (item.amount || 0), 0) : 100;

    portfolioAssets.forEach((asset, index) => {
        const item = document.createElement('div');
        item.className = 'asset-item-row';
        item.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            background: #fff; 
            padding: 12px 16px; 
            border-radius: 12px;
            border: var(--border-width) solid var(--border-color);
            box-shadow: 3px 3px 0px 0px var(--border-color);
        `;

        // Display Value
        let valueDisplay = '';
        if (creationMode === 'PERCENT') {
            valueDisplay = `%${asset.percent}`;
        } else {
            // Show Amount + Currency
            valueDisplay = `${asset.amount.toLocaleString()} ${selectedCurrency}`;
            // Optional: Show approximate percentage
            const approxPercent = totalAmount > 0 ? Math.round((asset.amount / totalAmount) * 100) : 0;
            valueDisplay += ` <span style="font-size:0.8em; color:var(--text-secondary);">(%${approxPercent})</span>`;
        }

        item.innerHTML = `
            <div class="flex items-center gap-sm">
                <div style="background: var(--color-brand); width: 8px; height: 8px; border-radius: 50%;"></div>
                <strong>${asset.symbol}</strong>
            </div>
            <div class="flex items-center gap-sm">
                <span>${valueDisplay}</span>
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
    if (creationMode === 'PERCENT') {
        updateSliderState(); // Re-calculate limits
    }
}

function editAsset(index) {
    const asset = portfolioAssets[index];

    // Remove from list temporarily (so the user can edit and re-add)
    portfolioAssets.splice(index, 1);

    // Update UI to reflect removal
    renderAssetList();
    if (creationMode === 'PERCENT') {
        updateSliderState();
    }

    // Populate Form
    const typeSelect = document.getElementById('typeSelect');
    const assetSelect = document.getElementById('assetSelect');

    // Set Type
    typeSelect.value = asset.type;

    // Trigger population of assets (simulated)
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

    // Set Value
    if (creationMode === 'PERCENT') {
        const ratioSlider = document.getElementById('ratioSlider');
        const badge = document.getElementById('rangeValue');
        ratioSlider.value = asset.percent;
        badge.textContent = `${asset.percent} %`;
    } else {
        const amountInput = document.getElementById('amountInput');
        amountInput.value = asset.amount;
    }
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

    // Prepare Assets for Save
    let assetsToSave = [];

    if (creationMode === 'AMOUNT') {
        const totalAmount = portfolioAssets.reduce((sum, item) => sum + item.amount, 0);
        if (totalAmount <= 0) {
            alert("Lütfen portföye varlık ekleyin.");
            return;
        }

        // Convert to Percentages
        assetsToSave = portfolioAssets.map(item => ({
            symbol: item.symbol,
            type: item.type,
            percent: Math.round((item.amount / totalAmount) * 100),
            // Optional: Store original amount in metadata if backend supported it, but we stick to % for now
        }));

        // Fix rounding errors to ensure 100%
        const currentSum = assetsToSave.reduce((sum, item) => sum + item.percent, 0);
        const diff = 100 - currentSum;
        if (diff !== 0 && assetsToSave.length > 0) {
            // Adjust the largest element
            assetsToSave.sort((a, b) => b.percent - a.percent);
            assetsToSave[0].percent += diff;
        }

    } else {
        const currentTotal = portfolioAssets.reduce((sum, item) => sum + item.percent, 0);
        if (currentTotal !== 100) {
            alert(`Portföy toplamı %100 olmalıdır. Mevcut: %${currentTotal}`);
            return;
        }
        assetsToSave = [...portfolioAssets];
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
        assets: assetsToSave
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
    creationMode = 'PERCENT'; // valid default

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

            // Force PERCENT mode for editing existing portfolios (safest)
            setCreationMode('PERCENT');

            renderAssetList();
            updateSliderState();
        }
    } else {
        // Initial check for clean state
        updateSliderState();

        // Ensure UI matches default mode
        setCreationMode('PERCENT');
    }
}
