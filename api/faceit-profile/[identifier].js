import axios from 'axios';

const FACEIT_API_KEY = process.env.FACEIT_API_KEY;
const FACEIT_API_BASE = 'https://open.faceit.com/data/v4';
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const STEAM_API_BASE = 'https://api.steampowered.com';

async function getSteamId(identifier) {
  if (/^76561198\d{9}$/.test(identifier)) return identifier;
  if (!STEAM_API_KEY) throw new Error('Steam API key not configured.');
  const resp = await axios.get(`${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v1/`, {
    params: { key: STEAM_API_KEY, vanityurl: identifier }
  });
  if (resp.data.response.success === 1) return resp.data.response.steamid;
  throw new Error('Could not resolve Steam URL');
}

export default async function handler(req, res) {
  const { identifier } = req.query;
  if (!FACEIT_API_KEY) {
    res.status(500).json({ error: 'FACEIT API key not configured.' });
    return;
  }
  try {
    const steamId = await getSteamId(identifier);
    const headers = { Authorization: `Bearer ${FACEIT_API_KEY}` };
    const playerResp = await axios.get(`${FACEIT_API_BASE}/players?game=cs2&game_player_id=${steamId}`, { headers });
    const playerData = playerResp.data;
    const [statsResp, matchesResp] = await Promise.all([
      axios.get(`${FACEIT_API_BASE}/players/${playerData.player_id}/stats/cs2`, { headers }).catch(() => null),
      axios.get(`${FACEIT_API_BASE}/players/${playerData.player_id}/history?game=cs2&offset=0&limit=5`, { headers }).catch(() => null)
    ]);
    res.status(200).json({
      player: playerData,
      stats: statsResp ? statsResp.data : null,
      recentMatches: matchesResp ? matchesResp.data : null
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
} 