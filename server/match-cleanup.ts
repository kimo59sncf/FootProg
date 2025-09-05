import { db } from './db-sqlite';
import { matches, participants, messages } from '@shared/schema-sqlite';
import { lt, inArray } from 'drizzle-orm';

interface Match {
  id: number;
  title: string;
  date: Date;
  duration: number;
  location: string;
  playersNeeded: number;
  playersTotal: number;
  fieldType: string;
  pricePerPlayer?: number;
  creatorId: number;
}

export class MatchCleanupService {
  private static instance: MatchCleanupService;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): MatchCleanupService {
    if (!MatchCleanupService.instance) {
      MatchCleanupService.instance = new MatchCleanupService();
    }
    return MatchCleanupService.instance;
  }

  /**
   * Démarre le service de nettoyage automatique
   * @param intervalMinutes Intervalle en minutes (par défaut: 60 minutes)
   */
  public start(intervalMinutes: number = 60): void {
    if (this.intervalId) {
      console.log('⚠️ Service de nettoyage déjà démarré');
      return;
    }

    console.log(`🧹 Démarrage du service de nettoyage des matchs (toutes les ${intervalMinutes} minutes)`);
    
    // Nettoyage initial
    this.cleanup();
    
    // Programmer le nettoyage récurrent
    this.intervalId = setInterval(() => {
      this.cleanup();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Arrête le service de nettoyage
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Service de nettoyage arrêté');
    }
  }

  /**
   * Nettoie les matchs expirés
   */
  public async cleanup(): Promise<number> {
    try {
      console.log('=== MATCH CLEANUP DEBUG ===');
      console.log('DB object:', db ? 'DEFINED' : 'NULL/UNDEFINED');
      console.log('DB type:', typeof db);

      const now = new Date();

      // Trouver les matchs expirés (date + durée < maintenant)
      const expiredMatches = await db
        .select()
        .from(matches)
        .where(lt(matches.date, now));

      if (expiredMatches.length === 0) {
        console.log('✅ Aucun match expiré à nettoyer');
        return 0;
      }

      // Filtrer les matchs vraiment expirés (en tenant compte de la durée)
      const trulyExpiredMatches = expiredMatches.filter((match: Match) => {
        const matchEndTime = new Date(match.date.getTime() + match.duration * 60000);
        return matchEndTime < now;
      });

      if (trulyExpiredMatches.length === 0) {
        console.log('✅ Aucun match vraiment expiré à nettoyer');
        return 0;
      }

      console.log(`🧹 Nettoyage de ${trulyExpiredMatches.length} match(s) expiré(s)`);

      // Optionnel: Sauvegarder les matchs avant suppression
      await this.archiveExpiredMatches(trulyExpiredMatches);

      // Supprimer les matchs expirés
      const expiredIds = trulyExpiredMatches.map((match: Match) => match.id);
      
      // Supprimer les participants d'abord (contrainte de clé étrangère)
      if (db.delete) {
        await db.delete(participants).where(
          inArray(participants.matchId, expiredIds)
        );
        
        // Supprimer les messages
        await db.delete(messages).where(
          inArray(messages.matchId, expiredIds)
        );
        
        // Supprimer les matchs
        await db.delete(matches).where(
          inArray(matches.id, expiredIds)
        );
        
        console.log(`✅ ${expiredIds.length} match(s) expiré(s) supprimé(s)`);
        return expiredIds.length;
      }

      return 0;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des matchs expirés:', error);
      return 0;
    }
  }

  /**
   * Archive les matchs expirés avant suppression
   */
  private async archiveExpiredMatches(expiredMatches: Match[]): Promise<void> {
    try {
      const archiveData = {
        timestamp: new Date().toISOString(),
        matches: expiredMatches,
        count: expiredMatches.length
      };

      console.log(`📁 Archivage de ${expiredMatches.length} match(s) expiré(s)`);
      
      // Pour le développement, on log les matchs archivés
      if (process.env.NODE_ENV === 'development') {
        console.log('Matchs archivés:', expiredMatches.map(m => ({
          id: m.id,
          title: m.title,
          date: m.date,
          location: m.location
        })));
      }
    } catch (error) {
      console.error('⚠️ Erreur lors de l\'archivage:', error);
      // On continue même si l'archivage échoue
    }
  }

  /**
   * Nettoie manuellement les matchs expirés
   */
  public async manualCleanup(): Promise<{ deleted: number; message: string }> {
    const deletedCount = await this.cleanup();
    
    return {
      deleted: deletedCount,
      message: deletedCount > 0 
        ? `${deletedCount} match(s) expiré(s) supprimé(s)`
        : 'Aucun match expiré trouvé'
    };
  }

  /**
   * Obtient des statistiques sur les matchs expirés
   */
  public async getExpiredMatchesStats(): Promise<{
    total: number;
    expired: number;
    expiredDetails: any[];
  }> {
    try {
      const now = new Date();
      
      // Tous les matchs
      const allMatches = await db.select().from(matches);
      
      // Matchs expirés
      const expiredMatches = allMatches.filter((match: Match) => {
        const matchEndTime = new Date(match.date.getTime() + match.duration * 60000);
        return matchEndTime < now;
      });

      return {
        total: allMatches.length,
        expired: expiredMatches.length,
        expiredDetails: expiredMatches.map((match: Match) => ({
          id: match.id,
          title: match.title,
          date: match.date,
          duration: match.duration,
          location: match.location,
          expiredSince: Math.floor((now.getTime() - new Date(match.date.getTime() + match.duration * 60000).getTime()) / (1000 * 60 * 60)) + ' heures'
        }))
      };
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      return { total: 0, expired: 0, expiredDetails: [] };
    }
  }
}

// Export de l'instance singleton
export const matchCleanupService = MatchCleanupService.getInstance();
