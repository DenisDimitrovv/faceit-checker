// DOM elements
const steamIdInput = document.getElementById('steamIdInput');
const searchBtn = document.getElementById('searchBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const profileContainer = document.getElementById('profileContainer');

// Event listeners
searchBtn.addEventListener('click', handleSearch);
steamIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

/**
 * Parses the user's input to extract a Steam identifier.
 * @param {string} input - The raw input from the user.
 * @returns {string} The extracted SteamID64 or vanity name.
 * @throws {Error} If the input is invalid.
 */
function parseSteamInput(input) {
    try {
        const url = new URL(input);
        const path = url.pathname;

        const vanityMatch = path.match(/^(?:\/id\/)?([^/]+)/);
        if (vanityMatch && vanityMatch[1]) return vanityMatch[1];
        
        const profileMatch = path.match(/^(?:\/profiles\/)?(\d{17})/);
        if (profileMatch && profileMatch[1]) return profileMatch[1];

    } catch (e) {
        // Not a valid URL, treat as raw ID or vanity name
        if (/^76561198\d{9}$/.test(input) || /^[a-zA-Z0-9_-]+$/.test(input)) {
            return input;
        }
    }
    
    throw new Error('Invalid input. Please use a Steam Profile URL, SteamID64, or custom URL name.');
}

// Handle search functionality
async function handleSearch() {
    const userInput = steamIdInput.value.trim();
    
    if (!userInput) {
        showError('Please enter a Steam Profile URL, ID, or custom name');
        return;
    }

    let identifier;
    try {
        identifier = parseSteamInput(userInput);
    } catch (error) {
        showError(error.message);
        return;
    }

    showLoading();
    hideError();
    hideProfile();

    try {
        const response = await fetch(`/api/faceit-profile/${identifier}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch profile');
        }

        displayProfile(data);
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message || 'An error occurred while searching');
    } finally {
        hideLoading();
    }
}

// Display profile data
function displayProfile(data) {
    const { player, stats, recentMatches } = data;
    
    const profileHTML = `
        <div class="profile-header">
            <img src="${player.avatar}" alt="Profile Avatar" class="profile-avatar" onerror="this.src='https://via.placeholder.com/80x80/00d4ff/ffffff?text=?'">
            <div class="profile-info">
                <h2>${player.nickname}</h2>
                <p>Country: ${player.country || 'Unknown'}</p>
                <p>Level: ${player.games?.cs2?.skill_level || 'N/A'}</p>
                <p>ELO: ${player.games?.cs2?.faceit_elo || 'N/A'}</p>
                <a href="https://www.faceit.com/en/players/${player.nickname}" target="_blank" class="faceit-url">
                    View on FACEIT <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>

        ${stats ? `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.lifetime['Win Rate %'] || 'N/A'}%</div>
                <div class="stat-label">Win Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.lifetime['Average K/D Ratio'] || 'N/A'}</div>
                <div class="stat-label">K/D Ratio</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.lifetime['Average Headshots %'] || 'N/A'}%</div>
                <div class="stat-label">Headshot %</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.lifetime['Matches'] || 'N/A'}</div>
                <div class="stat-label">Total Matches</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.lifetime['Longest Win Streak'] || 'N/A'}</div>
                <div class="stat-label">Longest Win Streak</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.lifetime['Current Win Streak'] || 0}</div>
                <div class="stat-label">Current Win Streak</div>
            </div>
        </div>
        ` : '<p style="text-align: center; color: #888;">No statistics available</p>'}

        ${recentMatches && recentMatches.items && recentMatches.items.length > 0 ? `
        <div class="recent-matches">
            <h3>Recent Matches</h3>
            ${recentMatches.items.map(match => {
                // Determine which faction the player was in
                const playerFaction = match.teams.faction1.players.some(p => p.player_id === player.player_id) 
                    ? 'faction1' 
                    : 'faction2';
                
                // Determine win/loss based on the winner and player's faction
                const isWin = match.results.winner === playerFaction;
                const resultClass = isWin ? 'win' : 'loss';
                const resultText = isWin ? 'WIN' : 'LOSS';

                const team1Name = match.teams.faction1.nickname;
                const team2Name = match.teams.faction2.nickname;
                
                return `
                    <div class="match-item">
                        <div class="match-details">
                            <strong>${team1Name} vs ${team2Name}</strong><br>
                            <small>${new Date(match.finished_at * 1000).toLocaleDateString()}</small>
                        </div>
                        <div class="match-result ${resultClass}">${resultText}</div>
                    </div>
                `;
            }).join('')}
        </div>
        ` : '<p style="text-align: center; color: #888; margin-top: 20px;">No recent matches available</p>'}
    `;

    profileContainer.innerHTML = profileHTML;
    showProfile();
}

// Utility functions for showing/hiding elements
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    searchBtn.disabled = true;
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    searchBtn.disabled = false;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showProfile() {
    profileContainer.classList.remove('hidden');
}

function hideProfile() {
    profileContainer.classList.add('hidden');
}

// Add some visual feedback for the search button
searchBtn.addEventListener('mousedown', () => {
    searchBtn.style.transform = 'scale(0.95)';
});

searchBtn.addEventListener('mouseup', () => {
    searchBtn.style.transform = 'scale(1)';
});

searchBtn.addEventListener('mouseleave', () => {
    searchBtn.style.transform = 'scale(1)';
});

// Auto-focus on input when page loads
window.addEventListener('load', () => {
    steamIdInput.focus();
});

// Add input validation feedback
steamIdInput.addEventListener('input', () => {
    steamIdInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
}); 