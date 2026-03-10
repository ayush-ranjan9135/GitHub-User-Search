/**
 * Dev Detective - GitHub User Search Application
 * Modern UI/UX Redesign + Battle Mode
 */

const API_BASE = "https://api.github.com/users/";

// Selectors for Tabs
const btnTabSearch = document.getElementById("tab-search");
const btnTabBattle = document.getElementById("tab-battle");
const searchView = document.getElementById("search-view");
const battleView = document.getElementById("battle-view");

// Selectors for Normal Search
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const retryBtn = document.getElementById("retry-btn");
const resultsContainer = document.getElementById("results-container");
const profileCard = document.getElementById("profile-card");
const reposList = document.getElementById("repos-list");

// Selectors for Battle Mode
const p1Input = document.getElementById("player1-input");
const p2Input = document.getElementById("player2-input");
const battleBtn = document.getElementById("battle-btn");
const battleLoading = document.getElementById("battle-loading");
const battleError = document.getElementById("battle-error");
const battleErrorMsg = document.getElementById("battle-error-msg");
const battleResults = document.getElementById("battle-results");
const p1Card = document.getElementById("player1-card");
const p2Card = document.getElementById("player2-card");
const resetBattleBtn = document.getElementById("reset-battle-btn");

// Comparison bar elements
const battleWinnerText = document.getElementById("battle-winner-text");
const p1CompName = document.getElementById("p1-comp-name");
const p2CompName = document.getElementById("p2-comp-name");
const p1Bar = document.getElementById("p1-bar");
const p2Bar = document.getElementById("p2-bar");

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Top Tabs navigation
    btnTabSearch.addEventListener("click", () => switchTab('search'));
    btnTabBattle.addEventListener("click", () => switchTab('battle'));

    // Normal Search Events
    searchBtn.addEventListener("click", handleSearch);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSearch();
    });
    retryBtn.addEventListener("click", () => {
        errorState.classList.add("hidden");
        searchInput.focus();
    });

    // Battle Mode Events
    battleBtn.addEventListener("click", handleBattle);
    p1Input.addEventListener("keypress", (e) => { if(e.key === "Enter") handleBattle(); });
    p2Input.addEventListener("keypress", (e) => { if(e.key === "Enter") handleBattle(); });
    resetBattleBtn.addEventListener("click", resetBattle);
});

/**
 * Handle Tab Switching
 */
function switchTab(mode) {
    if (mode === 'search') {
        btnTabSearch.classList.add('active');
        btnTabBattle.classList.remove('active');
        searchView.classList.remove('hidden');
        battleView.classList.add('hidden');
    } else {
        btnTabBattle.classList.add('active');
        btnTabSearch.classList.remove('active');
        battleView.classList.remove('hidden');
        searchView.classList.add('hidden');
    }
}

/**
 * Validates and Fetches User Data
 */
async function fetchUserData(username) {
    const response = await fetch(`${API_BASE}${username}`);
    if (!response.ok) {
        throw new Error(response.status === 404 ? "User Not Found" : "Fetch Error");
    }
    return await response.json();
}

/**
 * Fetches Top 5 Repositories by updated date
 */
async function fetchUserRepos(reposUrl) {
    const response = await fetch(`${reposUrl}?sort=updated&per_page=5`);
    if (!response.ok) throw new Error("Failed to fetch repositories.");
    return await response.json();
}

/**
 * Formats ISO date to "Joined 25 Jan 2023"
 */
function formatDate(isoString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(isoString).toLocaleDateString('en-GB', options);
}

/**
 * Helper to shorten numbers (e.g., 1500 -> 1.5k)
 */
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num;
}


/* =========================================
   NORMAL SEARCH MODE LOGIC
   ========================================= */

function hideSearchStates() {
    loadingState.classList.add("hidden");
    errorState.classList.add("hidden");
    resultsContainer.classList.add("hidden");
}

async function handleSearch() {
    const username = searchInput.value.trim();
    if (!username) return;

    hideSearchStates();
    loadingState.classList.remove("hidden");

    try {
        const user = await fetchUserData(username);
        renderProfile(user);
        
        const repos = await fetchUserRepos(user.repos_url);
        renderRepos(repos);

        loadingState.classList.add("hidden");
        resultsContainer.classList.remove("hidden");
    } catch (error) {
        loadingState.classList.add("hidden");
        errorState.classList.remove("hidden");
    }
}

