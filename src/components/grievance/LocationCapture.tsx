import { useState, useRef } from 'react';
import { useTranslation } from '../../i18n';
import { MapPinIcon, CameraIcon } from '@heroicons/react/24/outline';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface LocationCaptureProps {
  onLocation: (loc: LocationData) => void;
  onPhoto: (file: File | null) => void;
}

export default function LocationCapture({ onLocation, onPhoto }: LocationCaptureProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocError(t('locationCapture.geoNotSupported'));
      return;
    }

    setLocating(true);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          if (data.display_name) {
            address = data.display_name;
          }
        } catch {
          // fallback to coords only
        }

        const loc = { lat: latitude, lng: longitude, address };
        setLocation(loc);
        onLocation(loc);
        setLocating(false);
      },
      (err) => {
        setLocError(
          err.code === 1
            ? t('locationCapture.permissionDenied')
            : err.code === 2
              ? t('locationCapture.positionUnavailable')
              : t('locationCapture.timeout')
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setPhotoName(file.name);
      setPhotoPreview(URL.createObjectURL(file));
      onPhoto(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoName('');
    onPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={locating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 transition-colors disabled:opacity-50"
        >
          {locating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          ) : (
            <MapPinIcon className="h-5 w-5" />
          )}
          {locating ? t('locationCapture.locating') : t('locationCapture.addLocation')}
        </button>

        {locError && (
          <p className="mt-2 text-xs text-red-500">{locError}</p>
        )}

        {location && (
          <div className="mt-3 p-3 bg-secondary-50 border border-secondary-200 rounded-xl">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-secondary-400 font-medium">{t('locationCapture.capturedLocation')}</p>
                <p className="text-sm text-secondary-900 truncate">{location.address}</p>
                <p className="text-xs text-secondary-400 mt-0.5">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
              <a
                href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100 transition-colors"
              >
                {t('locationCapture.viewMap')}
              </a>
            </div>
          </div>
        )}
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoCapture}
          className="hidden"
        />

        {photoPreview ? (
          <div className="relative">
            <img
              src={photoPreview}
              alt={t('locationCapture.photoPreview')}
              className="w-full h-48 object-cover rounded-xl border border-secondary-200"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl" />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="text-xs text-white font-medium truncate">{photoName}</span>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-1 rounded-lg bg-red-500/80 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
              >
                {t('locationCapture.removePhoto')}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-secondary-100 text-secondary-700 hover:bg-secondary-200 border border-secondary-200 transition-colors"
          >
            <CameraIcon className="h-5 w-5" />
            {t('locationCapture.capturePhoto')}
          </button>
        )}
      </div>
    </div>
  );
}
