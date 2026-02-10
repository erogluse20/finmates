// No imports - functions are global now

// Mock Data
window.MOCK_POSTS = [
    {
        id: 1,
        user: { username: 'eroglus20', avatar: 'ES', date: '2025-12-10 14:26:08' },
        user_id: 'dev-user-123', // Matches mock currentUser for Edit testing
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
    '/notifications': () => '<div style="padding:20px; text-align:center;">Bildirimler (Coming Soon)</div>',
    '/settings': SettingsView,
    '/login': LoginView
};

// Development Mode - Set to true for local testing without login
// Development Mode - Set to true for local testing without login
window.DEV_MODE = false; // Set to false before deploying to production
const DEV_MODE = window.DEV_MODE; // Local alias for this file

// Global Auth Guard
window.checkAuth = async () => {
    // In DEV_MODE, always return true with mock user
    if (DEV_MODE) {
        window.currentUser = {
            id: 'dev-user-123',
            email: 'dev@finmates.com',
            user_metadata: {
                full_name: 'Dev User',
                avatar_url: null
            }
        };
        return true;
    }

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
    if (!DEV_MODE) {
        window.currentUser = await window.sb_auth.getUser();
    }

    // Show Loading
    document.getElementById('main-content').innerHTML = `
        <div style="display:flex; justify-content:center; padding:40px;">
            <i class="ph-bold ph-spinner ph-spin" style="font-size:32px; color:var(--color-brand)"></i>
        </div>
    `;

    let allPosts = [];
    let allReactions = []; // Declare allReactions here

    // Data fetching logic
    if (typeof window.DEV_MODE !== 'undefined' && window.DEV_MODE) {
        // In development, use only mock data
        allPosts = [...window.MOCK_POSTS];
    } else {
        // Fetch from Supabase
        const { data: dbPosts, error: postsError } = await sb
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

        if (postsError) {
            console.error('Error fetching feed:', postsError);
            allPosts = [...window.MOCK_POSTS]; // Fallback to mock on error
        } else {
            // Fetch Reactions for all these posts to get counts
            const postIds = (dbPosts || []).map(p => p.id);
            const { data: allReactions, error: reactionsError } = await sb
                .from('reactions')
                .select('*')
                .in('post_id', postIds);

            if (reactionsError) console.warn('Error fetching reactions:', reactionsError);

            // Fetch User's own reactions to sync localStorage
            if (window.currentUser) {
                const myReactions = {};
                (allReactions || [])
                    .filter(r => r.user_id === window.currentUser.id)
                    .forEach(r => myReactions[r.post_id] = r.type);
                localStorage.setItem('finmates_reactions', JSON.stringify(myReactions));
            }

            // Map DB posts to UI structure with real stats
            allPosts = (dbPosts || []).map(p => {
                const postReactions = (allReactions || []).filter(r => r.post_id === p.id);
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
            });
        }
    }
    // Check active tab state (default to 'featured')
    const activeFeedTab = window.activeFeedTab || 'featured';

    let contentHTML = '';

    // Helper to render a post safely
    const renderPost = (post) => {
        // Use LinkFeedItem which is the actual component name in FeedItem.js
        if (typeof LinkFeedItem === 'function') return LinkFeedItem(post);

        // Fallback if component is missing
        return `
            <div class="card" style="margin-bottom:20px; padding:16px;">
                <div style="font-weight:bold; margin-bottom:8px;">${post.title}</div>
                <div>${post.description}</div>
            </div>
        `;
    };

    if (activeFeedTab === 'featured') {
        contentHTML = allPosts.map(post => renderPost(post)).join('');
    } else {
        // Following Tab
        const followList = JSON.parse(localStorage.getItem('finmates_following') || '[]');
        const followingPosts = allPosts.filter(post => followList.includes(post.user.username));

        if (followingPosts.length > 0) {
            contentHTML = followingPosts.map(post => renderPost(post)).join('');
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
        <div class="feed-header" style="position: sticky; top: 0; background: var(--bg-body); z-index: 90; padding: 10px 16px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="img/logo.png" style="width: 56px; height: 56px; object-fit: contain;">
                    <span style="font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px;">Finmates</span>
                </div>
            </div>
            
            <div class="feed-tabs" style="display: flex; border-bottom: 1px solid var(--border-color); margin-top: 8px;">
                <button onclick="switchFeedTab('featured')" class="tab-item ${activeFeedTab === 'featured' ? 'active' : ''}" style="flex: 1; background: none; border: none; padding: 12px; color: ${activeFeedTab === 'featured' ? 'var(--text-primary)' : 'var(--text-tertiary)'}; border-bottom: 2px solid ${activeFeedTab === 'featured' ? 'var(--color-brand)' : 'transparent'}; font-weight: 600; font-size: 13px; cursor: pointer; letter-spacing: 0.5px;">
                    ANA SAYFA
                </button>
                <button onclick="switchFeedTab('following')" class="tab-item ${activeFeedTab === 'following' ? 'active' : ''}" style="flex: 1; background: none; border: none; padding: 12px; color: ${activeFeedTab === 'following' ? 'var(--text-primary)' : 'var(--text-tertiary)'}; border-bottom: 2px solid ${activeFeedTab === 'following' ? 'var(--color-brand)' : 'transparent'}; font-weight: 600; font-size: 13px; cursor: pointer; letter-spacing: 0.5px;">
                    TAKİP EDİLENLER
                </button>
            </div>
        </div>
        <div class="feed-container" style="padding-top: 10px;">
            ${contentHTML}
        </div>
        <div style="height: 20px;"></div>
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
    document.querySelectorAll('.nav-item, .add-btn').forEach(el => el.classList.remove('active'));

    // Explicit Active State Management
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems.length >= 4) {
        if (path === '/') navItems[0].classList.add('active'); // Home
        if (path === '/explore') navItems[1].classList.add('active'); // Explore/Calendar
        if (path === '/notifications') navItems[2].classList.add('active'); // Bell
        if (path === '/settings') navItems[3].classList.add('active'); // Gear
    }
}

// Publish pending portfolio after login
window.publishPendingPortfolio = async function () {
    const pendingData = localStorage.getItem('finmates_pending_portfolio');
    if (!pendingData) return;

    try {
        const portfolio = JSON.parse(pendingData);
        const user = await window.sb_auth.getUser();

        if (!user) {
            console.warn('No user found, cannot publish pending portfolio');
            return;
        }

        const postPayload = {
            user_id: user.id,
            title: portfolio.title,
            description: portfolio.description,
            assets: portfolio.assets
        };

        console.log('Publishing pending portfolio:', postPayload);
        const { data, error } = await window.sb.from('posts').insert(postPayload).select();

        if (error) {
            console.error('Error publishing pending portfolio:', error);
            alert('Portföy paylaşılırken bir hata oluştu: ' + error.message);
            return;
        }

        console.log('Pending portfolio published successfully:', data);
        // Clear pending portfolio from localStorage
        localStorage.removeItem('finmates_pending_portfolio');

    } catch (err) {
        console.error('Error parsing pending portfolio:', err);
        localStorage.removeItem('finmates_pending_portfolio');
    }
};

async function init() {
    // Check for existing session first
    if (DEV_MODE) {
        // In development, use mock user
        window.currentUser = {
            id: 'dev-user-123',
            email: 'dev@finmates.com',
            user_metadata: {
                full_name: 'Dev User',
                avatar_url: null
            }
        };
    } else {
        const user = await window.sb_auth.getUser();
        window.currentUser = user;
    }

    // Check for pending portfolio and publish if user is logged in
    if (window.currentUser) {
        await window.publishPendingPortfolio();
    }

    // Initial Render
    const returnPath = localStorage.getItem('finmates_return_to');
    if (window.currentUser && returnPath && returnPath !== '/login') {
        localStorage.removeItem('finmates_return_to');
        navigate(returnPath);
    } else {
        navigate('/');
    }

    // Attach Nav Listeners
    const addBtn = document.querySelector('.add-btn');

    // Global Edit Handler
    window.triggerEditPortfolio = (postId) => {
        window.EDIT_PORTFOLIO_ID = postId;
        navigate('/create');
    };
    addBtn.addEventListener('click', () => {
        navigate('/create');
    });

    const homeBtn = document.querySelector('.nav-item:first-child');
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/');
    });

    const calendarBtn = document.querySelector('.ph-calendar-blank').closest('.nav-item');
    if (calendarBtn) {
        calendarBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            // Calendar is now "Portfolios" / Profile view
            if (await checkAuth()) navigate('/profile');
        });
    }

    const notifBtn = document.querySelector('.ph-bell').closest('.nav-item');
    if (notifBtn) {
        notifBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (await checkAuth()) navigate('/notifications');
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
