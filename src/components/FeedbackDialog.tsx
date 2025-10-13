import { useState } from "react";
import { motion } from "motion/react";
import { MessageSquare, Send, X, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";
import { API_CONFIG } from "../lib/api";
import { storage } from "../lib/storage";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    if (rating === null) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const userEmail = storage.getUserEmail() || 'anonymous';
      const userName = storage.getUserFullName() || 'Anonymous User';

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FEEDBACK}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            feedback: feedback.trim(),
            rating,
            userEmail,
            userName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }

      toast.success('Feedback sent successfully', {
        description: 'Thank you for helping us improve Brand Sense!'
      });

      // Reset form
      setFeedback("");
      setRating(null);
      onOpenChange(false);

    } catch (error) {
      console.error('Failed to send feedback:', error);
      toast.error('Failed to send feedback', {
        description: 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Help us improve Brand Sense by sharing your thoughts and suggestions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating */}
          <div className="space-y-3">
            <Label className="text-foreground">
              How would you rate your experience?
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <motion.button
                  key={value}
                  onClick={() => setRating(value)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    w-10 h-10 rounded-lg border transition-all duration-200
                    flex items-center justify-center
                    ${rating === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:border-primary/50 text-foreground'
                    }
                  `}
                >
                  <span className="tracking-tight">{value}</span>
                </motion.button>
              ))}
            </div>
            <p className="text-muted-foreground tracking-tight flex items-center justify-between">
              <span>1 = Poor</span>
              <span>10 = Excellent</span>
            </p>
          </div>

          {/* Feedback Text */}
          <div className="space-y-3">
            <Label htmlFor="feedback" className="text-foreground">
              Your Feedback
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you think about Brand Sense. What features do you love? What could be improved?"
              className="min-h-[120px] bg-input-background border-border text-foreground resize-none"
              maxLength={1000}
            />
            <p className="text-muted-foreground tracking-tight">
              {feedback.length}/1000 characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 bg-card border-border hover:bg-secondary/80"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !feedback.trim() || rating === null}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
