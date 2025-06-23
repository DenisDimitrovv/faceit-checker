const axios = require('axios');

const FACEIT_API_KEY = process.env.FACEIT_API_KEY;
const FACEIT_API_BASE = 'https://open.faceit.com/data/v4';
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const STEAM_API_BASE = 'https://api.steampowered.com';

async function getSteamId(identifier) {
  if (/^76561198\d{9}$/.test(identifier)) {
    return identifier;
  }
  if (!STEAM_API_KEY || STEAM_API_KEY === 'your_steam_api_key_here') {
    throw new Error('Steam API key is not configured on the server.');
  }
  try {
    const resp = await axios.get(`${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v1/`, {
      params: { key: STEAM_API_KEY, vanityurl: identifier }
    });
    if (resp.data.response.success === 1) {
      return resp.data.response.steamid;
    }
    throw new Error('Could not resolve Steam URL. The profile may be private or the custom URL is incorrect.');
  } catch (error) {
    console.error('Steam API Error:', error.message);
    throw new Error('Could not resolve Steam URL. The profile may be private or the custom URL is incorrect.');
  }
}

module.exports = async (req, res) => {
  try {
    const { identifier } = req.query;

    if (!FACEIT_API_KEY || FACEIT_API_KEY === 'your_faceit_api_key_here') {
      console.error('FACEIT API Key is missing');
      return res.status(500).json({ error: 'Server configuration error: Missing FACEIT API key.' });
    }

    const steamId = await getSteamId(identifier);
    
    const headers = { Authorization: `Bearer ${FACEIT_API_KEY}` };
    const playerResp = await axios.get(`${FACEIT_API_BASE}/players?game=cs2&game_player_id=${steamId}`, { headers });
    const playerData = playerResp.data;

    const [statsResp, matchesResp] = await Promise.all([
      axios.get(`${FACEIT_API_BASE}/players/${playerData.player_id}/stats/cs2`, { headers }).catch(() => null),
      axios.get(`${FACEIT_API_BASE}/players/${playerData.player_id}/history?game=cs2&offset=0&limit=5`, { headers }).catch(() => null)
    ]);

    return res.status(200).json({
      player: playerData,
      stats: statsResp ? statsResp.data : null,
      recentMatches: matchesResp ? matchesResp.data : null
    });
  } catch (error) {
    console.error('[Vercel Function Error]', error.message);
    
    if (error.message.includes('Could not resolve Steam URL')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.response && error.response.status === 404) {
        return res.status(404).json({ error: 'Player not found on FACEIT. The Steam account may not be linked to a FACEIT profile.' });
    }

    return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}; 