function renderProfile(user) {
    const joinDate = formatDate(user.created_at);
    const bioText = user.bio ? user.bio : "This profile has no bio";
    const nameText = user.name || user.login;
    
    // Links HTML Generation using SVGs
    const locationHTML = user.location ? 
        `<div class="link-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> <span>${user.location}</span></div>` : '';
    const websiteHTML = user.blog ? 
        `<div class="link-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> <a href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" target="_blank" rel="noopener noreferrer">${user.blog}</a></div>` : '';
    const twitterHTML = user.twitter_username ? 
        `<div class="link-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg> <a href="https://twitter.com/${user.twitter_username}" target="_blank" rel="noopener noreferrer">@${user.twitter_username}</a></div>` : '';

    profileCard.innerHTML = `
        <div class="avatar-wrapper">
            <img src="${user.avatar_url}" alt="${user.login}" class="avatar">
        </div>
        <div class="profile-content">
            <div class="profile-header">
                <div class="profile-name">
                    <h2>${nameText}</h2>
                    <a href="${user.html_url}" target="_blank" class="profile-username">@${user.login}</a>
                </div>
                <div class="profile-joined">Joined ${joinDate}</div>
            </div>
            
            <p class="profile-bio">${bioText}</p>
            
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-label">Repos</span>
                    <span class="stat-value">${user.public_repos}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Followers</span>
                    <span class="stat-value">${formatNumber(user.followers)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Following</span>
                    <span class="stat-value">${formatNumber(user.following)}</span>
                </div>
            </div>

            <div class="profile-links">
                ${locationHTML} ${websiteHTML} ${twitterHTML}
            </div>
        </div>
    `;
}

function renderRepos(repos) {
    reposList.innerHTML = "";
    if (repos.length === 0) {
        reposList.innerHTML = `<p style="color: var(--text-secondary); grid-column: 1 / -1;">No public repositories available.</p>`;
        return;
    }

    repos.forEach(repo => {
        const updatedDate = formatDate(repo.updated_at);
        const card = document.createElement("a");
        card.href = repo.html_url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.className = "repo-card";
        
        card.innerHTML = `
            <div class="repo-top">
                <div class="repo-name">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    ${repo.name}
                </div>
            </div>
            <p class="repo-desc">${repo.description || "No description provided."}</p>
            <div class="repo-meta">
                <div class="meta-item lang"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> ${repo.language || "Unknown"}</div>
                <div class="meta-item star"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> ${formatNumber(repo.stargazers_count)}</div>
                <div class="meta-item">Updated on ${updatedDate}</div>
            </div>
        `;
        reposList.appendChild(card);
    });
}


/* =========================================
   BATTLE MODE LOGIC (NEW FEATURE)
   ========================================= */

function hideBattleStates() {
    battleLoading.classList.add("hidden");
    battleError.classList.add("hidden");
    battleResults.classList.add("hidden");
    
    // Remove previous winner/loser/draw styles
    p1Card.classList.remove('winner', 'loser', 'draw');
    p2Card.classList.remove('winner', 'loser', 'draw');
}

function resetBattle() {
    p1Input.value = "";
    p2Input.value = "";
    hideBattleStates();
    p1Input.focus();
}

async function handleBattle() {
    const user1 = p1Input.value.trim();
    const user2 = p2Input.value.trim();

    if (!user1 || !user2) return;

    hideBattleStates();
    battleLoading.classList.remove("hidden");

    try {
        // Fetch users concurrently
        const [data1, data2] = await Promise.all([
            fetchUserData(user1),
            fetchUserData(user2)
        ]);

        processBattle(data1, data2);
        battleLoading.classList.add("hidden");
        battleResults.classList.remove("hidden");

    } catch (error) {
        battleLoading.classList.add("hidden");
        battleErrorMsg.textContent = "One or both users not found. Please check spelling.";
        battleError.classList.remove("hidden");
    }
}

