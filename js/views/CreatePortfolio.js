// State for the create form
let portfolioAssets = [];
const CHART_PALETTE = ['#06d6a0', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

function CreatePortfolioView() {
    console.log('CreatePortfolioView Loaded - Simplified');
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
                <input type="text" class="form-control" placeholder="Portföyünüzü tanımlayan kısa bir isim yazın." ${window.EDIT_PORTFOLIO_ID ? 'disabled style="background: var(--bg-body); cursor: not-allowed; opacity: 0.7;"' : ''}>
            </div>

            <div class="form-group">
                <label class="form-label">Portföy Açıklaması</label>
                <textarea class="form-control" placeholder="Portföyün stratejisini, risk profilini veya hedeflerini kısaca açıklayın."></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Yatırım Türü</label>
                <select class="form-control" id="typeSelect" style="display:none" onchange="handleTypeChange(this)">
                    <option value="" selected disabled>Seçiniz</option>
                    ${typeof INVESTMENT_TYPES !== 'undefined' ? INVESTMENT_TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join('') : ''}
                </select>
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
                <button type="button" class="form-control" id="assetSelectTrigger" onclick="openAssetModal()" disabled
                    style="text-align: left; display: flex; justify-content: space-between; align-items: center; cursor: not-allowed; color: var(--text-tertiary); opacity: 0.6;">
                    <span>Önce Yatırım Türü Seçiniz</span>
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

// Logic to populate second dropdown
function handleTypeChange(selectElem) {
    const type = selectElem.value;
    const assetSelect = document.getElementById('assetSelect');
    const triggerBtn = document.getElementById('assetSelectTrigger');

    // Reset internal select
    assetSelect.value = "";

    // Enable/Disable Asset Trigger
    if (triggerBtn) {
        if (type) {
            triggerBtn.disabled = false;
            triggerBtn.style.cursor = 'pointer';
            triggerBtn.style.opacity = '1';
            triggerBtn.style.color = 'var(--text-secondary)';
            triggerBtn.style.borderColor = 'var(--color-brand)';
            triggerBtn.innerHTML = `<span>Yatırım Aracı Seçiniz (${type.toUpperCase()})</span> <i class="ph ph-magnifying-glass"></i>`;
        } else {
            triggerBtn.disabled = true;
            triggerBtn.style.cursor = 'not-allowed';
            triggerBtn.style.opacity = '0.6';
            triggerBtn.style.color = 'var(--text-tertiary)';
            triggerBtn.style.borderColor = 'var(--border-color)';
            triggerBtn.innerHTML = `<span>Önce Yatırım Türü Seçiniz</span> <i class="ph ph-magnifying-glass"></i>`;
        }
    }
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

    const ratioSlider = document.getElementById('ratioSlider');
    val = parseInt(ratioSlider.value);

    // Validation: Check total limit
    const currentTotal = portfolioAssets.reduce((sum, item) => sum + item.percent, 0);
    if (currentTotal + val > 100) {
        alert(`Toplam oran %100'ü geçemez! Mevcut boş alan: %${100 - currentTotal}`);
        return;
    }

    // Add to state
    const newItem = {
        symbol: assetName,
        type: typeSelect.value,
        percent: val,
        color: CHART_PALETTE[portfolioAssets.length % CHART_PALETTE.length]
    };

    portfolioAssets.push(newItem);

    // Render list
    renderAssetList();

    // Update UX
    updateSliderState();

    // Reset Dropdowns
    typeSelect.value = "";
    assetSelect.value = "";

    const triggerBtn = document.getElementById('assetSelectTrigger');
    if (triggerBtn) {
        triggerBtn.disabled = true;
        triggerBtn.style.cursor = 'not-allowed';
        triggerBtn.style.opacity = '0.6';
        triggerBtn.style.color = 'var(--text-tertiary)';
        triggerBtn.style.borderColor = 'var(--border-color)';
        triggerBtn.innerHTML = `<span>Önce Yatırım Türü Seçiniz</span> <i class="ph ph-magnifying-glass"></i>`;
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
        // Updated styling to match dark theme
        item.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            background: var(--bg-card); 
            padding: 12px 16px; 
            border-radius: 12px;
            border: 1px solid var(--border-color);
            margin-bottom: 8px;
        `;

        const valueDisplay = `%${asset.percent}`;

        // Find logo
        const globalToken = typeof GLOBAL_ASSET_DATA !== 'undefined' ? GLOBAL_ASSET_DATA.find(a => a.symbol === asset.symbol) : null;
        const logoUrl = globalToken ? globalToken.logo : `https://ui-avatars.com/api/?name=${asset.symbol}&background=random&color=fff`;

        item.innerHTML = `
            <div class="flex items-center gap-sm">
                <img src="${logoUrl}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                <strong style="color: var(--text-primary); margin-left: 8px;">${asset.symbol}</strong>
            </div>
            <div class="flex items-center gap-sm">
                <span style="font-weight: 600; color: ${asset.color || 'var(--color-brand)'};">${valueDisplay}</span>
                <button onclick="editAsset(${index})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-right: 8px; padding: 4px;">
                    <i class="ph-fill ph-pencil-simple" style="font-size: 18px;"></i>
                </button>
                <button onclick="removeAsset(${index})" style="background: none; border: none; color: var(--color-danger); cursor: pointer; padding: 4px;">
                    <i class="ph-fill ph-trash" style="font-size: 18px;"></i>
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

    // Update UI to reflect removal
    renderAssetList();
    updateSliderState();

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
    const ratioSlider = document.getElementById('ratioSlider');
    const badge = document.getElementById('rangeValue');
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

    // Prepare Assets for Save
    let assetsToSave = [];

    const currentTotal = portfolioAssets.reduce((sum, item) => sum + item.percent, 0);
    if (currentTotal !== 100) {
        alert(`Portföy toplamı %100 olmalıdır. Mevcut: %${currentTotal}`);
        return;
    }
    assetsToSave = [...portfolioAssets];

    // Check if we are updating or creating
    const isUpdate = !!window.EDIT_PORTFOLIO_ID;

    // Get Current User
    const user = await sb_auth.getUser();

    // Prepare Payload
    // Prepare Payload
    const postPayload = {
        user_id: user.id,
        title: title,
        description: description,
        assets: assetsToSave
    };

    let result;

    // DEV MODE HANDLING
    if (typeof window.DEV_MODE !== 'undefined' && window.DEV_MODE) {
        if (isUpdate) {
            const mockIdx = window.MOCK_POSTS.findIndex(p => p.id === window.EDIT_PORTFOLIO_ID);
            if (mockIdx > -1) {
                window.MOCK_POSTS[mockIdx] = { ...window.MOCK_POSTS[mockIdx], ...postPayload };
                result = { data: window.MOCK_POSTS[mockIdx], error: null };
            } else {
                console.warn("Mock post not found for update, creating new one anyway.");
                const newPost = { id: Date.now(), ...postPayload, created_at: new Date().toISOString() };
                window.MOCK_POSTS.unshift(newPost);
                result = { data: newPost, error: null };
            }
        } else {
            const newPost = { id: Date.now(), ...postPayload, created_at: new Date().toISOString() };
            window.MOCK_POSTS.unshift(newPost);
            result = { data: newPost, error: null };
        }
    } else {
        // REAL SUPABASE HANDLING
        if (isUpdate) {
            console.log('Updating Supabase post:', window.EDIT_PORTFOLIO_ID);
            result = await window.sb.from('posts').update(postPayload).eq('id', window.EDIT_PORTFOLIO_ID).select();
        } else {
            console.log('Inserting new Supabase post');
            result = await window.sb.from('posts').insert(postPayload).select();
        }
    }

    if (result.error) {
        console.error('Database Error:', result.error);
        alert('Kaydedilirken bir hata oluştu: ' + result.error.message);
        return;
    }

    console.log('Database operation result:', result);

    if (isUpdate && (!result.data || result.data.length === 0)) {
        console.warn('Update successful in Supabase but 0 rows were affected. This usually means the ID was not found or RLS policy blocked the update.');
        alert('Uyarı: Güncelleme işlemi veri tabanında bir değişikliğe yol açmadı. Lütfen sayfayı yenileyip tekrar deneyin.');
    } else {
        console.log('Database success:', result.data);
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
        let post = null;

        // 1. Check Mock Data (DEV_MODE)
        if (typeof window.DEV_MODE !== 'undefined' && window.DEV_MODE && window.MOCK_POSTS) {
            post = window.MOCK_POSTS.find(p => p.id === window.EDIT_PORTFOLIO_ID);
        }

        // 2. Check Local Storage (Legacy/Drafts)
        if (!post) {
            const existingPosts = JSON.parse(localStorage.getItem('finmates_posts') || '[]');
            post = existingPosts.find(p => p.id === window.EDIT_PORTFOLIO_ID);
        }

        if (post) {
            // Populate Fields
            document.querySelector('.page-title').textContent = 'Portföy Düzenle';
            document.querySelector('input[placeholder*="Portföyünüzü tanımlayan"]').value = post.title;
            document.querySelector('textarea').value = post.description;
            // Change button text
            document.querySelector('.btn-primary').textContent = 'Güncelle & Paylaş';

            // Populate Assets
            portfolioAssets = [...post.assets] || [];

            renderAssetList();
            updateSliderState();
        } else {
            // Fallback: Fetch from Supabase
            window.sb.from('posts').select('*').eq('id', window.EDIT_PORTFOLIO_ID).single().then(({ data, error }) => {
                if (data && !error) {
                    document.querySelector('.page-title').textContent = 'Portföy Düzenle';
                    document.querySelector('input[placeholder*="Portföyünüzü tanımlayan"]').value = data.title;
                    document.querySelector('textarea').value = data.description;
                    document.querySelector('.btn-primary').textContent = 'Güncelle & Paylaş';

                    portfolioAssets = [...data.assets];
                    renderAssetList();
                    updateSliderState();
                } else {
                    console.error('Error fetching post for edit:', error);
                    alert('Portföy bilgileri yüklenemedi.');
                    window.EDIT_PORTFOLIO_ID = null;
                    navigate('/');
                }
            });
        }
    } else {
        // Initial check for clean state
        updateSliderState();
    }
}
