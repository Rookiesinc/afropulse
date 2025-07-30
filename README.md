# 🎵 Afropulse - African Music Discovery Platform

Afropulse is a comprehensive web application that tracks and curates the latest African music releases, buzzing songs, and trending artists across the continent. Built with Next.js 14, it features real-time Spotify integration, automated email digests, and dynamic artist discovery.

## ✨ Features

### 🎶 Music Discovery
- **Live Spotify Integration**: Real-time tracking of new African music releases
- **Dynamic Artist Discovery**: Automatically discovers and evaluates new African artists
- **Multi-Genre Support**: Covers 18+ African music genres including Afrobeats, Amapiano, Alté, Bongo Flava, and more
- **Continental Coverage**: Artists from 50+ African countries
- **Smart Categorization**: AI-powered genre classification and artist evaluation

### 📊 Content Management
- **Admin Dashboard**: Comprehensive management interface with analytics
- **Manual Song Curation**: Override automatic selections with hand-picked tracks
- **Real-time Search**: Spotify-powered search with instant results
- **Artist Evaluation System**: Scoring system for discovering authentic African artists

### 📧 Email System
- **Weekly Digest**: Automated email newsletters every Friday
- **Gmail Integration**: Secure SMTP delivery with App Password authentication
- **Responsive Templates**: Beautiful HTML email templates
- **Test System**: Built-in email testing and verification

### 🔄 Data Sources
- **Spotify Web API**: Primary source for music data
- **Social Media Simulation**: Instagram and Twitter buzz tracking
- **Blog Integration**: Featured releases from major African music blogs
- **Cross-Platform Verification**: Multi-platform availability checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Spotify Developer Account
- Gmail account with App Password
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/yourusername/afropulse.git
cd afropulse
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. **Configure Spotify API**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Create a new app
   - Copy Client ID and Client Secret to `.env.local`

5. **Configure Gmail SMTP**
   - Enable 2-Factor Authentication on Gmail
   - Generate App Password: Google Account → Security → App passwords
   - Add credentials to `.env.local`

6. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## 🔧 Configuration

### Environment Variables

