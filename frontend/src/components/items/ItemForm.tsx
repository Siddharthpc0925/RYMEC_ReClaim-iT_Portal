import React, { useRef, useState } from 'react';
import { Check, ImagePlus, Info, MapPin, Upload, Sparkles, ShieldCheck } from 'lucide-react';
import { Location, CAMPUS_CATEGORIES } from '../../types';

const categories = CAMPUS_CATEGORIES;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function localDateTime() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface ItemFormProps {
  kind: 'lost' | 'found';
  onSubmit: (data: any) => Promise<void>;
  locations?: Location[];
}

export const ItemForm: React.FC<ItemFormProps> = ({ kind, onSubmit, locations = [] }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState({
    title: '',
    category: CAMPUS_CATEGORIES[0],
    description: '',
    location: '',
    timestamp: localDateTime(),
    secret_question: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const isFound = kind === 'found';

  const update = (key: string, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const chooseImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, image: 'Choose an image file such as JPG, PNG, or WebP.' }));
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((current) => ({ ...current, image: 'Choose an image under 4 MB.' }));
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageFile(file);
      setImageUrl(reader.result as string);
      setErrors((current) => ({ ...current, image: '' }));
    };
    reader.readAsDataURL(file);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (fields.title.trim().length < 3) nextErrors.title = 'Add an item name (at least 3 characters).';
    if (!fields.category) nextErrors.category = 'Choose an item category.';
    if (fields.description.trim().length < 8) nextErrors.description = 'Add identifying details (at least 8 characters).';
    if (!fields.location.trim()) nextErrors.location = 'Add the campus spot where it was last seen or found.';
    if (!fields.timestamp) nextErrors.timestamp = 'Add the approximate date and time.';

    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await onSubmit({
        title: fields.title.trim(),
        category: fields.category,
        description: fields.description.trim(),
        location_spot: fields.location.trim(),
        event_time: fields.timestamp,
        type: isFound ? 'FOUND' : 'LOST',
        image_path: imageUrl,
        secret_question: fields.secret_question.trim() || undefined
      });
    } catch (err: any) {
      setFormError(err.message || 'Could not save this report. Please check details and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrap report-page">
      <header className="page-header">
        <div className="page-header-copy">
          <p className="eyebrow">
            {isFound ? 'Report found item · safe return' : 'Report lost item · campus search'}
          </p>
          <h1>{isFound ? 'Report a found item.' : 'Report a lost item.'}</h1>
          <p className="lead">
            {isFound
              ? 'Found something on campus? Add it here or hand it over at a security kiosk to help the rightful owner reclaim it.'
              : 'Add the details you remember. Our algorithmic matcher checks against safe drop desks automatically.'}
          </p>
        </div>
      </header>

      <div className="form-layout">
        <section className="surface-card form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              {isFound ? <ShieldCheck size={20} /> : <Upload size={20} />}
            </div>
            <div>
              <h2>{isFound ? 'Found item details' : 'Lost item notice'}</h2>
              <p>Keep descriptions honest and accurate so the AI matcher can identify correspondances.</p>
            </div>
          </div>

          {formError && (
            <div className="notice-card" style={{ borderColor: 'rgba(255,135,144,0.3)', marginBottom: '16px', color: '#ff9a9f' }}>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={submit} className="form-grid">
            {/* Title */}
            <div className="form-field full">
              <label>
                Item name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={isFound ? 'e.g. Casio fx-991CW Calculator, Black Titan Watch' : 'e.g. Blue Dell Laptop Charger, Silver Keychain'}
                value={fields.title}
                onChange={(e) => update('title', e.target.value)}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            {/* Category */}
            <div className="form-field">
              <label>
                Category <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={fields.category}
                onChange={(e) => update('category', e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Campus Spot */}
            <div className="form-field">
              <label>
                Campus spot <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Central Library 1st Floor, Mech Lab 2"
                value={fields.location}
                onChange={(e) => update('location', e.target.value)}
                list="campus-locations-list"
              />
              <datalist id="campus-locations-list">
                {locations.map((l) => (
                  <option key={l.id} value={l.name} />
                ))}
                <option value="Main Admin Block" />
                <option value="Central Library" />
                <option value="Mechanical Block" />
                <option value="CSE & ISE Block" />
                <option value="ECE/EEE Laboratories" />
                <option value="Main Gate Security Kiosk" />
              </datalist>
              {errors.location && <span className="field-error">{errors.location}</span>}
            </div>

            {/* Date and Time */}
            <div className="form-field full">
              <label>
                Approximate date &amp; time <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={fields.timestamp}
                onChange={(e) => update('timestamp', e.target.value)}
              />
              {errors.timestamp && <span className="field-error">{errors.timestamp}</span>}
            </div>

            {/* Description */}
            <div className="form-field full">
              <label>
                Detailed description <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Include color, brand, stickers, unique scratches, or accessories..."
                value={fields.description}
                onChange={(e) => update('description', e.target.value)}
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            {/* Secret Verification Question (for Found items) */}
            {isFound && (
              <div className="form-field full">
                <label>
                  Secret verification question (Optional but recommended)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. What photo is on the phone wallpaper? / What brand is the keychain?"
                  value={fields.secret_question}
                  onChange={(e) => update('secret_question', e.target.value)}
                />
                <span className="field-hint">
                  Claimants will be asked to answer this before obtaining the handover code.
                </span>
              </div>
            )}

            {/* Image Upload */}
            <div className="form-field full">
              <label>Item photo {isFound ? '(Recommended)' : '(Optional)'}</label>
              <div
                className="image-upload"
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={chooseImage}
                />
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Preview" className="image-preview" />
                    <div className="image-preview-cover">
                      <span>{imageFile?.name || 'Photo selected'}</span>
                      <span className="text-emerald-400 font-bold">Change photo</span>
                    </div>
                  </>
                ) : (
                  <div className="image-upload-copy">
                    <ImagePlus size={26} />
                    <strong>Click or drag an image here</strong>
                    <span className="tiny muted">JPG, PNG, WebP up to 4 MB</span>
                  </div>
                )}
              </div>
              {errors.image && <span className="field-error">{errors.image}</span>}
            </div>

            {/* Actions */}
            <div className="form-actions full">
              <button
                type="submit"
                className="button button-primary"
                disabled={saving}
              >
                {saving ? 'Publishing…' : isFound ? 'Post found report' : 'Publish lost notice'}
              </button>
            </div>
          </form>
        </section>

        {/* Sidebar Guidance */}
        <aside className="form-aside">
          <section className="surface-card guide-card">
            <h3>
              <Sparkles size={16} />
              <span>Smart matching tips</span>
            </h3>
            <ul className="guide-list">
              <li>
                <Check size={14} />
                <span>State specific physical markers (color, brand, case).</span>
              </li>
              <li>
                <Check size={14} />
                <span>Specify the building and floor if known.</span>
              </li>
              <li>
                <Check size={14} />
                <span>Never broadcast passwords, PINs, or private phone lock codes.</span>
              </li>
            </ul>
          </section>

          <div className="notice-card">
            <Info size={16} />
            <span>
              If you found high-value property (phones, laptops, wallets with cash), please deposit them at the RYMEC Security Desk (Main Gate) for official custody.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};