function processBattle(data1, data2) {
    const p1Followers = data1.followers || 0;
    const p2Followers = data2.followers || 0;
    const p1Name = data1.name || data1.login;
    const p2Name = data2.name || data2.login;

    let p1Badge = '', p2Badge = '';
    let p1Class = '', p2Class = '';
    let winnerText = '';

    if (p1Followers > p2Followers) {
        p1Badge = `<div class="battle-badge badge-winner"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style="width:16px; height:16px; margin-right:5px; margin-bottom:-2px;"><path d="M22 6A4 4 0 0 0 18 2H6A4 4 0 0 0 2 6V8A4 4 0 0 0 6 12H7.2C8.1 14.8 10.8 16.9 14 16.9V20H10V22H14V20H18C21.2 16.9 23.9 14.8 24.8 12H26A4 4 0 0 0 30 8V6ZM6 10H4V6H6V10ZM26 10H24V6H26V10Z" transform="scale(0.7) translate(-2, -2)"/></svg> Winner</div>`;
        p2Badge = `<div class="battle-badge badge-loser">Runner Up</div>`;
        p1Class = 'winner';
        p2Class = 'loser';
        winnerText = `${p1Name} Wins! 👑`;
    } else if (p2Followers > p1Followers) {
        p2Badge = `<div class="battle-badge badge-winner"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style="width:16px; height:16px; margin-right:5px; margin-bottom:-2px;"><path d="M22 6A4 4 0 0 0 18 2H6A4 4 0 0 0 2 6V8A4 4 0 0 0 6 12H7.2C8.1 14.8 10.8 16.9 14 16.9V20H10V22H14V20H18C21.2 16.9 23.9 14.8 24.8 12H26A4 4 0 0 0 30 8V6ZM6 10H4V6H6V10ZM26 10H24V6H26V10Z" transform="scale(0.7) translate(-2, -2)"/></svg> Winner</div>`;
        p1Badge = `<div class="battle-badge badge-loser">Runner Up</div>`;
        p2Class = 'winner';
        p1Class = 'loser';
        winnerText = `${p2Name} Wins! 👑`;
    } else {
        p1Badge = `<div class="battle-badge badge-draw">Draw</div>`;
        p2Badge = `<div class="battle-badge badge-draw">Draw</div>`;
        p1Class = 'draw';
        p2Class = 'draw';
        winnerText = `It's a Tie! 🤝`;
    }

    // Update Comparison Visuals
    battleWinnerText.textContent = winnerText;
    p1CompName.textContent = `@${data1.login}`;
    p2CompName.textContent = `@${data2.login}`;
    
    // Calculate percentages for the bar avoiding floats
    const totalFollowers = p1Followers + p2Followers;
    let p1Percent = 50, p2Percent = 50;
    
    if (totalFollowers > 0) {
        // Direct conversion of raw count to accurate scaled percentages
        p1Percent = (p1Followers / totalFollowers) * 100;
        p2Percent = (p2Followers / totalFollowers) * 100;

        // Force minimum visibility for bars so 99% vs 0.1% still shows tiny slivers
        if (p1Percent > 0 && p1Percent < 5) p1Percent = 5;
        if (p2Percent > 0 && p2Percent < 5) p2Percent = 5;
        if (p1Percent > 95 && p2Percent > 0) p1Percent = 95;
    }
    
    // Set widths after a tiny delay for CSS slide animation effect
    p1Bar.style.width = '50%';
    p2Bar.style.width = '50%';
    
    // Force DOM reflow so the browser registers the 50% width before animating
    void p1Bar.offsetHeight;
    void p2Bar.offsetHeight;
    
    setTimeout(() => {
        p1Bar.style.width = `${p1Percent}%`;
        p2Bar.style.width = `${100 - p1Percent}%`;
    }, 50);

    // Apply Classes (Preserving animations)
    p1Card.className = `card battle-card slide-in-left ${p1Class}`;
    p2Card.className = `card battle-card slide-in-right ${p2Class}`;

    // Render Cards
    p1Card.innerHTML = p1Badge + generateBattleCardHTML(data1);
    p2Card.innerHTML = p2Badge + generateBattleCardHTML(data2);
}

function generateBattleCardHTML(user) {
    const joinDate = formatDate(user.created_at);
    return `
        <div class="avatar-wrapper">
            <img src="${user.avatar_url}" alt="${user.login}" class="avatar">
        </div>
        <div class="profile-content">
            <div class="profile-header">
                <h2>${user.name || user.login}</h2>
                <a href="${user.html_url}" target="_blank" class="profile-username">@${user.login}</a>
            </div>
            
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-label">Repos</span>
                    <span class="stat-value">${user.public_repos}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Followers</span>
                    <span class="stat-value">${formatNumber(user.followers)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Following</span>
                    <span class="stat-value">${formatNumber(user.following)}</span>
                </div>
            </div>
            
            <div class="profile-joined" style="margin-top: 1rem;">Joined ${joinDate}</div>
        </div>
    `;
}
