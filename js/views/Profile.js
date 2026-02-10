// Helper to determine active tab (persisted in memory or default)
window.activeProfileTab = window.activeProfileTab || 'my_portfolios';

async function ProfileView() {
    let sbUser = window.currentUser;

    // In production, use real user
    if (typeof window.DEV_MODE !== 'undefined' && !window.DEV_MODE) {
        sbUser = await sb_auth.getUser();
    }

    // Default Profile Data (Mockup Fallback)
    let profile = {
        name: sbUser?.user_metadata?.full_name || 'Alex Thompson',
        username: sbUser?.email?.split('@')[0] || 'alex_invests',
        followers: '12.5k',
        following: '840',
        likes: '45k',
        avatar: sbUser?.user_metadata?.avatar_url || 'https://randomuser.me/api/portraits/men/32.jpg'
    };

    // Try to fetch real profile info if available
    if (typeof window.DEV_MODE === 'undefined' || !window.DEV_MODE) {
        const { data: dbProfile } = await sb
            .from('profiles')
            .select('*')
            .eq('id', sbUser?.id)
            .single();

        if (dbProfile) {
            profile = {
                ...profile,
                name: dbProfile.full_name || profile.name,
                username: dbProfile.username || profile.username,
                bio: dbProfile.bio || profile.bio,
                avatar: dbProfile.avatar_url || profile.avatar
            };
        }

        // Fetch Followers count
        const { count: followersCount } = await sb
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', sbUser?.id);

        profile.followers = followersCount || 0;
    }

    // --- FETCH DATA FOR TABS ---

    // 1. Fetch All Posts (Mock or Real) to filter
    let allPosts = [];
    if (typeof window.DEV_MODE !== 'undefined' && window.DEV_MODE) {
        allPosts = [...(window.MOCK_POSTS || [])];
    } else {
        // Real Fetch
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

        if (!error && posts) {
            // Fetch Reactions for these posts to get accurate stats
            const postIds = posts.map(p => p.id);
            const { data: allReactions } = await sb
                .from('reactions')
                .select('*')
                .in('post_id', postIds);

            // Sync localStorage reactions for the user
            if (sbUser) {
                const myReactionsMap = {};
                (allReactions || [])
                    .filter(r => r.user_id === sbUser.id)
                    .forEach(r => myReactionsMap[r.post_id] = r.type);
                localStorage.setItem('finmates_reactions', JSON.stringify(myReactionsMap));
            }

            // Map DB posts to UI structure with real stats
            allPosts = posts.map(p => {
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
                        username: p.profiles?.username ? `@${p.profiles.username}` : 'user',
                        avatar: p.profiles?.avatar_url ? `<img src="${p.profiles.avatar_url}" style="width:100%;height:100%;border-radius:50%">` : 'U',
                        date: new Date(p.created_at).toLocaleDateString()
                    },
                    title: p.title,
                    description: p.description,
                    assets: p.assets,
                    user_id: p.user_id,
                    stats: stats
                };
            });
        }
    }

    // 2. Filter for Tabs
    let contentHTML = '';
    const activeTab = window.activeProfileTab;

    if (activeTab === 'my_portfolios') {
        // Filter By My ID
        // In DEV_MODE mock, user_id might not match well, so we might show all or specific mocks
        // Let's assume MOCK_POSTS have varied IDs or we just show a subset. 
        // For real app:
        const myId = sbUser?.id;
        console.log('Profile Filtering Diagnostics:', {
            activeTab: activeTab,
            myId: myId,
            allPostsCount: allPosts.length,
            postsWithMyId: allPosts.filter(p => p.user_id === myId).length
        });

        const myPosts = allPosts.filter(p => p.user_id === myId || (typeof window.DEV_MODE !== 'undefined' && window.DEV_MODE)); // Show all in dev mode for demo if IDs don't match

        if (myPosts.length > 0) {
            contentHTML = myPosts.map(post => typeof LinkFeedItem === 'function' ? LinkFeedItem(post) : '').join('');
        } else {
            contentHTML = `
                <div class="empty-state">
                    <i class="ph ph-folder-notch-open empty-state-icon"></i>
                    <div class="empty-state-text">Henüz portföy oluşturmadınız.</div>
                    <button class="btn-primary" onclick="navigate('/create')" style="margin-top:12px; width:auto; padding: 8px 16px;">Portföy Oluştur</button>
                </div>
            `;
        }

    } else if (activeTab === 'liked') {
        // Filter by Liked
        // We need local storage or DB check for reactions
        const myReactions = JSON.parse(localStorage.getItem('finmates_reactions') || '{}');
        // Filter any post that has ANY type of reaction from the user
        const likedPostIds = Object.keys(myReactions);

        const likedPosts = allPosts.filter(p => likedPostIds.includes(String(p.id)));

        if (likedPosts.length > 0) {
            contentHTML = likedPosts.map(post => typeof LinkFeedItem === 'function' ? LinkFeedItem(post) : '').join('');
        } else {
            contentHTML = `
                <div class="empty-state">
                    <i class="ph ph-heart empty-state-icon"></i>
                    <div class="empty-state-text">Henüz beğendiğiniz bir portföy yok.</div>
                </div>
            `;
        }
    }


    // --- TEMPLATE ---
    return `
        <div class="profile-container" style="padding-top: 20px;">
            <!-- Header Actions REMOVED -->
            
            <!-- Profile Info Class -->
            <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 24px;">
                <div style="width: 80px; height: 80px; padding: 3px; border: 2px solid var(--color-info); border-radius: 50%; margin-bottom: 12px;">
                    <img src="${profile.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0;">${profile.name}</h2>
                    <i class="ph-fill ph-seal-check" style="color: var(--color-info); font-size: 18px;"></i>
                </div>
                <div style="color: var(--color-info); font-size: 14px;">@${profile.username}</div>
            </div>

            <!-- Stats Row -->
            <div style="display: flex; justify-content: center; gap: 40px; margin-bottom: 24px;">
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${profile.followers}</div>
                    <div style="font-size: 11px; color: var(--text-tertiary); letter-spacing: 0.5px; margin-top: 2px;">FOLLOWERS</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${profile.following}</div>
                    <div style="font-size: 11px; color: var(--text-tertiary); letter-spacing: 0.5px; margin-top: 2px;">FOLLOWING</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${profile.likes}</div>
                    <div style="font-size: 11px; color: var(--text-tertiary); letter-spacing: 0.5px; margin-top: 2px;">LIKES</div>
                </div>
            </div>

            <!-- TABS -->
            <div class="feed-tabs" style="display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 16px;">
                <button onclick="switchProfileTab('my_portfolios')" class="tab-item ${activeTab === 'my_portfolios' ? 'active' : ''}" style="flex: 1; background: none; border: none; padding: 12px; color: ${activeTab === 'my_portfolios' ? 'var(--text-primary)' : 'var(--text-tertiary)'}; border-bottom: 2px solid ${activeTab === 'my_portfolios' ? 'var(--color-brand)' : 'transparent'}; font-weight: 600; font-size: 13px; cursor: pointer; letter-spacing: 0.5px;">
                    PORTFÖYLERİM
                </button>
                <button onclick="switchProfileTab('liked')" class="tab-item ${activeTab === 'liked' ? 'active' : ''}" style="flex: 1; background: none; border: none; padding: 12px; color: ${activeTab === 'liked' ? 'var(--text-primary)' : 'var(--text-tertiary)'}; border-bottom: 2px solid ${activeTab === 'liked' ? 'var(--color-brand)' : 'transparent'}; font-weight: 600; font-size: 13px; cursor: pointer; letter-spacing: 0.5px;">
                    BEĞENDİKLERİM
                </button>
            </div>

            <!-- Tab Content -->
            <div class="feed-container" style="padding-top: 0; padding-bottom: 80px;">
                ${contentHTML}
            </div>
            
        </div>
    `;
}

// Global switcher
window.switchProfileTab = (tab) => {
    window.activeProfileTab = tab;
    // Re-render
    navigate('/profile');
};
