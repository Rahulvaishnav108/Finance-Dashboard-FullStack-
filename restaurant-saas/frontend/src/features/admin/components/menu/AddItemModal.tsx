import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, ImagePlus } from 'lucide-react';
import { useMenuStore } from '../../store/menu.store';
import type { MenuItemStatus } from '../../store/menu.store';

interface Props {
  onClose: () => void;
}

const STATUS_OPTIONS: MenuItemStatus[] = ['Available', 'Unavailable', 'Low Stock', 'Out of Stock'];

const FALLBACK_IMG = 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=dish';

export function AddItemModal({ onClose }: Props): JSX.Element {
  const { addItem, categories } = useMenuStore();

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [stock,       setStock]       = useState('');
  const [category,    setCategory]    = useState('');
  const [status,      setStatus]      = useState<MenuItemStatus>('Available');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageData,    setImageData]    = useState<string>('');
  const [dragOver,     setDragOver]     = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Non-'all' categories only
  const validCategories = categories.filter((c) => c.id !== 'all');

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageData(result);    // base64 data URI — stored locally in memory
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim())          errs.name        = 'Name is required';
    if (!price || +price <= 0) errs.price       = 'Enter a valid price';
    if (!stock || +stock < 0)  errs.stock       = 'Enter a valid stock quantity';
    if (!category)             errs.category    = 'Select a category';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addItem({
      name:        name.trim(),
      description: description.trim(),
      price:       parseFloat(price),
      stock:       parseInt(stock, 10),
      category,
      status,
      image:       imageData || FALLBACK_IMG,
      enabled:     true,
    });
    onClose();
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 text-sm rounded-xl border outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 ${
      errors[field]
        ? 'border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/40 focus:border-orange-300 dark:focus:border-orange-700'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100">Add New Item</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Fill in the details to add a new menu item</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Image Upload */}
          <div>
            <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Item Image</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`w-full relative h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center overflow-hidden ${
                dragOver
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Change Image
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center px-4">
                  <ImagePlus className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Click or drag &amp; drop to upload</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">PNG, JPG, WEBP • Stored locally in app</p>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="item-name" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Item Name *</label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Paneer Tikka"
              className={inputClass('name')}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="item-desc" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
            <textarea
              id="item-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the dish..."
              rows={2}
              className={`${inputClass('description')} resize-none`}
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="item-price" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">₹</span>
                <input
                  id="item-price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className={`${inputClass('price')} pl-7`}
                />
              </div>
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <label htmlFor="item-stock" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Stock Qty *</label>
              <input
                id="item-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className={inputClass('stock')}
              />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="item-category" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Category *</label>
              <select
                id="item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass('category')}
              >
                <option value="">Select category</option>
                {validCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>
            <div>
              <label htmlFor="item-status" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Status</label>
              <select
                id="item-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as MenuItemStatus)}
                className={inputClass('status')}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm transition-colors"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}