function LoginView() {
    // Check if user is already logged in (redirect if so)
    sb_auth.getUser().then(user => {
        if (user) navigate('/');
    });

    return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 24px; text-align: center; background: var(--background);">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);">
                <i class="ph-fill ph-trend-up" style="font-size: 40px; color: white;"></i>
            </div>
            
            <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px;">Finmates'e Hoşgeldin</h1>
            <p style="color: var(--text-secondary); margin-bottom: 48px; font-size: 1rem; line-height: 1.5; max-width: 300px;">Yatırım topluluğuna katılmak için favori hesabınla giriş yap.</p>
            
            <div style="width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 12px;">
                
                <!-- Real Supabase Google Login -->
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

            <button onclick="navigate('/')" style="margin-top: 32px; background: none; border: none; color: var(--text-tertiary); font-size: 0.9rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 12px;">
                Ziyaretçi Olarak Göz At 
                <i class="ph-bold ph-arrow-right"></i>
            </button>
        </div>

        <style>
            .social-login-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                width: 100%;
                padding: 16px;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid transparent;
            }

            .google-btn {
                background: white;
                color: #1f2937;
                border-color: #e5e7eb;
            }
            .google-btn:hover {
                background: #f9fafb;
                border-color: #d1d5db;
            }

            .x-btn {
                background: #000;
                color: white;
            }
            .x-btn:hover {
                background: #222;
            }

            .linkedin-btn {
                background: #0a66c2;
                color: white;
            }
            .linkedin-btn:hover {
                background: #004182;
            }

            /* Dark Mode Adjustments */
            @media (prefers-color-scheme: dark) {
                .google-btn {
                    background: #2d3748;
                    color: white;
                    border-color: #4a5568;
                }
                .google-btn:hover {
                    background: #4a5568;
                }
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

    const { data, error } = await sb.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });

    if (error) {
        console.error('Login error:', error);
        alert('Giriş başarısız: ' + error.message);
        btnText.innerText = originalText;
    }
};
