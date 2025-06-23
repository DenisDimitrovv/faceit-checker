const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API configurations
const FACEIT_API_KEY = process.env.FACEIT_API_KEY;
const FACEIT_API_BASE = 'https://open.faceit.com/data/v4';
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const STEAM_API_BASE = 'https://api.steampowered.com';

/**
 * Gets a user's 64-bit Steam ID from a given identifier.
 * The identifier can be a SteamID64, a custom URL name, or a profile URL.
 * @param {string} identifier - The user's Steam identifier.
 * @returns {Promise<string>} The 64-bit Steam ID.
 */
async function getSteamId(identifier) {
    if (/^76561198\d{9}$/.test(identifier)) {
        return identifier;
    }

    if (!STEAM_API_KEY || STEAM_API_KEY === 'your_steam_api_key_here') {
        throw new Error('Steam API key not configured. Cannot resolve custom URLs.');
    }

    try {
        const response = await axios.get(`${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v1/`, {
            params: {
                key: STEAM_API_KEY,
                vanityurl: identifier
            }
        });

        if (response.data.response.success === 1) {
            return response.data.response.steamid;
        } else {
            throw new Error('Could not resolve Steam URL. Please provide a valid custom URL name or a 17-digit Steam ID.');
        }
    } catch (error) {
        console.error('Steam API error:', error.message);
        throw new Error('Failed to communicate with the Steam API.');
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// API endpoint to get FACEIT profile by Steam identifier
app.get('/api/faceit-profile/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;

        if (!FACEIT_API_KEY || FACEIT_API_KEY === 'your_faceit_api_key_here') {
            return res.status(500).json({
                error: 'FACEIT API key not configured. Please add FACEIT_API_KEY to your .env file.'
            });
        }

        const steamId = await getSteamId(identifier);

        const headers = {
            'Authorization': `Bearer ${FACEIT_API_KEY}`
        };

        // Get player data from FACEIT using the resolved Steam ID
        const playerResponse = await axios.get(`${FACEIT_API_BASE}/players?game=cs2&game_player_id=${steamId}`, { headers });
        const playerData = playerResponse.data;

        // Get additional stats and match history
        const [statsResponse, matchesResponse] = await Promise.all([
            axios.get(`${FACEIT_API_BASE}/players/${playerData.player_id}/stats/cs2`, { headers }).catch(() => null),
            axios.get(`${FACEIT_API_BASE}/players/${playerData.player_id}/history?game=cs2&offset=0&limit=5`, { headers }).catch(() => null)
        ]);
        
        res.json({
            player: playerData,
            stats: statsResponse ? statsResponse.data : null,
            recentMatches: matchesResponse ? matchesResponse.data : null
        });

    } catch (error) {
        console.error('Error fetching FACEIT profile:', error.message);

        if (error.message.includes('API key not configured')) {
            return res.status(500).json({ error: error.message });
        }
        if (error.message.includes('Could not resolve') || error.message.includes('Steam API')) {
            return res.status(404).json({ error: error.message });
        }

        if (error.response) {
            if (error.response.status === 404) {
                return res.status(404).json({
                    error: 'Player not found on FACEIT. Make sure the Steam account is public and has a FACEIT profile.'
                });
            }
            return res.status(error.response.status).json({
                error: `FACEIT API error: ${error.response.data?.message || 'Failed to fetch data'}`
            });
        }

        res.status(500).json({
            error: 'An unexpected error occurred. Please try again later.'
        });
    }
});

// API endpoint to search by Steam username (requires Steam API)
app.get('/api/search-by-username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // Note: This would require Steam API integration
        // For now, we'll return an error suggesting to use Steam ID
        res.status(400).json({ 
            error: 'Please use Steam ID instead of username. You can find your Steam ID at steamidfinder.com' 
        });

    } catch (error) {
        console.error('Error searching by username:', error);
        res.status(500).json({ 
            error: 'Failed to search by username. Please try again later.' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Make sure to set your FACEIT_API_KEY and STEAM_API_KEY in the .env file');
}); 