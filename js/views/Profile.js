async function ProfileView() {
    const sbUser = await sb_auth.getUser();

    // Get profile from DB or use session data as fallback
    let profile = {
        name: sbUser?.user_metadata?.full_name || 'Finmate Kullanıcısı',
        username: sbUser?.email?.split('@')[0] || 'kullanici',
        bio: 'Finmates topluluğuna yeni katıldı.',
        followers: 0,
        following: 0,
        likes: 0,
        avatar: sbUser?.user_metadata?.avatar_url || null
    };

    // Try to fetch real profile from Supabase
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

    // Following count: Get from localStorage (already synced with DB + Mock users)
    const followList = JSON.parse(localStorage.getItem('finmates_following') || '[]');

    profile.followers = followersCount || 0;
    profile.following = followList.length;

    const user = profile;

    // Helper to get user's portfolios
    const getMyPortfolios = async () => {
        const { data: portfolios } = await sb
            .from('posts')
            .select('*')
            .eq('user_id', sbUser?.id)
            .order('created_at', { ascending: false });

        return portfolios || [];
    };

    // Helper to get liked portfolios (simplified for now)
    const getLikedPortfolios = () => {
        const likes = JSON.parse(localStorage.getItem('finmates_likes') || '[]');
        const mock = window.MOCK_POSTS || [];
        return mock.filter(p => likes.includes(p.id));
    };

    const myPortfolios = await getMyPortfolios();
    const likedPortfolios = getLikedPortfolios();

    return `
        <div class="profile-header">
            <div class="profile-avatar">
                ${user.avatar ? `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : '<i class="ph ph-user"></i>'}
            </div>
            <div class="profile-info">
                <h1>${user.name}</h1>
                <div class="profile-handle">@${user.username}</div>
                <div class="profile-bio">${user.bio}</div>
                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-value">${user.followers}</span>
                        <span class="stat-label">Takipçi</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${user.following}</span>
                        <span class="stat-label">Takip</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${user.likes}</span>
                        <span class="stat-label">Beğeni</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="profile-tabs">
            <button class="profile-tab active" onclick="switchProfileTab('my-portfolios')">Portföylerim</button>
            <button class="profile-tab" onclick="switchProfileTab('liked-portfolios')">Beğendiklerim</button>
        </div>

        <div class="profile-content">
            <div id="my-portfolios-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span style="color: var(--text-secondary);">${myPortfolios.length} Portföy</span>
                    <button class="btn btn-primary btn-sm" onclick="navigate('/create')">
                        <i class="ph ph-plus"></i> Yeni Portföy
                    </button>
                </div>
                
                <div id="my-portfolio-list">
                    ${myPortfolios.length > 0 ? myPortfolios.map(p => {
        return renderPortfolioItem({
            ...p,
            user: {
                username: user.username,
                avatar: user.avatar ? `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%">` : 'U',
                date: new Date(p.created_at).toLocaleDateString()
            }
        }, true);
    }).join('') : `
                        <div class="empty-state">
                            <i class="ph ph-user empty-state-icon"></i>
                            <div class="empty-state-text">Henüz portföy oluşturmadınız</div>
                            <div style="color: var(--text-secondary); font-size: var(--font-sm); margin-bottom: 20px;">İlk portföyünüzü oluşturarak başlayın</div>
                            <button class="btn btn-primary" onclick="navigate('/create')">
                                <i class="ph ph-plus"></i> Portföy Oluştur
                            </button>
                        </div>
                    `}
                </div>
            </div>

            <div id="liked-portfolios-content" style="display: none;">
                <div id="liked-portfolio-list">
                    ${likedPortfolios.length > 0 ? likedPortfolios.map(p => renderPortfolioItem(p, false)).join('') : `
                        <div class="empty-state">
                            <i class="ph ph-heart empty-state-icon"></i>
                            <div class="empty-state-text">Henüz beğendiğiniz portföy yok</div>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Reuse FeedItem logic but maybe simplified or with Edit buttons
function renderPortfolioItem(portfolio, isEditable) {
    // We can reuse LinkFeedItem logic but returning string directly
    // Ideally we should reuse the existing LinkFeedItem component but passing 'isEditable' flag
    // For now, let's manually construct a FeedItem-like string or better:
    // We can call LinkFeedItem(portfolio) but we need to inject the Edit button if isEditable

    // Quick hack: Render Standard Feed Item and inject Edit button if needed
    // But since FeedItem returns a string, we can wrap it or modify it.

    let itemHtml = LinkFeedItem(portfolio);

    if (isEditable) {
        // Inject Edit button into the top right or bottom actions
        // Let's add an Edit button to the actions area
        const editBtn = `
            <button class="action-btn" onclick="editPortfolio('${portfolio.id}')" style="margin-right: auto; color: var(--primary);">
                <i class="ph ph-pencil-simple"></i>
                <span>Düzenle</span>
            </button>
        `;

        // This is a bit brittle, replacing the timestamp or adding to actions
        // A better way is to Modify LinkFeedItem to accept options, but we can't easily change it right now without breaking Feed.
        // Let's just create a custom wrapper for Profile list

        return `
            <div style="margin-bottom: 20px; position: relative;">
                ${itemHtml}
                ${isEditable ? `
                    <div style="position: absolute; top: 16px; right: 16px;">
                        <button onclick="editPortfolio('${portfolio.id}')" style="background: var(--surface-hover); border: none; color: var(--text-primary); padding: 8px; border-radius: 50%; cursor: pointer;">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    return `<div style="margin-bottom: 20px;">${itemHtml}</div>`;
}

function switchProfileTab(tabName) {
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(t => t.classList.remove('active'));

    if (tabName === 'my-portfolios') {
        tabs[0].classList.add('active');
        document.getElementById('my-portfolios-content').style.display = 'block';
        document.getElementById('liked-portfolios-content').style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        document.getElementById('my-portfolios-content').style.display = 'none';
        document.getElementById('liked-portfolios-content').style.display = 'block';
    }
}

function editPortfolio(id) {
    // Navigate to CreatePortfolio with ID
    // Since our router is simple, we might need to store the 'editId' in localStorage or a global variable
    // temporary hack:
    window.EDIT_PORTFOLIO_ID = id;
    navigate('/create');
}
