import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { FeedbackForm, FeedbackModalProps } from '@/types';

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(
    null
  );

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { error } = await supabase.from('feedback').insert([
        {
          name: feedbackForm.name,
          email: feedbackForm.email,
          message: feedbackForm.message,
        },
      ]);

      if (error) throw error;

      setSubmitStatus('success');

      // Reset form and close modal after 3 seconds
      setTimeout(() => {
        onClose();
        setFeedbackForm({ name: '', email: '', message: '' });
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error sending feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-card dark:bg-background border border-border rounded-lg w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            type="button"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFeedbackSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Name
            </label>
            <input
              type="text"
              value={feedbackForm.name}
              onChange={e =>
                setFeedbackForm({ ...feedbackForm, name: e.target.value })
              }
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              value={feedbackForm.email}
              onChange={e =>
                setFeedbackForm({ ...feedbackForm, email: e.target.value })
              }
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Message
            </label>
            <textarea
              value={feedbackForm.message}
              onChange={e =>
                setFeedbackForm({ ...feedbackForm, message: e.target.value })
              }
              required
              rows={5}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Tell us what's on your mind..."
            />
          </div>

          {submitStatus === 'success' && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg text-sm">
              ✓ Thank you for reaching out! We've received your message and will
              get back to you within 24-48 hours.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
              ✗ Something went wrong. Please try again or email us directly at
              support@yourdomain.com
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
