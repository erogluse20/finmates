// No imports - functions are global now

// Mock Data
// Mock Data
window.MOCK_POSTS = [
    {
        id: 1,
        user: { username: 'eroglus20', avatar: 'ES', date: '2025-12-10 14:26:08' },
        title: 'Uzun Vadeli Portföyüm',
        description: 'Bu portföyü 5 seneye kadar tutmak istiyorum. Uzun vade sonunda iyi bir fiyatta satıp ev-araba gibi yatırımlar yapmayı hedefliyorum.',
        stats: { likes: 12, insights: 4, different: 1, risks: 0 },
        assets: [
            { symbol: 'AKBNK', percent: 27, color: '#ef4444', icon: '<i class="ph-fill ph-bank"></i>' },
            { symbol: 'AGESA', percent: 73, color: '#3b82f6', icon: 'A' },
        ]
    },
    {
        id: 2,
        user: { username: 'investor_x', avatar: 'IX', date: '2025-12-09 10:15:00' },
        title: 'Temettü Canavarı',
        description: 'Düzenli temettü ödeyen şirketlerden oluşan pasif gelir odaklı portföyüm. Hedefim finansal özgürlük.',
        stats: { likes: 45, insights: 12, different: 2, risks: 1 },
        assets: [
            { symbol: 'EREGL', percent: 30, color: '#10b981', icon: 'E' },
            { symbol: 'TUPRS', percent: 30, color: '#f59e0b', icon: 'T' },
            { symbol: 'FROTO', percent: 40, color: '#3b82f6', icon: 'F' }
        ]
    },
    {
        id: 3,
        user: { username: 'Caner Akdas', avatar: '<img src="https://ui-avatars.com/api/?name=Ca&background=random" style="width:100%;height:100%;border-radius:50%">', date: '2025-12-08 06:07:01' },
        title: 'Teknoloji Ağırlıklı',
        description: 'Yapay zeka ve teknoloji fonlarına ağırlık verdiğim büyüme odaklı portföy.',
        stats: { likes: 8, insights: 15, different: 5, risks: 2 },
        assets: [
            { symbol: 'AFT', percent: 40, color: '#10b981', icon: 'F' },
            { symbol: 'YAY', percent: 30, color: '#f59e0b', icon: 'F' },
            { symbol: 'BTC', percent: 30, color: '#f97316', icon: '<i class="ph-fill ph-currency-btc"></i>' }
        ]
    },
    {
        id: 4,
        user: { username: 'Kripto_Guru', avatar: 'KG', date: '2025-12-07 22:45:12' },
        title: 'Yüksek Risk / Yüksek Getiri',
        description: 'Tamamen altcoin sepeti. Sadece kaybetmeyi göze alabileceğiniz tutarla girin!',
        stats: { likes: 2, insights: 1, different: 8, risks: 15 },
        assets: [
            { symbol: 'ETH', percent: 50, color: '#6366f1', icon: '<i class="ph-fill ph-currency-eth"></i>' },
            { symbol: 'SOL', percent: 30, color: '#a855f7', icon: 'S' },
            { symbol: 'AVAX', percent: 20, color: '#ef4444', icon: 'A' }
        ]
    }
];

// Router logic
const routes = {
    '/': renderFeed,
    '/create': renderCreate,
    '/profile': ProfileView,

    '/settings': SettingsView,
    '/login': LoginView
};

// Global Auth Guard
window.checkAuth = async () => {
    const user = await window.sb_auth.getUser();
    window.currentUser = user; // Track globally
    if (!user) {
        navigate('/login');
        return false;
    }
    return true;
};

