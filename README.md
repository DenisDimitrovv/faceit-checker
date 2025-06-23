# FACEIT Profile Checker

A modern web application to check FACEIT profiles using Steam Profile URLs, IDs, or custom names. Built with Node.js, Express, and vanilla JavaScript with a beautiful, responsive UI.

## Features

- 🔍 Search FACEIT profiles by **Steam Profile URL**, **SteamID64**, or **custom name**
- 🚀 Resolves custom Steam URLs (e.g., `steamcommunity.com/id/yourname`) automatically
- 📊 Display comprehensive player statistics
- 🎮 Show recent match history
- 📱 Responsive design for all devices
- ⚡ Fast and modern UI with smooth animations
- 🛡️ Input validation and error handling

## Screenshots

The application features a dark theme with:
- Modern glassmorphism design
- Animated loading states
- Responsive grid layouts
- Interactive hover effects

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- FACEIT API key
- **Steam Web API key**

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd faceit-checker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
# Copy the example environment file
cp env.example .env

# Edit .env and add your API keys
FACEIT_API_KEY=your_actual_faceit_api_key_here
STEAM_API_KEY=your_actual_steam_api_key_here
PORT=3000
```

### 4. Get API Keys

#### FACEIT API Key
1. Visit [FACEIT Developers](https://developers.faceit.com/)
2. Create an account and register your application
3. Get your API key from the dashboard and add it to `.env`

#### Steam Web API Key
1. Visit the [Steam Web API Key page](https://steamcommunity.com/dev/apikey).
2. Enter a domain name (you can use `localhost`).
3. Agree to the terms and click "Register".
4. Copy the generated key and add it to your `.env` file.

### 5. Start the server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 6. Open your browser
Navigate to `http://localhost:3000`

## Usage

1. **Find a Steam Profile**: Go to any user's profile on Steam.
2. **Enter Profile URL**: Copy the URL from your browser's address bar and paste it into the search field. You can also use a raw SteamID64 or a custom name.
3. **View Profile**: Click search to see the FACEIT profile information.

## API Endpoints

### GET `/api/faceit-profile/:identifier`
Returns FACEIT profile data for a given Steam identifier (URL, ID, or custom name).

**Response includes:**
- Player information (nickname, avatar, country, level, ELO)
- CS2 statistics (win rate, K/D ratio, headshot percentage, etc.)
- Recent match history

**Example:**
```bash
curl http://localhost:3000/api/faceit-profile/76561198012345678
```

## Project Structure

```
faceit-checker/
├── server.js              # Express server with Steam & FACEIT logic
├── package.json           # Dependencies and scripts
├── env.example           # Environment variables template
├── public/               # Frontend files
│   ├── index.html        # Main HTML file
│   ├── styles.css        # CSS styles
│   └── script.js         # JavaScript functionality
└── README.md             # This file
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **APIs**:
    - FACEIT Open API v4
    - **Steam Web API**
- **Styling**: Custom CSS with glassmorphism effects
- **Icons**: Font Awesome

## Features in Detail

### Player Information
- FACEIT nickname and avatar
- Country and skill level
- Current ELO rating
- Direct link to FACEIT profile

### Statistics Display
- Win rate percentage
- Average K/D ratio
- Headshot percentage
- Total matches played
- Average kills and deaths per match

### Recent Matches
- Last 5 matches with results
- Match dates and team names
- Win/loss indicators

## Error Handling

The application handles various error scenarios:
- Invalid Steam URL, ID, or name
- Unresolvable custom URLs
- Player not found on FACEIT or Steam
- API rate limiting or key errors
- Network connectivity issues

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for automatic server restart on file changes.

### Adding New Features
1. Backend: Add new routes in `server.js`
2. Frontend: Modify `public/script.js` for new functionality
3. Styling: Update `public/styles.css` for new UI elements

## Deployment

### Local Deployment
```bash
npm start
```

### Production Deployment
1. Set `NODE_ENV=production`
2. Configure your production port
3. Use a process manager like PM2
4. Set up reverse proxy (nginx/Apache)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues:
1. Check that both your FACEIT and Steam API keys are valid.
2. Ensure the Steam profile is public and the URL is correct.
3. Verify the player has a FACEIT account.
4. Check the browser console for error messages

## API Rate Limits

Be aware of FACEIT API rate limits:
- 100 requests per minute per API key
- Implement caching for production use
- Consider implementing request queuing for high-traffic scenarios 