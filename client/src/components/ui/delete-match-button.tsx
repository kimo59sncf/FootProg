import React, { useState } from 'react';
import { Button } from './button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from './alert-dialog';
import { TrashIcon, LoaderIcon } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface DeleteMatchButtonProps {
  matchId: number;
  matchTitle: string;
  isCreator: boolean;
  onDeleted?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function DeleteMatchButton({ 
  matchId, 
  matchTitle, 
  isCreator, 
  onDeleted,
  variant = 'destructive',
  size = 'default',
  showText = true
}: DeleteMatchButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Seul le créateur peut supprimer
  if (!isCreator) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression');
      }

      toast({
        title: "Match supprimé",
        description: `Le match "${matchTitle}" a été supprimé avec succès.`,
        variant: "default"
      });

      setIsOpen(false);
      
      // Callback pour notifier le parent
      if (onDeleted) {
        onDeleted();
      }

    } catch (error) {
      console.error('Erreur lors de la suppression du match:', error);
      
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer le match",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            <TrashIcon className="h-4 w-4" />
          )}
          {showText && size !== 'icon' && (
            <span className="ml-2">
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </span>
          )}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le match ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le match <strong>"{matchTitle}"</strong> ?
            <br /><br />
            Cette action est irréversible. Tous les participants inscrits seront automatiquement 
            désinscrits et ne pourront plus accéder au chat du match.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                Suppression...
              </>
            ) : (
              'Supprimer définitivement'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