\`\`\`env
# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Gmail SMTP
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password

# Test Emails
TEST_EMAIL_1=test1@example.com
TEST_EMAIL_2=test2@example.com
\`\`\`

### Gmail Setup Guide

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Navigate to Security → 2-Step Verification
   - Follow the setup process

2. **Generate App Password**
   - In Security settings, scroll to "App passwords"
   - Select "Mail" and "Other (custom name)"
   - Name it "Afropulse"
   - Copy the 16-character password (remove spaces)

3. **Configure Environment**
   - Set `GMAIL_USER` to your Gmail address
   - Set `GMAIL_APP_PASSWORD` to the 16-character password

## 📱 Usage

### Admin Dashboard
Access the admin dashboard at `/dashboard` to:
- Monitor system health and performance
- View real-time analytics and statistics
- Manually select and curate songs
- Send test emails and manage subscribers
- Track artist discovery and genre distribution

### Manual Song Selection
1. Navigate to the "Song Editor" tab in the dashboard
2. Search for songs using the Spotify integration
3. Select up to 20 songs for the weekly digest
4. Save your selection to override automatic curation

### Email Testing
1. Go to the admin dashboard
2. Click "Test Email" to send a sample digest
3. Check both test email addresses for delivery
4. Review email logs and troubleshooting information

## 🎯 Dynamic Artist Discovery

Afropulse features an intelligent artist discovery system that:

### Evaluation Criteria
- **Name Analysis**: Checks for African name patterns and keywords
- **Geographic Indicators**: Identifies country and regional references
- **Genre Classification**: Analyzes music style and genre keywords
- **Popularity Metrics**: Considers Spotify popularity scores
- **Cultural References**: Detects African languages and cultural terms

### Scoring System
- **Minimum Score**: 25 points required for inclusion
- **Keyword Matching**: 8-25 points based on relevance
- **Artist Name Patterns**: 12 points for African naming conventions
- **Geographic Relevance**: 10-25 points for country identification
- **Genre Specificity**: 15-25 points for genre-specific terms

### Discovery Sources
- Spotify new releases and search results
- Genre-specific queries across 40+ search terms
- Artist album and track analysis
- Real-time evaluation during data fetching

## 🌍 Supported Regions & Genres

### Countries (50+)
Nigeria, Ghana, South Africa, Kenya, Tanzania, Uganda, Angola, DRC, Zimbabwe, Zambia, Cameroon, Senegal, Ivory Coast, Ethiopia, Rwanda, Malawi, Mozambique, Botswana, Namibia, Cape Verde, and more.

### Genres (18+)
- **Afrobeats** - Nigerian-originated global sound
- **Amapiano** - South African house music
- **Alté** - Alternative African music
- **Afro-Pop** - Mainstream African pop
- **Afro-R&B** - African rhythm and blues
- **Afro-Fusion** - Contemporary fusion styles
- **Bongo Flava** - Tanzanian hip-hop and R&B
- **Highlife** - West African guitar music
- **Kwaito** - South African house variant
- **Gqom** - South African electronic dance
- **Kizomba** - Angolan romantic music
- **Makossa** - Cameroonian urban music
- **Soukous** - Congolese rumba
- And more regional styles...

## 🔄 API Endpoints

### Public Endpoints
- `GET /api/releases` - Latest African music releases
- `GET /api/buzzing` - Currently trending songs
- `POST /api/subscribe` - Newsletter subscription

### Admin Endpoints
- `GET /api/spotify-search` - Search Spotify catalog
- `POST /api/selected-releases` - Save manual song selections
- `POST /api/test-digest` - Send test email digest
- `GET /api/cron/weekly-digest` - Trigger weekly email

### Data Endpoints
- `GET /api/aggregate-data` - Combined music data
- `GET /api/comprehensive-buzz` - Multi-source trending data
- `GET /api/social-buzz` - Social media buzz simulation

## 📊 Analytics & Monitoring

### Dashboard Metrics
- **Content Coverage**: New releases and buzzing songs count
- **Artist Diversity**: Unique artists and genre distribution
- **Discovery Stats**: Dynamically discovered vs. core artists
- **Email Performance**: Delivery rates and subscriber growth
- **System Health**: API status and data freshness

### Performance Monitoring
- **Real-time Updates**: Live data refresh every 5 minutes
- **Error Tracking**: Comprehensive error logging and reporting
- **Rate Limiting**: Spotify API rate limit management
- **Fallback Systems**: Guaranteed content delivery with backup data

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Import project to Vercel
   - Connect your GitHub repository

2. **Configure Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure Gmail and Spotify credentials are set

3. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Monitor deployment logs for any issues

4. **Set Up Cron Jobs**
   - Configure weekly digest cron job
   - Test email delivery in production

### Manual Deployment

\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

## 🛠️ Development

### Project Structure
\`\`\`
afropulse/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Admin dashboard
│   └── page.tsx          # Main application
├── components/            # Reusable components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
\`\`\`

### Key Components
- **Dynamic Artist Discovery**: `AfricanArtistDiscovery` class
- **Email System**: Gmail SMTP with nodemailer
- **Admin Dashboard**: Comprehensive management interface
- **Spotify Integration**: Real-time music data fetching

### Development Commands
\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spotify Web API** for music data
- **African Music Industry** for inspiration
- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment
- **African Artists** worldwide for the incredible music

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Email**: Contact via the admin dashboard test email system
- **Community**: Join discussions in GitHub Discussions

## 🔮 Roadmap

### Upcoming Features
- [ ] Real social media API integration
- [ ] User authentication and personalization
- [ ] Playlist generation and sharing
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Artist profile pages
- [ ] Music recommendation engine

### Technical Improvements
- [ ] Database integration for data persistence
- [ ] Redis caching for improved performance
- [ ] GraphQL API implementation
- [ ] Real-time WebSocket updates
- [ ] Advanced search and filtering
- [ ] API rate limiting and optimization

---

**Built with ❤️ for African music lovers worldwide**

*Discover the pulse of African music with Afropulse - where tradition meets innovation.*
