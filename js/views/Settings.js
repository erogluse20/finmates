function SettingsView() {
    return `
        <div class="page-header">
            <h1 class="page-title">Ayarlar</h1>
        </div>

        <div class="settings-container" style="padding: 16px;">
            <div class="settings-section">
                <h3 class="section-title" style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; margin-top: 20px;">Hesap</h3>
                
                <div class="settings-item" onclick="navigate('/profile')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="ph ph-user" style="font-size: 1.2rem; color: var(--text-primary);"></i>
                        <span>Profili Düzenle</span>
                    </div>
                    <i class="ph ph-caret-right" style="color: var(--text-tertiary);"></i>
                </div>

                <div class="settings-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="ph ph-lock" style="font-size: 1.2rem; color: var(--text-primary);"></i>
                        <span>Şifre Değiştir</span>
                    </div>
                    <i class="ph ph-caret-right" style="color: var(--text-tertiary);"></i>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="section-title" style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; margin-top: 24px;">Uygulama</h3>

                <div class="settings-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="ph ph-moon" style="font-size: 1.2rem; color: var(--text-primary);"></i>
                        <span>Karanlık Mod</span>
                    </div>
                    <!-- Mock Toggle Switch -->
                    <div style="width: 40px; height: 20px; background: var(--accent); border-radius: 20px; position: relative;">
                        <div style="width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; right: 2px;"></div>
                    </div>
                </div>

                <div class="settings-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="ph ph-bell" style="font-size: 1.2rem; color: var(--text-primary);"></i>
                        <span>Bildirimler</span>
                    </div>
                    <div style="width: 40px; height: 20px; background: var(--accent); border-radius: 20px; position: relative;">
                        <div style="width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; right: 2px;"></div>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="section-title" style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; margin-top: 24px;">Destek</h3>

                <div class="settings-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="ph ph-question" style="font-size: 1.2rem; color: var(--text-primary);"></i>
                        <span>Yardım ve Destek</span>
                    </div>
                    <i class="ph ph-caret-right" style="color: var(--text-tertiary);"></i>
                </div>

                 <div class="settings-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="ph ph-shield" style="font-size: 1.2rem; color: var(--text-primary);"></i>
                        <span>Gizlilik Politikası</span>
                    </div>
                    <i class="ph ph-caret-right" style="color: var(--text-tertiary);"></i>
                </div>
            </div>

            <div class="settings-section" style="margin-top: 32px;">
                <button onclick="handleLogout()" style="width: 100%; padding: 14px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i class="ph ph-sign-out"></i>
                    Çıkış Yap
                </button>
                <div style="text-align: center; color: var(--text-tertiary); font-size: 0.75rem; margin-top: 16px;">
                    Finmates v1.0.0
                </div>
            </div>
        </div>
    `;
}

window.handleLogout = async () => {
    await sb.auth.signOut();
    localStorage.removeItem('finmates_auth'); // Clear legacy if exists
    localStorage.removeItem('finmates_user');
    navigate('/login');
};
