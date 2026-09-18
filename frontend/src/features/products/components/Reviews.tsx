import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../../shared/context/ToastContext';
import { reviewsApi, type Review } from '../reviewsApi';
import { Icon } from '../../../shared/components/ui/Icon';

interface ReviewsProps {
  productId: string;
}

export const Reviews: React.FC<ReviewsProps> = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reviewsApi.list(productId, page, 10);
      setReviews(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      
      // If user is logged in, check if they have a review to edit
      if (user) {
        const userReview = data.items.find(r => (r.user as any)._id === (user as any)._id || (r.user as any) === (user as any)._id || (r.user as any).id === (user as any).id);
        if (userReview) {
          setEditingReviewId(userReview._id);
          setRating(userReview.rating);
          setComment(userReview.comment || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, page, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast({ message: 'Please log in to leave a review', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingReviewId) {
        await reviewsApi.update(editingReviewId, { rating, comment });
        showToast({ message: 'Review updated successfully', type: 'success' });
      } else {
        await reviewsApi.create({ product: productId, rating, comment });
        showToast({ message: 'Review submitted successfully', type: 'success' });
      }
      // Reset and refresh
      setRating(5);
      setComment('');
      setEditingReviewId(null);
      setPage(1);
      fetchReviews();
    } catch (err: any) {
      showToast({ message: err.response?.data?.message || 'Failed to submit review', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await reviewsApi.delete(id);
      showToast({ message: 'Review deleted', type: 'success' });
      setEditingReviewId(null);
      setRating(5);
      setComment('');
      fetchReviews();
    } catch (err) {
      showToast({ message: 'Failed to delete review', type: 'error' });
    }
  };

  return (
    <div className="w-full">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-space-lg">Reviews ({total})</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        <div className="lg:col-span-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-space-lg">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">
              {editingReviewId ? 'Edit your review' : 'Share your thoughts'}
            </h3>
            
            {!isAuthenticated ? (
              <div className="py-space-md text-center">
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">You must be logged in to leave a review.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Rating</label>
                  <div className="flex items-center gap-1 text-primary">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button"
                        className="hover:scale-110 transition-transform cursor-pointer"
                        onClick={() => setRating(star)}
                      >
                        <Icon name={star <= rating ? 'star' : 'star_border'} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Comment</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you think about this piece..."
                    className="w-full bg-surface border border-outline-variant/50 text-on-surface font-body-md text-body-md rounded p-3 focus:outline-none focus:border-primary resize-y min-h-[100px]"
                    maxLength={1000}
                  ></textarea>
                </div>
                
                <div className="flex items-center gap-3 mt-space-xs">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-label-md text-label-md rounded py-2.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : editingReviewId ? 'Update Review' : 'Submit Review'}
                  </button>
                  {editingReviewId && (
                    <button 
                      type="button" 
                      onClick={() => handleDelete(editingReviewId)}
                      className="px-4 py-2.5 border border-error/40 text-error hover:bg-error/10 rounded transition-colors"
                      title="Delete Review"
                    >
                      <Icon name="delete" />
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {isLoading ? (
             <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>
          ) : reviews.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-space-xl flex flex-col items-center justify-center text-center">
              <Icon name="chat_bubble_outline" className="text-4xl text-outline mb-space-sm" />
              <p className="font-body-md text-body-md text-on-surface-variant">No reviews yet. Be the first to share your experience.</p>
            </div>
          ) : (
            <>
              {reviews.map(review => (
                <div key={review._id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-space-md flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-headline-sm overflow-hidden">
                        {review.user?.avatar ? <img src={review.user.avatar} className="w-full h-full object-cover" alt={review.user?.name} /> : review.user?.name?.[0] || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">{review.user?.name || 'Unknown User'}</span>
                        <span className="font-label-sm text-label-sm text-outline">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-primary text-[14px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon key={i} name={i < review.rating ? 'star' : 'star_border'} />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap">{review.comment}</p>
                  )}
                </div>
              ))}
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-space-md">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 bg-surface-container rounded disabled:opacity-50"><Icon name="chevron_left" /></button>
                  <span className="font-label-md text-label-md text-on-surface">Page {page} of {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 bg-surface-container rounded disabled:opacity-50"><Icon name="chevron_right" /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
