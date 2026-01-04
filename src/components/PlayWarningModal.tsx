import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface PlayWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  movieTitle: string;
}

const PlayWarningModal = ({ isOpen, onClose, onContinue, movieTitle }: PlayWarningModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Before You Watch
          </DialogTitle>
          <DialogDescription className="text-left space-y-3 pt-2">
            <p>
              <strong>"{movieTitle}"</strong> is provided by a third-party streaming service.
            </p>
            <p>
              You may encounter ads. For the best experience, we recommend using an ad blocker extension.
            </p>
            <p className="text-xs text-muted-foreground">
              Tip: If a click opens an ad, simply close it and try again.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onContinue} className="flex-1">
            Continue to Watch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayWarningModal;