async function renderFeed() {
    // Ensure currentUser is set early
    window.currentUser = await window.sb_auth.getUser();

    // Show Loading
    document.getElementById('main-content').innerHTML = `
        <div style="display:flex; justify-content:center; padding:40px;">
            <i class="ph-bold ph-spinner ph-spin" style="font-size:32px; color:var(--primary)"></i>
        </div>
    `;

    // Fetch from Supabase
    const { data: posts, error } = await sb
        .from('posts')
        .select(`
            *,
            profiles (
                username,
                full_name,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Supabase fetch error:', error);
        return `<div style="padding:20px; color:red;">Veri yüklenemedi.</div>`;
    }

    // Fetch Reactions for all these posts to get counts
    const postIds = posts.map(p => p.id);
    const { data: allReactions } = await sb
        .from('reactions')
        .select('*')
        .in('post_id', postIds);

    // Sync user's own reactions to localStorage for instant UI
    if (window.currentUser) {
        const myReactions = {};
        allReactions?.filter(r => r.user_id === window.currentUser.id)
            .forEach(r => myReactions[r.post_id] = r.type);
        localStorage.setItem('finmates_reactions', JSON.stringify(myReactions));
    }

    // Combine with MOCK for now
    const allPosts = [...posts.map(p => {
        // Calculate counts for this post
        const postReactions = allReactions?.filter(r => r.post_id === p.id) || [];
        const stats = {
            likes: postReactions.filter(r => r.type === 'like').length,
            insights: postReactions.filter(r => r.type === 'insight').length,
            different: postReactions.filter(r => r.type === 'different').length,
            risks: postReactions.filter(r => r.type === 'risk').length
        };

        return {
            id: p.id,
            user: {
                username: p.profiles?.username || 'user',
                avatar: p.profiles?.avatar_url ? `<img src="${p.profiles.avatar_url}" style="width:100%;height:100%;border-radius:50%">` : 'U',
                date: new Date(p.created_at).toLocaleDateString()
            },
            title: p.title,
            description: p.description,
            assets: p.assets,
            stats: stats,
            user_id: p.user_id
        };
    }), ...window.MOCK_POSTS];

    // Sync Following list from DB if logged in - Merge with Mock follows
    const user = await window.sb_auth.getUser();
    if (user) {
        const { data: follows } = await sb
            .from('follows')
            .select('profiles:following_id(username)')
            .eq('follower_id', user.id);

        if (follows) {
            const dbFollowList = follows.map(f => f.profiles.username);
            const currentLocalFollows = JSON.parse(localStorage.getItem('finmates_following') || '[]');

            // Merge: Keep all real follows from DB + any mock follows already in local
            const mergedFollows = Array.from(new Set([...dbFollowList, ...currentLocalFollows]));
            localStorage.setItem('finmates_following', JSON.stringify(mergedFollows));
        }
    }

    // Check active tab state (default to 'featured')
    const activeFeedTab = window.activeFeedTab || 'featured';

    let contentHTML = '';

    if (activeFeedTab === 'featured') {
        contentHTML = allPosts.map(post => LinkFeedItem(post)).join('');
    } else {
        // Following Tab
        const followList = JSON.parse(localStorage.getItem('finmates_following') || '[]');
        const followingPosts = allPosts.filter(post => followList.includes(post.user.username));

        if (followingPosts.length > 0) {
            contentHTML = followingPosts.map(post => LinkFeedItem(post)).join('');
        } else {
            contentHTML = `
                <div class="empty-state">
                    <i class="ph ph-users empty-state-icon"></i>
                    <div class="empty-state-text">Henüz kimseyi takip etmiyorsunuz.</div>
                    <div style="color: var(--text-secondary); font-size: var(--font-sm);">Öne çıkanlardan ilginizi çeken portföyleri takip edebilirsiniz.</div>
                </div>
            `;
        }
    }

    if (!window.switchFeedTab) {
        window.switchFeedTab = (tab) => {
            window.activeFeedTab = tab;
            navigate('/');
        };
    }

    const feedTemplate = `
        <div class="feed-header-tabs" style="display: flex; background: var(--surface-card); margin-bottom: 16px; border-bottom: 1px solid var(--border-light); position: sticky; top: 0; z-index: 90;">
            <button onclick="switchFeedTab('featured')" style="flex: 1; padding: 16px; background: none; border: none; font-weight: 600; color: ${activeFeedTab === 'featured' ? 'var(--primary)' : 'var(--text-secondary)'}; border-bottom: 2px solid ${activeFeedTab === 'featured' ? 'var(--primary)' : 'transparent'}; cursor: pointer;">
                Öne Çıkanlar
            </button>
            <button onclick="switchFeedTab('following')" style="flex: 1; padding: 16px; background: none; border: none; font-weight: 600; color: ${activeFeedTab === 'following' ? 'var(--primary)' : 'var(--text-secondary)'}; border-bottom: 2px solid ${activeFeedTab === 'following' ? 'var(--primary)' : 'transparent'}; cursor: pointer;">
                Takip Ettiklerim
            </button>
        </div>
        <div class="feed-container">
            ${contentHTML}
        </div>
    `;

    document.getElementById('main-content').innerHTML = feedTemplate;
}

function renderCreate() {
    return `<div style="padding: 24px;">${CreatePortfolioView()}</div>`;
}

async function navigate(path) {
    window.currentPath = path; // Track for re-renders
    const mainContent = document.getElementById('main-content');
    const viewFn = routes[path] || routes['/'];

    const result = viewFn();
    // If viewFn is async, it returns a promise. If it's a regular function returning a string, we handle it.
    if (result instanceof Promise) {
        const content = await result;
        if (content) mainContent.innerHTML = content;
    } else {
        mainContent.innerHTML = result;
    }

    // Post-render hooks
    if (path === '/create') {
        initCreatePortfolio();
    }

    // Update active nav state
    document.querySelectorAll('.nav-item, .add-btn').forEach(el => {
        el.classList.remove('active');
        // Simple heuristic for active state
        if (path === '/' && el.classList.contains('nav-item') && el.getAttribute('href') === '#') el.classList.add('active'); // Home is robust default

        // Manual check for icon matches if needed (or rely on listeners updating style)
        // Since we don't have unique IDs on nav items, strict "active" class toggle is tricky in generic way.
        // Let's explicitly handle it in the listener or simple checks here.
    });

    // Explicit Active State Management
    const navItems = document.querySelectorAll('.nav-item');
    if (path === '/') navItems[0].classList.add('active');
    if (path === '/profile') navItems[1].classList.add('active');
    // The bell icon (index 2 in nav-items excluding add-btn wrapper?) 
    // Bottom nav structure: a, a, div(btn), a, a
    // navItems are: 0:Home, 1:Profile(Calendar icon currently?), 2:Bell, 3:Gear
    if (path === '/settings') navItems[3].classList.add('active');
}

function init() {
    // Initial Render
    navigate('/');

    // Attach Nav Listeners
    const addBtn = document.querySelector('.add-btn');
    addBtn.addEventListener('click', async () => {
        if (await checkAuth()) navigate('/create');
    });

    const homeBtn = document.querySelector('.nav-item:first-child');
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/');
    });

    const profileBtn = document.querySelector('.ph-calendar-blank').closest('.nav-item');
    if (profileBtn) {
        profileBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (await checkAuth()) navigate('/profile');
        });
    }

    const settingsBtn = document.querySelector('.ph-gear').closest('.nav-item');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (await checkAuth()) navigate('/settings');
        });
    }
}

// Start App
document.addEventListener('DOMContentLoaded', init);
