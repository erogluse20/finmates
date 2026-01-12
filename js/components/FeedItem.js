function LinkFeedItem(post) {
    // Calculate dynamic conic-gradient
    let gradientString = '';
    let currentPercent = 0;

    post.assets.forEach((asset, index) => {
        const start = currentPercent;
        currentPercent += asset.percent;
        const end = currentPercent;

        // Use asset color or fallback
        const color = asset.color || 'var(--color-brand)';

        gradientString += `${color} ${start}% ${end}%${index < post.assets.length - 1 ? ', ' : ''}`;
    });

    const conicGradient = `conic-gradient(${gradientString})`;

    // REACTION LOGIC
    // Data Structure Migration: Array -> Object
    let reactions = JSON.parse(localStorage.getItem('finmates_reactions'));

    // BACKWARD COMPATIBILITY: Migrate old array if exists and new object doesn't
    if (!reactions) {
        const oldLikes = JSON.parse(localStorage.getItem('finmates_likes') || '[]');
        if (Array.isArray(oldLikes)) {
            reactions = {};
            oldLikes.forEach(id => reactions[id] = 'like'); // Default to standard like
            localStorage.setItem('finmates_reactions', JSON.stringify(reactions));
        } else {
            reactions = {};
        }
    }

    const myReaction = reactions[post.id]; // 'like', 'insight', 'different', 'risk' or undefined

    // Determine Icon and Color based on reaction
    let mainBtnIcon = 'ph ph-thumbs-up';
    let mainBtnText = 'Beğen';
    let mainBtnClass = ''; // For color

    if (myReaction === 'like') {
        mainBtnIcon = 'ph-fill ph-thumbs-up';
        mainBtnClass = 'btn-reacted-like';
        mainBtnText = 'Beğendim';
    } else if (myReaction === 'insight') {
        mainBtnIcon = 'ph-fill ph-lightbulb';
        mainBtnClass = 'btn-reacted-insight';
        mainBtnText = 'Öğretici';
    } else if (myReaction === 'different') {
        mainBtnIcon = 'ph-fill ph-binoculars'; // Using Binoculars as "View"
        mainBtnClass = 'btn-reacted-different';
        mainBtnText = 'Farklı';
    } else if (myReaction === 'risk') {
        mainBtnIcon = 'ph-fill ph-warning';
        mainBtnClass = 'btn-reacted-risk';
        mainBtnText = 'Riskli';
    }

    // FOLLOW LOGIC
    const followList = JSON.parse(localStorage.getItem('finmates_following') || '[]');
    const isFollowing = followList.includes(post.user.username);
    const followBtnText = isFollowing ? 'Takip Ediliyor' : 'Takip Et';
    const followBtnClass = isFollowing ? 'follow-btn active' : 'follow-btn';
    const followBtnIcon = isFollowing ? '<i class="ph-fill ph-check"></i>' : '<i class="ph ph-bell"></i>';

    // Hide follow button if it's the current user's own post
    const isSelf = window.currentUser && (post.profiles?.id === window.currentUser.id || post.user_id === window.currentUser.id || post.user.username === (window.currentUser.user_metadata?.username || window.currentUser.email?.split('@')[0]));

    const followBtnHTML = isSelf ? '' : `
        <button class="${followBtnClass}" onclick="toggleFollow('${post.user.username}')" style="cursor: pointer; position: relative; z-index: 10;">
             ${followBtnText} ${followBtnIcon}
        </button>
    `;

    return `
        <article class="portfolio-card">
            <div class="card-header">
                <div class="user-info">
                    <div class="avatar">${post.user.avatar}</div>
                    <div class="user-meta">
                        <h3>${post.user.username}</h3>
                        <span>${post.user.date}</span>
                    </div>
                </div>
                ${followBtnHTML}
            </div>

            <div class="card-content">
                <h2 class="card-title">${post.title}</h2>
                <p class="card-desc">${post.description}</p>
                
                <div class="card-stats">
                    ${(post.stats && post.stats.likes > 0) ? `<div class="stat-item" style="color:var(--text-secondary)"><i class="ph-fill ph-thumbs-up" style="color:#3b82f6"></i> ${post.stats.likes}</div>` : ''}
                    ${(post.stats && post.stats.insights > 0) ? `<div class="stat-item" style="color:var(--text-secondary)"><i class="ph-fill ph-lightbulb" style="color:#eab308"></i> ${post.stats.insights}</div>` : ''}
                    ${(post.stats && post.stats.different > 0) ? `<div class="stat-item" style="color:var(--text-secondary)"><i class="ph-fill ph-binoculars" style="color:#a855f7"></i> ${post.stats.different}</div>` : ''}
                    ${(post.stats && post.stats.risks > 0) ? `<div class="stat-item" style="color:var(--text-secondary)"><i class="ph-fill ph-warning" style="color:#ef4444"></i> ${post.stats.risks}</div>` : ''}
                    ${(!post.stats || (post.stats.likes == 0 && post.stats.insights == 0 && post.stats.different == 0 && post.stats.risks == 0)) ? `<div class="stat-item" style="color:var(--text-tertiary); font-size: 0.8rem">Henüz reaksiyon yok</div>` : ''}
                </div>

                <div class="chart-section">
                    <div class="donut-chart" style="background: ${conicGradient}">
                        <div class="chart-center-text">
                            <span class="count">${post.assets.length}</span>
                            <span class="label">Yatırım Aracı</span>
                        </div>
                    </div>
                </div>

                <div class="asset-list">
                    ${post.assets.map(asset => `
                        <div class="asset-wrapper">
                            <div class="asset-item">
                                <div class="asset-icon" style="background-color: ${asset.color || 'var(--color-brand)'}">
                                    ${asset.icon || (asset.logo ? `<img src="${asset.logo}" style="width:100%;height:100%;border-radius:50%">` : '<i class="ph ph-currency-dollar"></i>')}
                                </div>
                                <div class="asset-info">
                                    <span class="asset-symbol">${asset.symbol}</span>
                                    <span class="asset-percent">%${asset.percent}</span>
                                </div>
                            </div>
                            <div class="asset-bar" style="background-color: ${asset.color}"></div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card-footer">
                <!-- Reaction Wrapper -->
                <div class="like-wrapper">
                    <!-- Popover -->
                    <div class="reaction-popover">
                        <button class="reaction-btn reaction-like" data-label="Beğendim" onclick="event.stopPropagation(); toggleReaction(${post.id}, 'like')">
                            <i class="ph-fill ph-thumbs-up"></i>
                        </button>
                        <button class="reaction-btn reaction-insight" data-label="Öğretici" onclick="event.stopPropagation(); toggleReaction(${post.id}, 'insight')">
                            <i class="ph-fill ph-lightbulb"></i>
                        </button>
                        <button class="reaction-btn reaction-different" data-label="Farklı Düşünüyorum" onclick="event.stopPropagation(); toggleReaction(${post.id}, 'different')">
                            <i class="ph-fill ph-binoculars"></i>
                        </button>
                        <button class="reaction-btn reaction-risk" data-label="Riskli" onclick="event.stopPropagation(); toggleReaction(${post.id}, 'risk')">
                            <i class="ph-fill ph-warning"></i>
                        </button>
                    </div>

                    <!-- Main Button -->
                    <button class="like-btn ${mainBtnClass}" onclick="toggleReaction(${post.id})">
                        <i class="${mainBtnIcon}"></i> ${mainBtnText}
                    </button>
                </div>

                <span class="disclaimer">Yatırım Tavsiyesi Değildir</span>
            </div>
        </article>
    `;
}

// GLOBAL HANDLERS - Defined once
window.toggleReaction = async (id, type) => {
    console.log('toggleReaction triggered:', id, type);

    // 1. Check Auth first (but don't wait for UI update if possible)
    if (!(await checkAuth())) return;

    // 2. Optimistic UI Update
    const reactions = JSON.parse(localStorage.getItem('finmates_reactions') || '{}');
    const existingType = reactions[id];
    const user = await sb_auth.getUser();

    // Toggle logic for localStorage
    if (!type) { // Default like toggle
        if (existingType === 'like') delete reactions[id];
        else reactions[id] = 'like';
    } else { // Specifically typed reaction
        if (existingType === type) delete reactions[id];
        else reactions[id] = type;
    }
    localStorage.setItem('finmates_reactions', JSON.stringify(reactions));

    // Update Button UI Immediately (Optimistic)
    const container = document.querySelector(`.portfolio-card button[onclick*="toggleReaction(${id})"]`)?.closest('.portfolio-card');
    if (container) {
        const mainBtn = container.querySelector('.like-btn');
        const nextReaction = reactions[id];

        const config = {
            'like': { icon: 'ph-fill ph-thumbs-up', class: 'btn-reacted-like', text: 'Beğendim' },
            'insight': { icon: 'ph-fill ph-lightbulb', class: 'btn-reacted-insight', text: 'Öğretici' },
            'different': { icon: 'ph-fill ph-binoculars', class: 'btn-reacted-different', text: 'Farklı' },
            'risk': { icon: 'ph-fill ph-warning', class: 'btn-reacted-risk', text: 'Riskli' },
            'default': { icon: 'ph ph-thumbs-up', class: '', text: 'Beğen' }
        };

        const state = config[nextReaction] || config['default'];
        mainBtn.innerHTML = `<i class="${state.icon}"></i> ${state.text}`;
        mainBtn.className = `like-btn ${state.class}`;
    }

    // 3. Background Sync (Database)
    try {
        const { data: existing } = await sb
            .from('reactions')
            .select('*')
            .eq('post_id', id)
            .eq('user_id', user.id)
            .single();

        if (!type) {
            if (existing) {
                await sb.from('reactions').delete().eq('id', existing.id);
            } else {
                await sb.from('reactions').insert({ post_id: id, user_id: user.id, type: 'like' });
            }
        } else {
            if (existing) {
                if (existing.type === type) {
                    await sb.from('reactions').delete().eq('id', existing.id);
                } else {
                    await sb.from('reactions').update({ type: type }).eq('id', existing.id);
                }
            } else {
                await sb.from('reactions').insert({ post_id: id, user_id: user.id, type: type });
            }
        }
    } catch (err) {
        console.error('Reaction sync error:', err);
        // On error, we might want to rollback but usually silent failure for likes is preferred unless critical
    }
};

window.toggleFollow = async (username) => {
    console.log('toggleFollow triggered for:', username);

    // 1. Optimistic UI Update
    const btns = document.querySelectorAll(`button[onclick*="toggleFollow('${username}')"]`);
    const followList = JSON.parse(localStorage.getItem('finmates_following') || '[]');
    const currentlyFollowing = followList.includes(username);

    // Toggle state immediately in UI
    btns.forEach(btn => {
        if (currentlyFollowing) {
            btn.innerHTML = 'Takip Et <i class="ph ph-bell"></i>';
            btn.className = 'follow-btn';
        } else {
            btn.innerHTML = 'Takip Ediliyor <i class="ph-fill ph-check"></i>';
            btn.className = 'follow-btn active';
        }
    });

    try {
        if (!(await checkAuth())) return;

        const user = await sb_auth.getUser();
        let targetId = null;
        let isMock = false;

        // DB Check
        const { data: targetProfile, error: profileError } = await sb
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

        if (profileError || !targetProfile) {
            isMock = true;
        } else {
            targetId = targetProfile.id;
        }

        if (targetId && targetId === user.id) {
            alert('Kendi kendinizi takip edemezsiniz.');
            navigate(window.currentPath || '/'); // Revert UI
            return;
        }

        // 2. Background Sync (DB)
        if (!isMock && targetId) {
            if (currentlyFollowing) {
                await sb.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId);
            } else {
                await sb.from('follows').insert({ follower_id: user.id, following_id: targetId });
            }
        }

        // 3. Local Storage Sync (Manual update to ensure persistence)
        const updatedList = JSON.parse(localStorage.getItem('finmates_following') || '[]');
        const idx = updatedList.indexOf(username);
        if (currentlyFollowing) {
            if (idx > -1) updatedList.splice(idx, 1);
        } else {
            if (idx === -1) updatedList.push(username);
        }
        localStorage.setItem('finmates_following', JSON.stringify(updatedList));

        // Note: No full re-render here to avoid the jarring "Loading" spinner.
        // The UI is already updated optimistically.
        // If we really need a full refresh, we'd call navigate() but maybe skip the spinner.
    } catch (err) {
        console.error('Follow error:', err);
        alert('İşlem sırasında bir hata oluştu: ' + err.message);
        navigate(window.currentPath || '/'); // Rollback on error
    }
};
