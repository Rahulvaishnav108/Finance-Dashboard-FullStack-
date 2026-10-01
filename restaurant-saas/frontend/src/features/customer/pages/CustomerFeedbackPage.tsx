import React, { useState, useRef } from 'react';
import { useCustomerStore } from '../store/customer.store';

const EMOJIS = [
  { id: 'bad', emoji: '😠', label: 'Very Bad' },
  { id: 'okay', emoji: '😐', label: 'Okay' },
  { id: 'good', emoji: '😊', label: 'Good' },
  { id: 'excellent', emoji: '🤩', label: 'Amazing!' },
];

const CATEGORIES = [
  { icon: 'restaurant', label: 'Food Quality', color: 'bg-green-100 text-green-600' },
  { icon: 'restaurant_menu', label: 'Taste', color: 'bg-orange-100 text-orange-600' },
  { icon: 'delivery_dining', label: 'Service Speed', color: 'bg-purple-100 text-purple-600' },
  { icon: 'inventory_2', label: 'Ambience', color: 'bg-blue-100 text-blue-600' },
];

export default function CustomerFeedbackPage() {
  const { orders, requestService, addNotification } = useCustomerStore();

  // Find the latest served/completed order for feedback. Fallback to first order, then a mock fallback if no orders exist.
  const latestServedOrder = orders.find(o => o.status === 'Served' || o.status === 'Completed') || orders[0];
  const orderId = latestServedOrder ? latestServedOrder.id : '#ORD-2840';
  const orderDate = latestServedOrder?.date || '23 Jun, 08:15 PM';

  const [selected, setSelected] = useState('excellent');
  const [ratings, setRatings] = useState<Record<string, number>>({
    'Food Quality': 5,
    Taste: 5,
    'Service Speed': 4,
    Ambience: 5,
  });
  const [feedback, setFeedback] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMsg, setSupportMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    overall: string;
    emoji: string;
    ratings: Record<string, number>;
    feedback: string;
    photos: string[];
    date: string;
    orderId: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPhotosClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      showToast(`${selectedFiles.length} photo(s) selected!`);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMsg.trim()) {
      showToast('Please type a message first.', 'error');
      return;
    }

    requestService({
      id: `req-${Date.now()}`,
      label: 'Support Request',
      description: supportMsg,
      type: 'other',
      status: 'Pending',
    });

    addNotification(
      'Support Ticket Created ✉️',
      `Your support ticket has been submitted. Message: "${supportMsg.slice(0, 30)}..."`,
      'info',
      '/customer/feedback'
    );

    showToast('Support ticket submitted successfully!');
    setSupportMsg('');
    setSupportModalOpen(false);
  };

  const handleSubmitFeedback = () => {
    const selectedEmojiObj = EMOJIS.find((e) => e.id === selected);
    const overallText = selectedEmojiObj?.label || selected;
    const overallEmoji = selectedEmojiObj?.emoji || '🤩';

    addNotification(
      'Feedback Received! 🌟',
      `Thank you for your rating: "${overallText}". We appreciate your feedback!`,
      'info',
      '/customer/feedback'
    );

    setSubmittedData({
      overall: overallText,
      emoji: overallEmoji,
      ratings: { ...ratings },
      feedback: feedback,
      photos: [...photos],
      date: orderDate,
      orderId: orderId,
    });
    setIsSubmitted(true);

    showToast('Feedback submitted! Thank you.');
  };

  if (isSubmitted && submittedData) {
    return (
      <div className="p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto h-full sd-custom-scrollbar animate-fadeIn">
        {/* Toast Alert */}
        {toast && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-[150] flex items-center gap-2 border text-sm font-semibold font-sans animate-fadeIn ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-900 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-900 dark:text-red-300'
          }`}>
            <span className="material-symbols-outlined text-lg">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {toast.message}
          </div>
        )}

        {/* Success header */}
        <div className="text-center py-8 px-4 bg-white dark:bg-sd-surface-container rounded-3xl border border-sd-surface-variant sd-food-card-shadow mb-8 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl font-bold">done</span>
          </div>
          <h2 className="text-2xl font-extrabold text-sd-on-surface font-sans">Feedback Submitted done✅</h2>
          <p className="text-sm text-sd-on-surface-variant font-sans mt-2">
            Thank you! Your feedback helps us improve our service.
          </p>
        </div>

        {/* The Feedback we gave card */}
        <div className="bg-white dark:bg-sd-surface-container rounded-3xl border border-sd-surface-variant sd-food-card-shadow p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-start border-b border-sd-surface-variant pb-4">
            <div>
              <h3 className="text-lg font-bold text-sd-on-surface font-sans">Your Feedback Summary</h3>
              <p className="text-xs text-sd-on-surface-variant font-sans mt-1">Order {submittedData.orderId}</p>
            </div>
            <div className="text-right">
              <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full font-sans">Submitted</span>
              <p className="text-[10px] text-sd-on-surface-variant font-sans mt-1.5">Date: {submittedData.date}</p>
            </div>
          </div>

          {/* Overall Experience */}
          <div className="flex items-center gap-4 p-4 bg-sd-surface-container-low rounded-2xl">
            <span className="text-4xl">{submittedData.emoji}</span>
            <div>
              <p className="text-xs text-sd-on-surface-variant font-sans uppercase font-bold tracking-wider">Overall Experience</p>
              <p className="text-base font-extrabold text-sd-primary font-sans">{submittedData.overall}</p>
            </div>
          </div>

          {/* Category Ratings */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-sd-on-surface-variant font-bold font-sans">Ratings Given</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CATEGORIES.map(({ icon, label, color }) => {
                const ratingVal = submittedData.ratings[label] || 0;
                return (
                  <div key={label} className="flex items-center gap-3 p-3 bg-sd-surface/30 rounded-xl border border-sd-surface-variant">
                    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold font-sans text-sd-on-surface">{label}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`material-symbols-outlined text-[16px] ${star <= ratingVal ? 'text-sd-primary' : 'text-sd-surface-container-high'}`}
                            style={{ fontVariationSettings: star <= ratingVal ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comments/Feedback Text */}
          {submittedData.feedback && (
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider text-sd-on-surface-variant font-bold font-sans">Your Comments</h4>
              <div className="p-4 bg-sd-surface-container-low rounded-2xl border border-sd-surface-variant">
                <p className="text-sm text-sd-on-surface font-sans italic">"{submittedData.feedback}"</p>
              </div>
            </div>
          )}

          {/* Photos */}
          {submittedData.photos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider text-sd-on-surface-variant font-bold font-sans">Uploaded Photos</h4>
              <div className="flex gap-2 overflow-x-auto py-1 sd-custom-scrollbar">
                {submittedData.photos.map((src, idx) => (
                  <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-sd-surface-variant shrink-0">
                    <img src={src} alt="Uploaded" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto h-full sd-custom-scrollbar animate-fadeIn">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-[150] flex items-center gap-2 border text-sm font-semibold font-sans animate-fadeIn ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-900 dark:text-green-300'
            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-900 dark:text-red-300'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-sd-on-surface font-sans">Rate Your Experience</h2>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-sd-on-surface-variant font-sans">Order {orderId}</p>
          <span className="bg-sd-secondary-container text-sd-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-full font-sans">Served</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 bg-white dark:bg-sd-surface-container rounded-2xl p-5 border border-sd-surface-variant sd-food-card-shadow flex flex-col sm:flex-row gap-5">
          <div className="w-full sm:w-1/3 h-40 rounded-xl bg-gradient-to-br from-sd-primary-fixed via-sd-primary-fixed-dim to-sd-primary-container/20 flex items-center justify-center shrink-0 overflow-hidden">
            <span className="material-symbols-outlined text-6xl text-sd-primary/30">lunch_dining</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-wider text-sd-on-surface-variant font-semibold mb-1 font-sans">Served on</p>
            <p className="text-base font-bold font-sans mb-3">{orderDate}</p>
            <div className="p-3.5 bg-sd-surface-container-low rounded-xl">
              <p className="text-sm text-sd-on-surface-variant font-sans">Thank you for dining with us! We hope you enjoyed your meal and look forward to serving you again soon.</p>
            </div>
          </div>
        </div>

        {/* Emoji Rating */}
        <div className="bg-white rounded-2xl p-5 border border-sd-surface-variant sd-food-card-shadow flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-sd-on-surface-variant mb-5 font-sans">How was your overall experience?</h3>
          <div className="flex justify-between w-full max-w-xs mb-5">
            {EMOJIS.map(({ id, emoji, label }) => {
              const isSelected = selected === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelected(id)}
                  className={`flex flex-col items-center gap-1 group transition-all hover:scale-110 ${isSelected ? 'scale-110' : ''}`}
                >
                  <div className="relative">
                    <span className="text-3xl">{emoji}</span>
                    {isSelected && <div className="absolute -inset-1 bg-sd-primary-container/20 rounded-full -z-10 blur-sm" />}
                  </div>
                  <span className={`text-[11px] font-semibold font-sans ${isSelected ? 'text-sd-primary' : 'text-sd-on-surface-variant'}`}>{label}</span>
                </button>
              );
            })}
          </div>
          {selected && (
            <div className="w-full py-2 bg-sd-secondary-container/10 border border-sd-secondary-container/20 rounded-lg">
              <p className="text-sd-on-secondary-container font-bold text-sm font-sans">
                {EMOJIS.find((e) => e.id === selected)?.label} {selected === 'excellent' ? '😍' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Category Ratings */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-sd-on-surface font-sans">Rate the following</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES.map(({ icon, label, color }) => (
              <div
                key={label}
                className="bg-white p-4 rounded-xl border border-sd-surface-variant flex items-center gap-3 hover:border-sd-primary/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold font-sans">{label}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRatings((prev) => ({ ...prev, [label]: star }))}>
                        <span
                          className={`material-symbols-outlined text-[20px] ${star <= (ratings[label] || 0) ? 'text-sd-primary' : 'text-sd-surface-container-high'}`}
                          style={{ fontVariationSettings: star <= (ratings[label] || 0) ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Text */}
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-sd-on-surface font-sans">Tell us more</h3>
          <div className="flex-grow flex flex-col bg-white rounded-xl border border-sd-surface-variant p-4 sd-food-card-shadow">
            <textarea
              className="w-full flex-1 bg-transparent border-none focus:ring-0 text-sm font-sans text-sd-on-surface resize-none p-0 focus:outline-none"
              placeholder="Share your thoughts about your experience..."
              rows={4}
              maxLength={300}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <p className="text-right text-[11px] text-sd-on-surface-variant mt-2 font-sans">{feedback.length}/300</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              onClick={handleAddPhotosClick}
              className="flex items-center justify-center gap-2 py-3 bg-white border border-sd-surface-variant rounded-xl text-sm font-bold hover:bg-sd-surface-container-low transition-colors font-sans"
            >
              <span className="material-symbols-outlined text-sd-primary text-[18px]">add_a_photo</span>
              {photos.length > 0 ? `Add Photos (${photos.length})` : 'Add Photos'}
            </button>
            <button
              onClick={() => setSupportModalOpen(true)}
              className="flex items-center justify-center gap-2 py-3 bg-white border border-sd-surface-variant rounded-xl text-sm font-bold hover:bg-sd-surface-container-low transition-colors font-sans"
            >
              <span className="material-symbols-outlined text-sd-tertiary text-[18px]">support_agent</span>
              Write to Support
            </button>
          </div>

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-1 sd-custom-scrollbar">
              {photos.map((src, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-sd-surface-variant shrink-0 group">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="lg:col-span-3 mt-2">
          <button
            onClick={handleSubmitFeedback}
            className="w-full max-w-md mx-auto block py-4 bg-sd-primary-container text-white rounded-2xl font-bold text-base shadow-xl hover:scale-[1.02] active:scale-95 transition-all font-sans flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            Submit Feedback
          </button>
          <p className="text-center text-xs text-sd-on-surface-variant mt-3 font-sans">Thank you! Your feedback helps us improve.</p>
        </div>
      </div>

      {/* Support Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-3xl border border-sd-surface-variant w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 bg-sd-surface-container-low border-b border-sd-surface-variant flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg font-sans text-sd-on-surface">Contact Support</h3>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white dark:bg-sd-surface hover:bg-sd-surface-container text-sd-on-surface-variant hover:text-sd-on-surface flex items-center justify-center transition-colors border border-sd-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSendSupport} className="p-6 space-y-4">
              <p className="text-xs text-sd-on-surface-variant font-sans">
                Need help with your order or have a specific inquiry? Write your message below, and our staff will respond right away.
              </p>
              <textarea
                className="w-full p-3 bg-white dark:bg-sd-surface border border-sd-surface-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-sd-primary text-sm font-sans resize-none"
                placeholder="Type your message to support..."
                rows={4}
                value={supportMsg}
                onChange={(e) => setSupportMsg(e.target.value)}
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSupportModalOpen(false)}
                  className="px-4 py-2 bg-white border border-sd-surface-variant hover:bg-sd-surface-container-low rounded-xl text-xs font-bold font-sans transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sd-primary text-white rounded-xl text-xs font-bold hover:shadow-lg transition-colors font-sans"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
