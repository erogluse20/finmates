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
                        <span>Profili Görüntüle</span>
                    </div>
                    <i class="ph ph-caret-right" style="color: var(--text-tertiary);"></i>
                </div>

                <!-- Username Setting -->
                <div class="settings-item" style="padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 0.95rem; font-weight: 500;">Kullanıcı Adı</span>
                        <span id="usernameStatus" style="font-size: 0.8rem; color: var(--text-tertiary);"></span>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <div style="position: relative; flex: 1;">
                            <span style="position: absolute; left: 12px; top: 10px; color: var(--text-tertiary);">@</span>
                            <input type="text" id="usernameInput" placeholder="kullaniciadi" style="width: 100%; padding: 8px 12px 8px 32px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
                        </div>
                        <button id="saveUsernameBtn" onclick="saveUsername()" class="btn-primary" style="padding: 0 16px; font-size: 0.9rem;" disabled>Kaydet</button>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">
                        *Kullanıcı adı sadece 1 kez değiştirilebilir.
                    </div>
                </div>

                <div class="settings-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color); cursor: pointer; opacity: 0.5;">
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
                <button onclick="handleLogout()" class="btn-danger">
                    <i class="ph ph-sign-out" style="font-size: 1.25rem;"></i>
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

// Initialize Settings Page Logic
window.initSettings = async () => {
    const input = document.getElementById('usernameInput');
    const btn = document.getElementById('saveUsernameBtn');
    const status = document.getElementById('usernameStatus');

    if (!input || !window.currentUser) return;

    // Fetch current profile
    const { data: profile, error } = await window.sb
        .from('profiles')
        .select('username, username_changed')
        .eq('id', window.currentUser.id)
        .single();

    if (error) {
        console.error('Error fetching profile settings:', error);
        return;
    }

    if (profile) {
        input.value = profile.username || '';

        if (profile.username_changed) {
            input.disabled = true;
            btn.disabled = true;
            btn.textContent = 'Değiştirildi';
            btn.style.opacity = '0.5';
            status.textContent = 'Kilitli';
            status.style.color = 'var(--text-tertiary)';
        } else {
            // Enable editing
            input.addEventListener('input', () => {
                const isChanged = input.value.trim() !== (profile.username || '');
                const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(input.value.trim()); // Basic regex
                btn.disabled = !(isChanged && isValid);
            });
        }
    }
};

window.saveUsername = async () => {
    const input = document.getElementById('usernameInput');
    const btn = document.getElementById('saveUsernameBtn');
    const newUsername = input.value.trim();

    if (!newUsername) return;

    btn.disabled = true;
    btn.textContent = 'Kontrol ediliyor...';

    try {
        // 1. Check uniqueness
        const { data: existing, error: checkError } = await window.sb
            .from('profiles')
            .select('id')
            .eq('username', newUsername)
            .single();

        if (existing && existing.id !== window.currentUser.id) {
            alert('Bu kullanıcı adı zaten alınmış.');
            btn.textContent = 'Kaydet';
            btn.disabled = false;
            return;
        }

        // 2. Update Profile
        const { error: updateError } = await window.sb
            .from('profiles')
            .update({
                username: newUsername,
                username_changed: true
            })
            .eq('id', window.currentUser.id);

        if (updateError) throw updateError;

        // Success
        btn.textContent = 'Kaydedildi';
        input.disabled = true;

        // Refresh local user data if needed or reload
        alert('Kullanıcı adınız başarıyla değiştirildi!');

    } catch (err) {
        console.error('Error updating username:', err);
        alert('Bir hata oluştu: ' + err.message);
        btn.textContent = 'Kaydet';
        btn.disabled = false;
    }
};
