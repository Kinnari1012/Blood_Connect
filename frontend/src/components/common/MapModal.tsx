import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Copy, Check, X } from 'lucide-react';
import { getGoogleMapsEmbedUrl, openGoogleMapsDirections } from '../../utils/mapUtils';
import toast from 'react-hot-toast';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  name?: string;
  address: string;
}

export function MapModal({
  isOpen,
  onClose,
  title = 'Location on Map',
  name,
  address,
}: MapModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const fullQuery = name ? `${name}, ${address}` : address;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-primary flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
              {name && <p className="text-xs text-gray-500 font-medium">{name}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Address Box */}
          <div className="flex items-start justify-between gap-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                Destination Address
              </span>
              <p className="text-sm font-semibold text-gray-800 break-words">
                {address || 'Location details not specified'}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl transition-colors shadow-xs shrink-0"
              title="Copy address"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Interactive Map Iframe */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 h-72 sm:h-80 w-full relative bg-gray-100 shadow-inner">
            <iframe
              title="Google Map Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={getGoogleMapsEmbedUrl(fullQuery)}
            />
          </div>

          {/* Turn-by-Turn GPS Action matching Mobile App */}
          <button
            onClick={() => openGoogleMapsDirections(fullQuery)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-red-100 bg-red-50/70 hover:bg-red-50 text-primary transition-all group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm">
                <Navigation size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors">
                  Open Turn-by-Turn GPS
                </p>
                <p className="text-xs text-gray-500">
                  Navigate directly to {name || 'destination'} in Google Maps
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary">
              <span>Navigate</span>
              <ExternalLink size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <span className="text-xs text-gray-400">Powered by Google Maps integration</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
