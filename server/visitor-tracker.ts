// Script de suivi des visiteurs et analytics pour FootProg
import fs from 'fs';
import path from 'path';
import geoip from 'geoip-lite';

interface VisitorData {
  timestamp: number;
  ip: string;
  userAgent: string;
  page: string;
  referrer: string;
  country?: string;
  city?: string;
  sessionId: string;
}

interface Analytics {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  countries: Record<string, number>;
  pages: Record<string, number>;
  referrers: Record<string, number>;
  devices: Record<string, number>;
  dailyStats: Record<string, { visitors: number; pageViews: number }>;
}

class VisitorTracker {
  private logFile: string;
  private analyticsFile: string;

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'visitors.log');
    this.analyticsFile = path.join(process.cwd(), 'logs', 'analytics.json');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // Middleware Express pour tracker les visiteurs
  trackVisitor = (req: any, res: any, next: any) => {
    const visitorData: VisitorData = {
      timestamp: Date.now(),
      ip: this.getClientIP(req),
      userAgent: req.headers['user-agent'] || '',
      page: req.path,
      referrer: req.headers.referrer || req.headers.referer || '',
      sessionId: req.session?.id || 'anonymous'
    };

    // Géolocalisation
    const geo = geoip.lookup(visitorData.ip);
    if (geo) {
      visitorData.country = geo.country;
      visitorData.city = geo.city;
    }

    // Log de la visite
    this.logVisit(visitorData);

    // Mettre à jour les analytics
    this.updateAnalytics(visitorData);

    next();
  };

  private getClientIP(req: any): string {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
  }

  private logVisit(data: VisitorData) {
    const logEntry = JSON.stringify(data) + '\n';
    fs.appendFileSync(this.logFile, logEntry);
  }

  private updateAnalytics(data: VisitorData) {
    let analytics = this.loadAnalytics();
    
    analytics.pageViews++;
    
    // Pages populaires
    analytics.pages[data.page] = (analytics.pages[data.page] || 0) + 1;
    
    // Pays
    if (data.country) {
      analytics.countries[data.country] = (analytics.countries[data.country] || 0) + 1;
    }
    
    // Referrers
    if (data.referrer) {
      const domain = this.extractDomain(data.referrer);
      analytics.referrers[domain] = (analytics.referrers[domain] || 0) + 1;
    }
    
    // Device detection
    const device = this.detectDevice(data.userAgent);
    analytics.devices[device] = (analytics.devices[device] || 0) + 1;
    
    // Stats quotidiennes
    const today = new Date().toISOString().split('T')[0];
    if (!analytics.dailyStats[today]) {
      analytics.dailyStats[today] = { visitors: 0, pageViews: 0 };
    }
    analytics.dailyStats[today].pageViews++;
    
    this.saveAnalytics(analytics);
  }

  private loadAnalytics(): Analytics {
    try {
      if (fs.existsSync(this.analyticsFile)) {
        const data = fs.readFileSync(this.analyticsFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    }
    
    return {
      totalVisitors: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      countries: {},
      pages: {},
      referrers: {},
      devices: {},
      dailyStats: {}
    };
  }

  private saveAnalytics(analytics: Analytics) {
    try {
      fs.writeFileSync(this.analyticsFile, JSON.stringify(analytics, null, 2));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des analytics:', error);
    }
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'direct';
    }
  }

  private detectDevice(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android')) return 'mobile';
    if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
    return 'desktop';
  }

  // Obtenir les statistiques
  getAnalytics(): Analytics {
    return this.loadAnalytics();
  }

  // Obtenir les statistiques en temps réel
  getRealTimeStats() {
    const analytics = this.loadAnalytics();
    const last24h = Date.now() - (24 * 60 * 60 * 1000);
    
    // Lire les logs des dernières 24h
    const recentVisits = this.getRecentVisits(last24h);
    const uniqueIPs = new Set(recentVisits.map(v => v.ip));
    
    return {
      ...analytics,
      last24h: {
        visitors: uniqueIPs.size,
        pageViews: recentVisits.length
      }
    };
  }

  private getRecentVisits(since: number): VisitorData[] {
    try {
      if (!fs.existsSync(this.logFile)) return [];
      
      const lines = fs.readFileSync(this.logFile, 'utf8').split('\n').filter(line => line.trim());
      const visits: VisitorData[] = [];
      
      for (const line of lines.reverse()) {
        try {
          const visit = JSON.parse(line);
          if (visit.timestamp >= since) {
            visits.push(visit);
          } else {
            break; // Les logs sont chronologiques
          }
        } catch {
          continue;
        }
      }
      
      return visits;
    } catch {
      return [];
    }
  }

  // Nettoyer les anciens logs (garder 30 jours)
  cleanOldLogs() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.getRecentVisits(thirtyDaysAgo); // Nettoie automatiquement
  }
}

export default VisitorTracker;
