import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Database,
  Eye,
  EyeOff,
  FolderKanban,
  Image as ImageIcon,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Presentation,
  Search,
  ShieldAlert,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { CATEGORIES, HERO_SLIDES, MENU_ITEMS } from '../data/catalog';
import { PRIMARY_ADMIN_EMAIL } from '../firebase';
import { useStore } from '../context/StoreContext';
import { Category, CategoryId, DishSizeOption, HeroSlide, MenuItem } from '../types/menu';
import { FoodImage } from './FoodImage';

type AdminTab = 'dishes' | 'categories' | 'slides';

const BASE_GALLERY_IMAGES = Array.from(
  new Map(
    [
      ...CATEGORIES.map((c) => [c.image, { src: c.image, label: c.name }] as const),
      ...HERO_SLIDES.map((s) => [s.image, { src: s.image, label: s.title }] as const),
      ...MENU_ITEMS.map((item) => [item.image, { src: item.image, label: item.name }] as const),
    ]
  ).values()
);

const EMOJI_PRESETS = ['🍽️', '🥟', '🍔', '🌭', '🌯', '🥩', '🍟', '🧀', '🍗', '🥣', '🥤', '🍨', '🧁', '🥗', '🍕', '☕'];

function buildSlideDraftFromCategory(category: Category, sortOrder: number): HeroSlide {
  return {
    id: `slide-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    categoryId: category.id,
    kicker: `${category.emoji} ${category.name} · Специальное предложение`,
    title: category.name,
    description: category.subtitle || `Попробуйте свежие позиции из раздела «${category.name}».`,
    ctaLabel: `Выбрать: ${category.name}`.slice(0, 80),
    image: category.image,
    available: true,
    sortOrder,
  };
}

interface DishFormModalProps {
  initialItem: MenuItem | null;
  categories: Category[];
  galleryImages: { src: string; label: string }[];
  onClose: () => void;
  onSave: (item: MenuItem, isNew: boolean) => Promise<void>;
}

function DishFormModal({
  initialItem,
  categories,
  galleryImages,
  onClose,
  onSave,
}: DishFormModalProps) {
  const isNew = !initialItem;
  const fallbackCatId = categories[0]?.id ?? 'pelmeni';
  const [categoryId, setCategoryId] = useState<CategoryId>(initialItem?.categoryId ?? fallbackCatId);
  const [name, setName] = useState(initialItem?.name ?? '');
  const [price, setPrice] = useState(String(initialItem?.price ?? 250));
  const [weight, setWeight] = useState(initialItem?.weight ?? '250 г');
  const [tag, setTag] = useState(initialItem?.tag ?? '');
  const [description, setDescription] = useState(initialItem?.description ?? '');
  const [image, setImage] = useState(
    initialItem?.image ??
      galleryImages[0]?.src ??
      '/src/assets/images/hero_pelmeni_1795535551714.jpg'
  );
  const [available, setAvailable] = useState(initialItem?.available !== false);
  const [sizes, setSizes] = useState<DishSizeOption[]>(initialItem?.sizes ?? []);
  const [showGallery, setShowGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleAddSizeRow = () => {
    if (sizes.length >= 6) return;
    const idx = sizes.length + 1;
    setSizes((prev) => [
      ...prev,
      {
        id: `size-${Date.now()}-${idx}`,
        label: idx === 1 ? 'Маленькая (S)' : idx === 2 ? 'Средняя (M)' : 'Большая (XXL)',
        shortLabel: idx === 1 ? 'S' : idx === 2 ? 'M' : 'XXL',
        weight: '300 г',
        price: Number(price) || 250,
      },
    ]);
  };

  const handleSizeChange = (index: number, field: keyof DishSizeOption, value: string | number) => {
    setSizes((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleRemoveSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Укажите название блюда.');
      return;
    }
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Укажите корректную цену.');
      return;
    }
    if (!image.trim()) {
      setError('Укажите ссылку на фото или выберите изображение из галереи.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const nextId =
        initialItem?.id ?? `dish-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      await onSave(
        {
          id: nextId,
          categoryId,
          name: name.trim(),
          description: description.trim(),
          weight: weight.trim() || '1 порция',
          price: Math.round(parsedPrice),
          image: image.trim(),
          tag: tag.trim() || undefined,
          available,
          sortOrder: initialItem?.sortOrder,
          sizes: sizes.length > 0 ? sizes : undefined,
        },
        isNew
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить блюдо.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? 'Добавить блюдо' : 'Редактировать блюдо'}
    >
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl bg-[#16161A] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-white">
            {isNew ? 'Новое блюдо' : `Редактирование: ${initialItem?.name}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="admin-cat" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Категория *
              </label>
              <select
                id="admin-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="admin-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Название блюда *
              </label>
              <input
                id="admin-name"
                type="text"
                maxLength={140}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, Чизбургер XXL"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            <div>
              <label htmlFor="admin-price" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Цена (₽) *
              </label>
              <input
                id="admin-price"
                type="number"
                min={0}
                max={100000}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white font-mono focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            <div>
              <label htmlFor="admin-weight" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Вес / объём
              </label>
              <input
                id="admin-weight"
                type="text"
                maxLength={40}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="250 г"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label htmlFor="admin-tag" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Метка (необязательно)
              </label>
              <input
                id="admin-tag"
                type="text"
                maxLength={40}
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Хит, Новинка, Острое..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 accent-[#FFD400]"
              />
              <span className="text-sm text-white">Показывать в меню на сайте</span>
            </label>
          </div>

          <div>
            <label htmlFor="admin-desc" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Описание / состав
            </label>
            <textarea
              id="admin-desc"
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ингредиенты и подача..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400] resize-none"
            />
          </div>

          {/* Image URL + Built-in Gallery */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="admin-img" className="text-xs font-medium text-zinc-300">
                Фотография (ссылка URL или выбор из базы фото) *
              </label>
              <button
                type="button"
                onClick={() => setShowGallery((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFD400] hover:text-white cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showGallery ? 'Скрыть галерею' : 'Выбрать из фото сайта'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <FoodImage
                src={image}
                alt={name || 'Предпросмотр'}
                className="w-16 h-12 rounded-lg shrink-0 border border-white/10"
              />
              <input
                id="admin-img"
                type="text"
                maxLength={500}
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://... или /src/assets/images/..."
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            {showGallery && (
              <div className="p-3 rounded-xl bg-[#121215] border border-white/10 grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto">
                {galleryImages.map((img) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => {
                      setImage(img.src);
                      setShowGallery(false);
                    }}
                    title={img.label}
                    className={`relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      image === img.src
                        ? 'border-[#FFD400] ring-2 ring-[#FFD400]/50'
                        : 'border-white/10 hover:border-white/40'
                    }`}
                  >
                    <FoodImage src={img.src} alt={img.label} className="w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Optional Sizes */}
          <div className="p-3.5 rounded-xl bg-[#121215] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-white">Варианты размеров (необязательно)</p>
                <p className="text-[11px] text-zinc-400">
                  Например, для шаурмы S / M / XXL (до 6 вариантов)
                </p>
              </div>
              {sizes.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddSizeRow}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#FFD400] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить размер</span>
                </button>
              )}
            </div>

            {sizes.length > 0 && (
              <div className="space-y-2">
                {sizes.map((sz, idx) => (
                  <div
                    key={sz.id}
                    className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-center bg-[#18181B] p-2 rounded-lg border border-white/[0.06]"
                  >
                    <input
                      type="text"
                      value={sz.label}
                      maxLength={60}
                      onChange={(e) => handleSizeChange(idx, 'label', e.target.value)}
                      placeholder="Название"
                      className="col-span-4 px-2 py-1.5 rounded bg-[#121215] border border-white/10 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={sz.shortLabel}
                      maxLength={20}
                      onChange={(e) => handleSizeChange(idx, 'shortLabel', e.target.value)}
                      placeholder="S/M"
                      className="col-span-2 px-2 py-1.5 rounded bg-[#121215] border border-white/10 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={sz.weight}
                      maxLength={40}
                      onChange={(e) => handleSizeChange(idx, 'weight', e.target.value)}
                      placeholder="Вес"
                      className="col-span-2 px-2 py-1.5 rounded bg-[#121215] border border-white/10 text-xs text-white"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100000}
                      value={sz.price}
                      onChange={(e) => handleSizeChange(idx, 'price', Number(e.target.value))}
                      placeholder="₽"
                      className="col-span-3 px-2 py-1.5 rounded bg-[#121215] border border-white/10 text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(idx)}
                      aria-label="Удалить размер"
                      className="col-span-1 flex justify-center text-zinc-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-white/15 text-sm font-medium text-zinc-300 hover:text-white cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Сохраняем...' : isNew ? 'Добавить в меню' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CategoryFormModalProps {
  initialCategory: Category | null;
  defaultSortOrder: number;
  galleryImages: { src: string; label: string }[];
  onClose: () => void;
  onSave: (category: Category, isNew: boolean, alsoCreateSlide: boolean) => Promise<void>;
}

function CategoryFormModal({
  initialCategory,
  defaultSortOrder,
  galleryImages,
  onClose,
  onSave,
}: CategoryFormModalProps) {
  const isNew = !initialCategory;
  const [name, setName] = useState(initialCategory?.name ?? '');
  const [emoji, setEmoji] = useState(initialCategory?.emoji ?? '🍽️');
  const [subtitle, setSubtitle] = useState(initialCategory?.subtitle ?? '');
  const [image, setImage] = useState(
    initialCategory?.image ??
      galleryImages[0]?.src ??
      '/src/assets/images/hero_pelmeni_1795535551714.jpg'
  );
  const [sortOrder, setSortOrder] = useState(String(initialCategory?.sortOrder ?? defaultSortOrder));
  const [available, setAvailable] = useState(initialCategory?.available !== false);
  const [alsoCreateSlide, setAlsoCreateSlide] = useState(isNew);
  const [showGallery, setShowGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Укажите название категории.');
      return;
    }
    if (!image.trim()) {
      setError('Укажите ссылку на фото или выберите изображение из галереи.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const nextId =
        initialCategory?.id ?? `cat-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      await onSave(
        {
          id: nextId,
          name: name.trim(),
          emoji: emoji.trim() || '🍽️',
          subtitle: subtitle.trim(),
          image: image.trim(),
          available,
          sortOrder: Math.max(0, Math.round(Number(sortOrder) || defaultSortOrder)),
        },
        isNew,
        isNew && alsoCreateSlide
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить категорию.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? 'Добавить категорию' : 'Редактировать категорию'}
    >
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl bg-[#16161A] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-white">
            {isNew ? 'Новая категория' : `Редактирование: ${initialCategory?.name}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="cat-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Название категории *
              </label>
              <input
                id="cat-name"
                type="text"
                maxLength={80}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, Супы или Пицца"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            <div>
              <label htmlFor="cat-emoji" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Иконка (эмодзи)
              </label>
              <input
                id="cat-emoji"
                type="text"
                maxLength={16}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white text-center focus:outline-none focus:border-[#FFD400]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {EMOJI_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setEmoji(preset)}
                className={`w-8 h-8 rounded-lg border text-base flex items-center justify-center cursor-pointer transition-colors ${
                  emoji === preset
                    ? 'bg-[#FFD400]/20 border-[#FFD400]'
                    : 'bg-[#1E1E24] border-white/10 hover:border-white/30'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="cat-subtitle" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Короткое описание под названием
            </label>
            <input
              id="cat-subtitle"
              type="text"
              maxLength={200}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Например, Горячие домашние супы и солянка"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label htmlFor="cat-sort" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Порядок показа
              </label>
              <input
                id="cat-sort"
                type="number"
                min={0}
                max={100000}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white font-mono focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 accent-[#FFD400]"
              />
              <span className="text-sm text-white">Показывать на сайте</span>
            </label>
          </div>

          {isNew && (
            <label className="flex items-center gap-2.5 px-3.5 py-3 rounded-lg bg-[#FFD400]/10 border border-[#FFD400]/30 cursor-pointer">
              <input
                type="checkbox"
                checked={alsoCreateSlide}
                onChange={(e) => setAlsoCreateSlide(e.target.checked)}
                className="w-4 h-4 accent-[#FFD400]"
              />
              <span className="text-sm font-medium text-white">
                Сразу добавить эту категорию в слайды на главной
              </span>
            </label>
          )}

          {/* Image URL + Built-in Gallery */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="cat-img" className="text-xs font-medium text-zinc-300">
                Обложка категории (URL или фото сайта) *
              </label>
              <button
                type="button"
                onClick={() => setShowGallery((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFD400] hover:text-white cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showGallery ? 'Скрыть галерею' : 'Выбрать из фото сайта'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <FoodImage
                src={image}
                alt={name || 'Предпросмотр'}
                className="w-16 h-12 rounded-lg shrink-0 border border-white/10"
              />
              <input
                id="cat-img"
                type="text"
                maxLength={500}
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://... или /src/assets/images/..."
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            {showGallery && (
              <div className="p-3 rounded-xl bg-[#121215] border border-white/10 grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto">
                {galleryImages.map((img) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => {
                      setImage(img.src);
                      setShowGallery(false);
                    }}
                    title={img.label}
                    className={`relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      image === img.src
                        ? 'border-[#FFD400] ring-2 ring-[#FFD400]/50'
                        : 'border-white/10 hover:border-white/40'
                    }`}
                  >
                    <FoodImage src={img.src} alt={img.label} className="w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-white/15 text-sm font-medium text-zinc-300 hover:text-white cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Сохраняем...' : isNew ? 'Создать категорию' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SlideFormModalProps {
  initialSlide: HeroSlide | null;
  isNewSlide: boolean;
  categories: Category[];
  defaultSortOrder: number;
  galleryImages: { src: string; label: string }[];
  onClose: () => void;
  onSave: (slide: HeroSlide, isNew: boolean) => Promise<void>;
}

function SlideFormModal({
  initialSlide,
  isNewSlide,
  categories,
  defaultSortOrder,
  galleryImages,
  onClose,
  onSave,
}: SlideFormModalProps) {
  const firstCat = categories[0];
  const [categoryId, setCategoryId] = useState<CategoryId>(
    initialSlide?.categoryId ?? firstCat?.id ?? 'pelmeni'
  );
  const [kicker, setKicker] = useState(
    initialSlide?.kicker ?? (firstCat ? `${firstCat.emoji} ${firstCat.name}` : '')
  );
  const [title, setTitle] = useState(initialSlide?.title ?? firstCat?.name ?? '');
  const [description, setDescription] = useState(
    initialSlide?.description ?? firstCat?.subtitle ?? ''
  );
  const [ctaLabel, setCtaLabel] = useState(
    initialSlide?.ctaLabel ?? (firstCat ? `Выбрать: ${firstCat.name}` : 'Перейти в меню')
  );
  const [image, setImage] = useState(
    initialSlide?.image ??
      firstCat?.image ??
      galleryImages[0]?.src ??
      '/src/assets/images/hero_pelmeni_1795535551714.jpg'
  );
  const [sortOrder, setSortOrder] = useState(String(initialSlide?.sortOrder ?? defaultSortOrder));
  const [available, setAvailable] = useState(initialSlide?.available !== false);
  const [showGallery, setShowGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleApplyCategoryPreset = (catId: string) => {
    setCategoryId(catId);
    const chosen = categories.find((c) => c.id === catId);
    if (!chosen) return;
    if (isNewSlide) {
      setKicker(`${chosen.emoji} ${chosen.name} · Специальное предложение`);
      setTitle(chosen.name);
      setDescription(chosen.subtitle || `Попробуйте блюда из категории «${chosen.name}».`);
      setCtaLabel(`Выбрать: ${chosen.name}`.slice(0, 80));
      setImage(chosen.image);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Укажите заголовок слайда.');
      return;
    }
    if (!ctaLabel.trim()) {
      setError('Укажите текст на кнопке перехода.');
      return;
    }
    if (!image.trim()) {
      setError('Укажите ссылку на фото или выберите изображение из галереи.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const nextId =
        !isNewSlide && initialSlide?.id
          ? initialSlide.id
          : `slide-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      await onSave(
        {
          id: nextId,
          categoryId,
          kicker: kicker.trim(),
          title: title.trim(),
          description: description.trim(),
          ctaLabel: ctaLabel.trim(),
          image: image.trim(),
          available,
          sortOrder: Math.max(0, Math.round(Number(sortOrder) || defaultSortOrder)),
        },
        isNewSlide
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить слайд.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isNewSlide ? 'Добавить слайд' : 'Редактировать слайд'}
    >
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl bg-[#16161A] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-white">
            {isNewSlide ? 'Новый слайд на главной' : `Редактирование слайда`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="slide-cat" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Категория при нажатии на кнопку *
              </label>
              <select
                id="slide-cat"
                value={categoryId}
                onChange={(e) => handleApplyCategoryPreset(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
              {isNewSlide && (
                <p className="text-[11px] text-zinc-400 mt-1">
                  При выборе категории текст и фото подставятся автоматически — их можно изменить.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="slide-kicker" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Жёлтая строка над заголовком
              </label>
              <input
                id="slide-kicker"
                type="text"
                maxLength={140}
                value={kicker}
                onChange={(e) => setKicker(e.target.value)}
                placeholder="Например, Новинка меню · Горячие супы"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="slide-title" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Крупный заголовок слайда *
            </label>
            <input
              id="slide-title"
              type="text"
              maxLength={180}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например, Домашние супы и солянка каждый день"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400]"
            />
          </div>

          <div>
            <label htmlFor="slide-desc" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Описание под заголовком
            </label>
            <textarea
              id="slide-desc"
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание предложения..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="slide-cta" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Текст кнопки *
              </label>
              <input
                id="slide-cta"
                type="text"
                maxLength={80}
                required
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Выбрать супы"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            <div>
              <label htmlFor="slide-sort" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Порядок показа
              </label>
              <input
                id="slide-sort"
                type="number"
                min={0}
                max={100000}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-sm text-white font-mono focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 accent-[#FFD400]"
              />
              <span className="text-sm text-white">Показывать</span>
            </label>
          </div>

          {/* Image URL + Built-in Gallery */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="slide-img" className="text-xs font-medium text-zinc-300">
                Фоновое фото слайда (URL или фото сайта) *
              </label>
              <button
                type="button"
                onClick={() => setShowGallery((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFD400] hover:text-white cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showGallery ? 'Скрыть галерею' : 'Выбрать из фото сайта'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <FoodImage
                src={image}
                alt={title || 'Предпросмотр'}
                className="w-20 h-12 rounded-lg shrink-0 border border-white/10"
              />
              <input
                id="slide-img"
                type="text"
                maxLength={500}
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://... или /src/assets/images/..."
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#1E1E24] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            {showGallery && (
              <div className="p-3 rounded-xl bg-[#121215] border border-white/10 grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto">
                {galleryImages.map((img) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => {
                      setImage(img.src);
                      setShowGallery(false);
                    }}
                    title={img.label}
                    className={`relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      image === img.src
                        ? 'border-[#FFD400] ring-2 ring-[#FFD400]/50'
                        : 'border-white/10 hover:border-white/40'
                    }`}
                  >
                    <FoodImage src={img.src} alt={img.label} className="w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-white/15 text-sm font-medium text-zinc-300 hover:text-white cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Сохраняем...' : isNewSlide ? 'Добавить слайд' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminPanelView() {
  const {
    allMenuItems,
    allCategories,
    allHeroSlides,
    isCatalogSeeded,
    isCategoriesSeeded,
    isSlidesSeeded,
    authUser,
    isAuthReady,
    isAdmin,
    closeAdmin,
    signInAsAdmin,
    signOutAdmin,
    seedMenuToFirestore,
    saveMenuItem,
    quickUpdatePrice,
    toggleItemAvailability,
    deleteMenuItem,
    saveCategory,
    toggleCategoryAvailability,
    deleteCategory,
    saveHeroSlide,
    toggleSlideAvailability,
    deleteHeroSlide,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('dishes');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | CategoryId>('all');

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const [slideModalState, setSlideModalState] = useState<{
    slide: HeroSlide | null;
    isNew: boolean;
  } | null>(null);

  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [savedPriceId, setSavedPriceId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!savedPriceId) return;
    const timer = window.setTimeout(() => setSavedPriceId(null), 1800);
    return () => window.clearTimeout(timer);
  }, [savedPriceId]);

  const allSeeded = isCatalogSeeded && isCategoriesSeeded && isSlidesSeeded;

  const galleryImages = useMemo(() => {
    const map = new Map<string, { src: string; label: string }>();
    BASE_GALLERY_IMAGES.forEach((img) => map.set(img.src, img));
    allCategories.forEach((c) => {
      if (c.image && !map.has(c.image)) map.set(c.image, { src: c.image, label: c.name });
    });
    allHeroSlides.forEach((s) => {
      if (s.image && !map.has(s.image)) map.set(s.image, { src: s.image, label: s.title });
    });
    allMenuItems.forEach((m) => {
      if (m.image && !map.has(m.image)) map.set(m.image, { src: m.image, label: m.name });
    });
    return Array.from(map.values());
  }, [allCategories, allHeroSlides, allMenuItems]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    allCategories.forEach((c) => map.set(c.id, `${c.emoji} ${c.name}`));
    return map;
  }, [allCategories]);

  const slidesCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    allHeroSlides.forEach((s) => {
      map.set(s.categoryId, (map.get(s.categoryId) ?? 0) + 1);
    });
    return map;
  }, [allHeroSlides]);

  const dishesCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    allMenuItems.forEach((m) => {
      map.set(m.categoryId, (map.get(m.categoryId) ?? 0) + 1);
    });
    return map;
  }, [allMenuItems]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allMenuItems.filter((item) => {
      if (catFilter !== 'all' && item.categoryId !== catFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [allMenuItems, catFilter, search]);

  const handleLogin = async () => {
    setAuthError('');
    try {
      await signInAsAdmin();
    } catch {
      setAuthError('Не удалось выполнить вход. Разрешите всплывающее окно Google и попробуйте снова.');
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedMenuToFirestore();
    } finally {
      setSeeding(false);
    }
  };

  const handleQuickPriceSave = async (item: MenuItem) => {
    const raw = priceDrafts[item.id]?.trim();
    if (!raw) return;
    const nextPrice = Number(raw);
    if (!Number.isFinite(nextPrice) || nextPrice < 0) return;

    setBusyId(item.id);
    try {
      await quickUpdatePrice(item.id, nextPrice);
      setPriceDrafts((prev) => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
      setSavedPriceId(item.id);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleItemVisible = async (item: MenuItem) => {
    setBusyId(item.id);
    try {
      await toggleItemAvailability(item.id, item.available === false);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setBusyId(itemId);
    try {
      await deleteMenuItem(itemId);
      setConfirmDeleteId(null);
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveCategoryWithOptionalSlide = async (
    category: Category,
    isNew: boolean,
    alsoCreateSlide: boolean
  ) => {
    await saveCategory(category, isNew);
    if (alsoCreateSlide) {
      const slideDraft = buildSlideDraftFromCategory(category, allHeroSlides.length + 1);
      await saveHeroSlide(slideDraft, true);
    }
  };

  const handleToggleCategoryVisible = async (cat: Category) => {
    setBusyId(cat.id);
    try {
      await toggleCategoryAvailability(cat.id, cat.available === false);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setBusyId(categoryId);
    try {
      await deleteCategory(categoryId);
      setConfirmDeleteId(null);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleSlideVisible = async (slide: HeroSlide) => {
    setBusyId(slide.id);
    try {
      await toggleSlideAvailability(slide.id, slide.available === false);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    setBusyId(slideId);
    try {
      await deleteHeroSlide(slideId);
      setConfirmDeleteId(null);
    } finally {
      setBusyId(null);
    }
  };

  const handleAddCategoryToSlides = (category: Category) => {
    const draft = buildSlideDraftFromCategory(category, allHeroSlides.length + 1);
    setSlideModalState({ slide: draft, isNew: true });
  };

  return (
    <section className="py-10 sm:py-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={closeAdmin}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#FFD400] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Вернуться в меню сайта</span>
        </button>

        {authUser && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 hidden sm:inline">{authUser.email}</span>
            <button
              type="button"
              onClick={() => void signOutAdmin()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] border border-white/10 text-xs font-medium text-zinc-200 hover:border-[#FFD400] hover:text-[#FFD400] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Выйти</span>
            </button>
          </div>
        )}
      </div>

      {/* State 1: Loading Auth */}
      {!isAuthReady && (
        <div className="p-10 rounded-2xl bg-[#16161A] border border-white/10 text-center text-sm text-zinc-400">
          Проверяем доступ...
        </div>
      )}

      {/* State 2: Not Signed In */}
      {isAuthReady && !authUser && (
        <div className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-[#16161A] border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFD400]/10 border border-[#FFD400]/30 flex items-center justify-center text-[#FFD400] mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Управление меню</h1>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Войдите через Google-аккаунт владельца ({PRIMARY_ADMIN_EMAIL}), чтобы менять цены,
            фотографии, категории и слайды на главной без пересборки сайта.
          </p>
          {authError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {authError}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleLogin()}
            className="w-full py-3 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer"
          >
            Войти через Google
          </button>
        </div>
      )}

      {/* State 3: Signed in, but NOT admin */}
      {isAuthReady && authUser && !isAdmin && (
        <div className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-[#16161A] border border-red-500/30 text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
          <h1 className="font-display text-xl font-bold text-white">Доступ ограничен</h1>
          <p className="text-sm text-zinc-300">
            Аккаунт <span className="text-white font-medium">{authUser.email}</span> не имеет прав
            администратора. Войдите под аккаунтом владельца ({PRIMARY_ADMIN_EMAIL}).
          </p>
          <button
            type="button"
            onClick={() => void signOutAdmin()}
            className="px-5 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] cursor-pointer"
          >
            Выйти и сменить аккаунт
          </button>
        </div>
      )}

      {/* State 4: Verified Admin Dashboard */}
      {isAuthReady && authUser && isAdmin && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#FFD400] mb-1">Панель администратора</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Управление каталогом и витриной
              </h1>
            </div>

            {activeTab === 'dishes' && (
              <button
                type="button"
                onClick={() => setIsAddDishOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Добавить блюдо</span>
              </button>
            )}

            {activeTab === 'categories' && (
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Добавить категорию</span>
              </button>
            )}

            {activeTab === 'slides' && (
              <button
                type="button"
                onClick={() => setSlideModalState({ slide: null, isNew: true })}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Добавить слайд</span>
              </button>
            )}
          </div>

          {/* Initial DB Seed Banner */}
          {!allSeeded && (
            <div className="p-5 rounded-2xl bg-[#FFD400]/10 border border-[#FFD400]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Database className="w-6 h-6 text-[#FFD400] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-bold text-white">
                    Перенесите встроенные данные в базу за 1 клик
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
                    {!isCatalogSeeded
                      ? 'Блюда, категории и слайды пока загружаются из встроенного шаблона. Сохраните их в базу для полного редактирования.'
                      : 'Блюда уже в базе. Сохраните также категории и слайды, чтобы управлять ими наравне с новыми.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={seeding}
                onClick={() => void handleSeed()}
                className="px-4 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
              >
                {seeding ? 'Загружаем...' : 'Перенести в базу'}
              </button>
            </div>
          )}

          {/* Section Switcher Tabs */}
          <div
            role="tablist"
            aria-label="Разделы управления"
            className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'dishes'}
              onClick={() => {
                setConfirmDeleteId(null);
                setActiveTab('dishes');
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'dishes'
                  ? 'bg-[#FFD400] text-[#111111]'
                  : 'bg-[#18181B] text-zinc-300 border border-white/10 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" aria-hidden="true" />
              <span>Блюда</span>
              <span className="font-mono text-xs opacity-75">({allMenuItems.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'categories'}
              onClick={() => {
                setConfirmDeleteId(null);
                setActiveTab('categories');
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-[#FFD400] text-[#111111]'
                  : 'bg-[#18181B] text-zinc-300 border border-white/10 hover:text-white'
              }`}
            >
              <FolderKanban className="w-4 h-4" aria-hidden="true" />
              <span>Категории</span>
              <span className="font-mono text-xs opacity-75">({allCategories.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'slides'}
              onClick={() => {
                setConfirmDeleteId(null);
                setActiveTab('slides');
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'slides'
                  ? 'bg-[#FFD400] text-[#111111]'
                  : 'bg-[#18181B] text-zinc-300 border border-white/10 hover:text-white'
              }`}
            >
              <Presentation className="w-4 h-4" aria-hidden="true" />
              <span>Слайды на главной</span>
              <span className="font-mono text-xs opacity-75">({allHeroSlides.length})</span>
            </button>
          </div>

          {/* TAB 1: DISHES */}
          {activeTab === 'dishes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Найти блюдо по названию..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#18181B] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD400]"
                  />
                </div>

                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  aria-label="Фильтр по категории"
                  className="px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FFD400]"
                >
                  <option value="all">Все категории ({allMenuItems.length})</option>
                  {allCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400">
                Быстрая смена цены: введите новую сумму в пустое поле напротив блюда и нажмите Enter.
              </p>

              <div className="space-y-2.5">
                {filteredItems.map((item) => {
                  const draftVal = priceDrafts[item.id] ?? '';
                  const trimmedDraft = draftVal.trim();
                  const parsedDraft = Number(trimmedDraft);
                  const canSavePrice =
                    trimmedDraft !== '' && Number.isFinite(parsedDraft) && parsedDraft >= 0;
                  const justSaved = savedPriceId === item.id;
                  const isHidden = item.available === false;
                  const isBusy = busyId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isHidden
                          ? 'bg-[#141417] border-white/5 opacity-65'
                          : 'bg-[#18181B] border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <FoodImage
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-12 rounded-lg shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-0.5">
                            <span>{categoryNameMap.get(item.categoryId) ?? item.categoryId}</span>
                            <span>·</span>
                            <span className="font-mono">{item.weight}</span>
                            {isHidden && (
                              <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 text-[11px]">
                                Скрыто
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                            {item.name}
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            title="Текущая цена на сайте"
                            className={`font-mono tabular-nums text-sm font-semibold whitespace-nowrap px-2.5 py-1.5 rounded-lg border transition-colors ${
                              justSaved
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : 'bg-[#121215] border-white/10 text-[#FFD400]'
                            }`}
                          >
                            {item.sizes && item.sizes.length > 0 ? `от ${item.price}` : item.price} ₽
                          </span>
                          <input
                            type="number"
                            inputMode="numeric"
                            enterKeyHint="done"
                            min={0}
                            max={100000}
                            disabled={isBusy}
                            value={draftVal}
                            onChange={(e) =>
                              setPriceDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (canSavePrice) {
                                  void handleQuickPriceSave(item);
                                }
                              } else if (e.key === 'Escape' && draftVal) {
                                setPriceDrafts((prev) => {
                                  const copy = { ...prev };
                                  delete copy[item.id];
                                  return copy;
                                });
                              }
                            }}
                            placeholder="Новая цена"
                            aria-label={`Новая цена для ${item.name} (нажмите Enter для сохранения)`}
                            className="w-28 px-2.5 py-1.5 rounded-lg bg-[#121215] border border-white/15 text-sm font-mono text-white placeholder:font-sans placeholder:text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD400] disabled:opacity-50"
                          />
                          {canSavePrice && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleQuickPriceSave(item)}
                              title="Сохранить цену (Enter)"
                              aria-label={`Сохранить цену для ${item.name}`}
                              className="p-1.5 rounded-lg bg-[#FFD400] text-[#111111] hover:bg-[#ffe033] cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleToggleItemVisible(item)}
                          title={isHidden ? 'Показать в меню' : 'Скрыть из меню'}
                          className="p-2 rounded-lg bg-[#121215] border border-white/10 text-zinc-300 hover:border-[#FFD400] hover:text-[#FFD400] disabled:opacity-40 cursor-pointer"
                        >
                          {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setEditingItem(item)}
                          title="Редактировать фото, описание, цену"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#121215] border border-white/10 text-xs font-medium text-zinc-200 hover:border-[#FFD400] hover:text-[#FFD400] disabled:opacity-40 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Изменить</span>
                        </button>

                        {confirmDeleteId === item.id ? (
                          <div className="inline-flex items-center gap-1 bg-red-500/15 border border-red-500/40 rounded-lg px-2 py-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleDeleteItem(item.id)}
                              className="text-xs font-semibold text-red-400 hover:text-red-300 px-1.5 cursor-pointer"
                            >
                              Удалить
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-zinc-400 hover:text-white px-1 cursor-pointer"
                            >
                              Нет
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setConfirmDeleteId(item.id)}
                            title="Удалить блюдо"
                            className="p-2 rounded-lg bg-[#121215] border border-white/10 text-zinc-400 hover:border-red-500/50 hover:text-red-400 disabled:opacity-40 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-zinc-400">
                Создавайте новые разделы меню и добавляйте любую категорию на главный слайдер одной
                кнопкой «В слайды».
              </p>

              <div className="space-y-2.5">
                {allCategories.map((cat) => {
                  const isHidden = cat.available === false;
                  const isBusy = busyId === cat.id;
                  const dishCount = dishesCountByCategory.get(cat.id) ?? 0;
                  const slideCount = slidesCountByCategory.get(cat.id) ?? 0;

                  return (
                    <div
                      key={cat.id}
                      className={`p-3.5 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isHidden
                          ? 'bg-[#141417] border-white/5 opacity-65'
                          : 'bg-[#18181B] border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <FoodImage
                          src={cat.image}
                          alt={cat.name}
                          className="w-16 h-12 rounded-lg shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-0.5">
                            <span className="font-mono">#{cat.sortOrder ?? 0}</span>
                            <span>·</span>
                            <span>Блюд: {dishCount}</span>
                            {slideCount > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-[#FFD400]">В слайдах ({slideCount})</span>
                              </>
                            )}
                            {isHidden && (
                              <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 text-[11px]">
                                Скрыта
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                            {cat.emoji} {cat.name}
                          </h3>
                          {cat.subtitle && (
                            <p className="text-xs text-zinc-400 truncate">{cat.subtitle}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleAddCategoryToSlides(cat)}
                          title="Создать слайд на главной для этой категории"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FFD400]/15 border border-[#FFD400]/40 text-xs font-semibold text-[#FFD400] hover:bg-[#FFD400] hover:text-[#111111] transition-colors cursor-pointer"
                        >
                          <Presentation className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>В слайды</span>
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleToggleCategoryVisible(cat)}
                          title={isHidden ? 'Показать категорию' : 'Скрыть категорию'}
                          className="p-2 rounded-lg bg-[#121215] border border-white/10 text-zinc-300 hover:border-[#FFD400] hover:text-[#FFD400] disabled:opacity-40 cursor-pointer"
                        >
                          {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setEditingCategory(cat)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#121215] border border-white/10 text-xs font-medium text-zinc-200 hover:border-[#FFD400] hover:text-[#FFD400] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Изменить</span>
                        </button>

                        {confirmDeleteId === cat.id ? (
                          <div className="inline-flex items-center gap-1 bg-red-500/15 border border-red-500/40 rounded-lg px-2 py-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleDeleteCategory(cat.id)}
                              className="text-xs font-semibold text-red-400 hover:text-red-300 px-1.5 cursor-pointer"
                            >
                              Удалить
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-zinc-400 hover:text-white px-1 cursor-pointer"
                            >
                              Нет
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setConfirmDeleteId(cat.id)}
                            title="Удалить категорию"
                            className="p-2 rounded-lg bg-[#121215] border border-white/10 text-zinc-400 hover:border-red-500/50 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: HERO SLIDES */}
          {activeTab === 'slides' && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-zinc-400">
                Баннеры карусели вверху сайта. Каждый слайд ведёт в выбранную категорию.
              </p>

              <div className="space-y-2.5">
                {allHeroSlides.map((slide) => {
                  const isHidden = slide.available === false;
                  const isBusy = busyId === slide.id;

                  return (
                    <div
                      key={slide.id}
                      className={`p-3.5 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isHidden
                          ? 'bg-[#141417] border-white/5 opacity-65'
                          : 'bg-[#18181B] border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <FoodImage
                          src={slide.image}
                          alt={slide.title}
                          className="w-20 h-12 rounded-lg shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-0.5">
                            <span className="font-mono">#{slide.sortOrder ?? 0}</span>
                            <span>·</span>
                            <span className="text-[#FFD400]">
                              {categoryNameMap.get(slide.categoryId) ?? slide.categoryId}
                            </span>
                            <span>·</span>
                            <span>Кнопка: «{slide.ctaLabel}»</span>
                            {isHidden && (
                              <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 text-[11px]">
                                Скрыт
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                            {slide.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleToggleSlideVisible(slide)}
                          title={isHidden ? 'Показать слайд' : 'Скрыть слайд'}
                          className="p-2 rounded-lg bg-[#121215] border border-white/10 text-zinc-300 hover:border-[#FFD400] hover:text-[#FFD400] disabled:opacity-40 cursor-pointer"
                        >
                          {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setSlideModalState({ slide, isNew: false })}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#121215] border border-white/10 text-xs font-medium text-zinc-200 hover:border-[#FFD400] hover:text-[#FFD400] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Изменить</span>
                        </button>

                        {confirmDeleteId === slide.id ? (
                          <div className="inline-flex items-center gap-1 bg-red-500/15 border border-red-500/40 rounded-lg px-2 py-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleDeleteSlide(slide.id)}
                              className="text-xs font-semibold text-red-400 hover:text-red-300 px-1.5 cursor-pointer"
                            >
                              Удалить
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-zinc-400 hover:text-white px-1 cursor-pointer"
                            >
                              Нет
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setConfirmDeleteId(slide.id)}
                            title="Удалить слайд"
                            className="p-2 rounded-lg bg-[#121215] border border-white/10 text-zinc-400 hover:border-red-500/50 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {(isAddDishOpen || editingItem) && (
        <DishFormModal
          initialItem={editingItem}
          categories={allCategories}
          galleryImages={galleryImages}
          onClose={() => {
            setIsAddDishOpen(false);
            setEditingItem(null);
          }}
          onSave={saveMenuItem}
        />
      )}

      {(isAddCategoryOpen || editingCategory) && (
        <CategoryFormModal
          initialCategory={editingCategory}
          defaultSortOrder={allCategories.length + 1}
          galleryImages={galleryImages}
          onClose={() => {
            setIsAddCategoryOpen(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategoryWithOptionalSlide}
        />
      )}

      {slideModalState && (
        <SlideFormModal
          initialSlide={slideModalState.slide}
          isNewSlide={slideModalState.isNew}
          categories={allCategories}
          defaultSortOrder={allHeroSlides.length + 1}
          galleryImages={galleryImages}
          onClose={() => setSlideModalState(null)}
          onSave={saveHeroSlide}
        />
      )}
    </section>
  );
}
