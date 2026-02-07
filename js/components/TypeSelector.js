const INVESTMENT_TYPES = [
    { id: 'metal', label: 'Kıymetli Madenler', icon: 'ph-fill ph-coins', color: '#facc15' },
    { id: 'bist', label: 'Borsa İstanbul (BiST)', icon: 'ph-fill ph-chart-line-up', color: '#3b82f6' },
    { id: 'crypto', label: 'Kripto', icon: 'ph-fill ph-currency-btc', color: '#f97316' },
    { id: 'deposit', label: 'Mevduat', icon: 'ph-fill ph-bank', color: '#10b981' },
    { id: 'us_stock', label: 'ABD Hisseleri', icon: 'ph-fill ph-globe', color: '#6366f1' },
    { id: 'fund', label: 'FON', icon: 'ph-fill ph-briefcase', color: '#a855f7' }
];

function openTypeModal() {
    let modal = document.getElementById('typeModal');
    if (!modal) {
        modal = createTypeModalStructure();
        document.body.appendChild(modal);
    }
    modal.classList.add('open');
}

function closeTypeModal() {
    const modal = document.getElementById('typeModal');
    if (modal) modal.classList.remove('open');
}

function createTypeModalStructure() {
    const div = document.createElement('div');
    div.id = 'typeModal';
    div.className = 'modal-overlay';
    div.onclick = (e) => {
        if (e.target === div) closeTypeModal();
    };

    div.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <span class="modal-title">Yatırım Türü Seç</span>
                <button class="close-modal-btn" onclick="closeTypeModal()">&times;</button>
            </div>
            <div class="modal-body type-grid">
                ${INVESTMENT_TYPES.map(type => `
                    <div class="type-item" onclick="selectTypeFromModal('${type.id}')">
                        <div class="type-icon-wrapper" style="background: ${type.color}15; color: ${type.color}">
                            <i class="${type.icon}"></i>
                        </div>
                        <span class="type-label">${type.label}</span>
                        <i class="ph ph-caret-right type-arrow"></i>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    return div;
}

function selectTypeFromModal(typeId) {
    const type = INVESTMENT_TYPES.find(t => t.id === typeId);
    if (!type) return;

    // Update the hidden select and the trigger UI in CreatePortfolio
    const typeSelect = document.getElementById('typeSelect');
    const triggerBtn = document.getElementById('typeSelectTrigger');

    if (typeSelect) {
        typeSelect.value = typeId;
        // Trigger handleTypeChange manually
        handleTypeChange(typeSelect);
    }

    if (triggerBtn) {
        triggerBtn.innerHTML = `
            <div class="flex items-center gap-sm">
                <div class="type-icon-small" style="background: ${type.color}15; color: ${type.color}; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                    <i class="${type.icon}"></i>
                </div>
                <span>${type.label}</span>
            </div>
            <i class="ph ph-caret-down"></i>
        `;
        triggerBtn.style.color = 'var(--text-primary)';
        triggerBtn.style.border = '1px solid var(--color-brand)';
    }

    closeTypeModal();
}
