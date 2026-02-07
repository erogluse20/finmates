function LoginView() {
    // Check if user is already logged in (redirect if so)
    sb_auth.getUser().then(user => {
        if (user) navigate('/');
    });

    return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 24px; text-align: center; background: var(--bg-body);">
            
            <div style="width: 70px; height: 70px; background: var(--color-brand); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; margin-bottom: 28px; box-shadow: var(--shadow-md);">
                <i class="ph-fill ph-trend-up" style="font-size: 36px; color: #fff;"></i>
            </div>
            
            <h1 style="font-size: 1.75rem; font-weight: 600; margin-bottom: 10px; color: var(--text-primary);">Finmates'e Hoşgeldin</h1>
            <p style="color: var(--text-secondary); margin-bottom: 40px; font-size: 0.95rem; line-height: 1.5; max-width: 300px;">Yatırım topluluğuna katılmak için favori hesabınla giriş yap.</p>
            
            <div style="width: 100%; max-width: 300px; display: flex; flex-direction: column; gap: 10px;">
                
                <button onclick="performLogin('google')" class="social-login-btn google-btn">
                    <i class="ph-bold ph-google-logo"></i>
                    <span>Google ile Devam Et</span>
                </button>

                <button onclick="performLogin('x')" class="social-login-btn x-btn">
                    <i class="ph-bold ph-x-logo"></i>
                    <span>X ile Devam Et</span>
                </button>

                <button onclick="performLogin('linkedin')" class="social-login-btn linkedin-btn">
                    <i class="ph-bold ph-linkedin-logo"></i>
                    <span>LinkedIn ile Devam Et</span>
                </button>
            </div>

            <button onclick="navigate('/')" style="margin-top: 32px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: var(--radius-md); transition: all 0.2s ease;">
                Ziyaretçi Olarak Göz At 
                <i class="ph-bold ph-arrow-right"></i>
            </button>
        </div>

        <style>
            .social-login-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                width: 100%;
                padding: 14px;
                border-radius: var(--radius-md);
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid var(--border-color);
            }

            .google-btn { background: #fff; color: #000; }
            .x-btn { background: #000; color: #fff; border-color: #333; }
            .linkedin-btn { background: #0a66c2; color: #fff; border-color: #0a66c2; }

            .social-login-btn:hover {
                transform: translateY(-1px);
                box-shadow: var(--shadow-sm);
            }

            .social-login-btn:active {
                transform: translateY(0);
            }
        </style>
    `;
}

// Supabase REAL Login Handler
window.performLogin = async (provider) => {
    const btn = event.currentTarget;
    const btnText = btn.querySelector('span');
    const originalText = btnText.innerText;
    btnText.innerText = 'Bağlanıyor...';

    // Robust redirect: ensure we go back to the base app path
    let redirectTo = window.location.origin + window.location.pathname;

    // If we're on a subpage like /login, redirect back to the root if possible
    if (redirectTo.endsWith('/login')) {
        redirectTo = redirectTo.replace('/login', '/');
    }
    if (!redirectTo.endsWith('/')) {
        redirectTo += '/';
    }

    console.log('Logging in with provider:', provider);
    console.log('Redirecting to:', redirectTo);

    // For X/Twitter OAuth 2.0, we use a minimal set of scopes.
    // 'users.email' (often sent by default) causes issues if not enabled in Portal.
    const options = {
        redirectTo: redirectTo
    };

    if (provider === 'x' || provider === 'twitter') {
        // Using explicit safe scopes to ensure stability
        options.scopes = 'users.read tweet.read offline.access';
    }

    const { data, error } = await sb.auth.signInWithOAuth({
        provider: provider,
        options: options
    });

    if (error) {
        console.error('Login error:', error);
        alert('Giriş başarısız: ' + error.message);
        btnText.innerText = originalText;
    }
};
