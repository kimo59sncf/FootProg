// Générateur de SEO et sitemap pour FootProg
import fs from 'fs';
import path from 'path';
import { storage } from './storage-factory';

interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
  structuredData?: any;
}

class SEOGenerator {
  private baseUrl: string;
  private sitemapPath: string;
  private robotsPath: string;

  constructor(baseUrl: string = 'https://footprog.com') {
    this.baseUrl = baseUrl;
    this.sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    this.robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  }

  // Générer les métadonnées SEO pour chaque page
  generatePageMetadata(page: string, data?: any): SEOMetadata {
    const baseMetadata = {
      title: 'FootProg - Trouvez des matchs de football près de chez vous',
      description: 'Rejoignez des joueurs passionnés, créez des matchs et profitez du football amateur dans votre région. Inscription gratuite.',
      keywords: ['football', 'match', 'sport', 'amateur', 'terrain', 'équipe', 'joueur'],
      canonicalUrl: `${this.baseUrl}${page}`,
    };

    switch (page) {
      case '/':
        return {
          ...baseMetadata,
          title: 'FootProg - Plateforme de matchs de football amateur',
          description: 'Trouvez et organisez facilement des matchs de football amateurs près de chez vous. Rejoignez une communauté de passionnés !',
          keywords: [...baseMetadata.keywords, 'accueil', 'plateforme', 'communauté'],
          structuredData: this.generateHomeStructuredData()
        };

      case '/find-matches':
        return {
          ...baseMetadata,
          title: 'Trouver des matchs de football - FootProg',
          description: 'Découvrez tous les matchs de football disponibles dans votre région. Filtrez par date, lieu et niveau.',
          keywords: [...baseMetadata.keywords, 'recherche', 'trouver', 'disponible'],
          canonicalUrl: `${this.baseUrl}/find-matches`
        };

      case '/create-match':
        return {
          ...baseMetadata,
          title: 'Créer un match de football - FootProg',
          description: 'Organisez votre propre match de football. Définissez le lieu, la date et invitez des joueurs.',
          keywords: [...baseMetadata.keywords, 'créer', 'organiser', 'inviter'],
          canonicalUrl: `${this.baseUrl}/create-match`
        };

      case '/how-it-works':
        return {
          ...baseMetadata,
          title: 'Comment ça marche - FootProg',
          description: 'Découvrez comment utiliser FootProg pour trouver des matchs, rejoindre des équipes et organiser vos propres rencontres.',
          keywords: [...baseMetadata.keywords, 'aide', 'guide', 'utilisation'],
          canonicalUrl: `${this.baseUrl}/how-it-works`
        };

      default:
        if (page.startsWith('/match/') && data) {
          return this.generateMatchMetadata(data);
        }
        return baseMetadata;
    }
  }

  private generateMatchMetadata(match: any): SEOMetadata {
    const location = match.location || 'lieu non spécifié';
    const date = new Date(match.date).toLocaleDateString('fr-FR');
    
    return {
      title: `Match ${match.title} - ${location} - FootProg`,
      description: `Rejoignez le match "${match.title}" le ${date} à ${location}. ${match.availableSpots} places disponibles sur ${match.playersTotal}.`,
      keywords: ['match', 'football', match.title, location, 'rejoindre'],
      canonicalUrl: `${this.baseUrl}/match/${match.id}`,
      structuredData: this.generateMatchStructuredData(match)
    };
  }

  private generateHomeStructuredData() {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "FootProg",
      "url": this.baseUrl,
      "description": "Plateforme de matchs de football amateur",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${this.baseUrl}/find-matches?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      "sameAs": [
        "https://facebook.com/footprog",
        "https://twitter.com/footprog",
        "https://instagram.com/footprog"
      ]
    };
  }

  private generateMatchStructuredData(match: any) {
    return {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": match.title,
      "description": match.additionalInfo || `Match de football amateur organisé via FootProg`,
      "startDate": new Date(match.date).toISOString(),
      "location": {
        "@type": "Place",
        "name": match.location,
        "address": match.location
      },
      "organizer": {
        "@type": "Person",
        "name": match.creator?.username || "Organisateur"
      },
      "sport": "Football",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "offers": {
        "@type": "Offer",
        "price": match.pricePerPlayer || 0,
        "priceCurrency": "EUR",
        "availability": match.availableSpots > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut"
      }
    };
  }

  // Générer le sitemap XML
  async generateSitemap() {
    try {
      const matches = await storage.getMatches();
      const urls: string[] = [];

      // Pages statiques
      const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/find-matches', priority: '0.9', changefreq: 'hourly' },
        { url: '/create-match', priority: '0.8', changefreq: 'weekly' },
        { url: '/how-it-works', priority: '0.7', changefreq: 'monthly' }
      ];

      staticPages.forEach(page => {
        urls.push(`
  <url>
    <loc>${this.baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
      });

      // Pages de matchs
      matches.forEach((match: any) => {
        urls.push(`
  <url>
    <loc>${this.baseUrl}/match/${match.id}</loc>
    <lastmod>${new Date(match.createdAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
      });

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

      // Créer le dossier public s'il n'existe pas
      const publicDir = path.dirname(this.sitemapPath);
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      fs.writeFileSync(this.sitemapPath, sitemap);
      console.log('✅ Sitemap généré avec succès');
      
      return sitemap;
    } catch (error) {
      console.error('❌ Erreur lors de la génération du sitemap:', error);
      throw error;
    }
  }

  // Générer robots.txt
  generateRobotsTxt() {
    const robots = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml

# Désautoriser les fichiers sensibles
Disallow: /api/
Disallow: /admin/
Disallow: /.env
Disallow: /logs/

# Crawl-delay pour éviter la surcharge
Crawl-delay: 1`;

    const publicDir = path.dirname(this.robotsPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(this.robotsPath, robots);
    console.log('✅ Robots.txt généré avec succès');
    
    return robots;
  }

  // Middleware pour injecter les métadonnées SEO
  injectSEOMiddleware = (req: any, res: any, next: any) => {
    // Récupérer les données nécessaires pour cette page
    const getPageData = async () => {
      if (req.path.startsWith('/match/')) {
        const matchId = parseInt(req.path.split('/')[2]);
        if (!isNaN(matchId)) {
          try {
            return await storage.getMatchWithDetails(matchId);
          } catch (error) {
            console.error('Erreur lors de la récupération du match pour SEO:', error);
          }
        }
      }
      return null;
    };

    // Ajouter les métadonnées à l'objet request
    getPageData().then(data => {
      req.seoMetadata = this.generatePageMetadata(req.path, data);
      next();
    }).catch(next);
  };

  // Générer le HTML des métadonnées pour l'injection dans le template
  generateMetaTags(metadata: SEOMetadata): string {
    return `
    <title>${metadata.title}</title>
    <meta name="description" content="${metadata.description}">
    <meta name="keywords" content="${metadata.keywords.join(', ')}">
    <link rel="canonical" href="${metadata.canonicalUrl}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${metadata.title}">
    <meta property="og:description" content="${metadata.description}">
    <meta property="og:url" content="${metadata.canonicalUrl}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="FootProg">
    ${metadata.ogImage ? `<meta property="og:image" content="${metadata.ogImage}">` : ''}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${metadata.title}">
    <meta name="twitter:description" content="${metadata.description}">
    ${metadata.ogImage ? `<meta name="twitter:image" content="${metadata.ogImage}">` : ''}
    
    ${metadata.structuredData ? 
      `<script type="application/ld+json">${JSON.stringify(metadata.structuredData)}</script>` : 
      ''
    }`;
  }
}

export default SEOGenerator;
