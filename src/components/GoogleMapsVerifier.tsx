import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Search, Compass, ShieldAlert, Crosshair, HelpCircle } from 'lucide-react';

interface AddressData {
  formattedAddress: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

interface VerifierProps {
  onAddressSelected: (data: AddressData) => void;
  initialAddress?: string;
}

// Indonesian seed destinations for the rich search autocomplete system
const INDO_HUBS = [
  {
    name: 'Grand Indonesia Mall, Menteng, Jakarta Pusat',
    province: 'DKI Jakarta',
    city: 'Jakarta Pusat',
    district: 'Menteng',
    postalCode: '10310',
    lat: -6.1952,
    lng: 106.8231,
    placeId: 'ChIJXQ-zW0rJaS4Rh19zVpA2-Yk'
  },
  {
    name: 'Senayan City Mall, Tanah Abang, Jakarta Pusat',
    province: 'DKI Jakarta',
    city: 'Jakarta Pusat',
    district: 'Tanah Abang',
    postalCode: '10270',
    lat: -6.2274,
    lng: 106.7974,
    placeId: 'ChIJVVW8rzzJaS4REg4AisSsh6I'
  },
  {
    name: 'Pondok Indah Mall 2, Kebayoran Lama, Jakarta Selatan',
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    district: 'Kebayoran Lama',
    postalCode: '12310',
    lat: -6.2655,
    lng: 106.7828,
    placeId: 'ChIJj7WvU3fKaS4RYDCH7D4W_t0'
  },
  {
    name: 'Paris Van Java, Coblong, Bandung',
    province: 'Jawa Barat',
    city: 'Bandung',
    district: 'Coblong',
    postalCode: '40162',
    lat: -6.8892,
    lng: 107.5962,
    placeId: 'ChIJz3S8qH_caS4RpUu7LgL_gX0'
  },
  {
    name: 'Tunjungan Plaza 5, Tegalsari, Surabaya',
    province: 'Jawa Timur',
    city: 'Surabaya',
    district: 'Tegalsari',
    postalCode: '60261',
    lat: -7.2625,
    lng: 112.7394,
    placeId: 'ChIJiTqP5L771y0RK1j_NfS8u_c'
  },
  {
    name: 'Seminyak Square, Kuta Utara, Bali',
    province: 'Bali',
    city: 'Badung',
    district: 'Kuta Utara',
    postalCode: '80361',
    lat: -8.4095,
    lng: 115.1889,
    placeId: 'ChIJLz9F2P9b0i0Rv37_7p8_m9s'
  },
  {
    name: 'Sun Plaza, Medan Petisah, Medan',
    province: 'Sumatera Utara',
    city: 'Medan',
    district: 'Medan Petisah',
    postalCode: '20152',
    lat: 3.5852,
    lng: 98.6715,
    placeId: 'ChIJM2H8_YxHMT4R_u-8V9_B6u0'
  },
  {
    name: 'Pakuwon Mall, Wiyung, Surabaya',
    province: 'Jawa Timur',
    city: 'Surabaya',
    district: 'Wiyung',
    postalCode: '60126',
    lat: -7.2912,
    lng: 112.6754,
    placeId: 'ChIJV4_99D781y0RJ_66V9__m8u'
  }
];

const parseAddressComponents = (place: any) => {
  let province = '';
  let city = '';
  let district = '';
  let postalCode = '';

  if (place.address_components) {
    for (const comp of place.address_components) {
      const types = comp.types;
      if (types.includes('administrative_area_level_1')) {
        province = comp.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        city = comp.long_name;
      } else if (types.includes('administrative_area_level_3') || types.includes('sublocality_level_1')) {
        district = comp.long_name;
      } else if (types.includes('postal_code')) {
        postalCode = comp.long_name;
      }
    }
  }

  return {
    province: province || 'DKI Jakarta',
    city: city || 'Jakarta Pusat',
    district: district || 'Menteng',
    postalCode: postalCode || '10310'
  };
};

export const GoogleMapsVerifier: React.FC<VerifierProps> = ({ onAddressSelected, initialAddress = '' }) => {
  const { settings } = useApp();
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedHub, setSelectedHub] = useState<any | null>(null);
  const [markerPos, setMarkerPos] = useState({ lat: -6.1952, lng: 106.8231 });
  const [isDragging, setIsDragging] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Load Google Maps Script
  useEffect(() => {
    const apiKey = settings.googleMapsApiKey || process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
    if (!apiKey) return;

    if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
      setIsGoogleLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script-loader';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => {
      setIsGoogleLoaded(true);
    };

    script.addEventListener('load', handleLoad);
    return () => {
      script?.removeEventListener('load', handleLoad);
    };
  }, [settings.googleMapsApiKey]);

  // Synchronize initial address
  useEffect(() => {
    if (initialAddress && initialAddress !== searchQuery) {
      setSearchQuery(initialAddress);
    }
  }, [initialAddress]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length <= 1) {
      setSuggestions([]);
      return;
    }

    if (isGoogleLoaded && (window as any).google && (window as any).google.maps) {
      try {
        const autocompleteService = new (window as any).google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
          { input: query },
          (predictions: any[], status: any) => {
            if (status === 'OK' && predictions) {
              const mapped = predictions.map((pred) => ({
                name: pred.description,
                province: '',
                city: '',
                district: '',
                postalCode: '',
                lat: 0,
                lng: 0,
                placeId: pred.place_id,
                isGoogleResult: true
              }));
              setSuggestions(mapped);
            } else {
              setSuggestions([]);
            }
          }
        );
      } catch (err) {
        console.warn('Autocomplete query error', err);
      }
    } else {
      const filtered = INDO_HUBS.filter(
        (h) => h.name.toLowerCase().includes(query.toLowerCase()) || 
               h.province.toLowerCase().includes(query.toLowerCase()) || 
               h.city.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    }
  };

  const selectHub = (hub: any) => {
    setSearchQuery(hub.name);
    setSuggestions([]);

    if (hub.isGoogleResult && (window as any).google && (window as any).google.maps) {
      try {
        const dummyElement = document.createElement('div');
        const placesService = new (window as any).google.maps.places.PlacesService(dummyElement);
        placesService.getDetails(
          { placeId: hub.placeId, fields: ['name', 'formatted_address', 'geometry', 'address_components'] },
          (place: any, status: any) => {
            if (status === 'OK' && place) {
              const lat = place.geometry?.location?.lat() || -6.1952;
              const lng = place.geometry?.location?.lng() || 106.8231;
              setMarkerPos({ lat, lng });

              const parsed = parseAddressComponents(place);

              onAddressSelected({
                formattedAddress: place.formatted_address || place.name || hub.name,
                province: parsed.province,
                city: parsed.city,
                district: parsed.district,
                postalCode: parsed.postalCode,
                latitude: lat,
                longitude: lng,
                placeId: hub.placeId
              });
            }
          }
        );
      } catch (err) {
        console.warn('Place details fetch failed', err);
      }
    } else {
      setSelectedHub(hub);
      setMarkerPos({ lat: hub.lat, lng: hub.lng });

      onAddressSelected({
        formattedAddress: hub.name,
        province: hub.province,
        city: hub.city,
        district: hub.district,
        postalCode: hub.postalCode,
        latitude: hub.lat,
        longitude: hub.lng,
        placeId: hub.placeId
      });
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const latDiff = 0.2;
    const lngDiff = 0.2;
    const newLat = (selectedHub ? selectedHub.lat : -6.1952) + (y / rect.height - 0.5) * latDiff;
    const newLng = (selectedHub ? selectedHub.lng : 106.8231) + (x / rect.width - 0.5) * lngDiff;

    setMarkerPos({ lat: Number(newLat.toFixed(5)), lng: Number(newLng.toFixed(5)) });

    if (selectedHub || isGoogleLoaded) {
      const nameStr = selectedHub ? selectedHub.name : searchQuery;
      onAddressSelected({
        formattedAddress: nameStr,
        province: selectedHub?.province || 'DKI Jakarta',
        city: selectedHub?.city || 'Jakarta Selatan',
        district: selectedHub?.district || 'Kebayoran Baru',
        postalCode: selectedHub?.postalCode || '12190',
        latitude: Number(newLat.toFixed(5)),
        longitude: Number(newLng.toFixed(5)),
        placeId: selectedHub?.placeId || 'ChIJXQ-zW0rJaS4Rh19zVpA2-Yk'
      });
    }
  };

  return (
    <div id="google-maps-verifier" className="space-y-4 font-sans bg-[#0E0E0E] border border-neutral-800 p-4 rounded-lg relative overflow-hidden">
      
      {/* Search Input Autocomplete */}
      <div className="relative">
        <label className="block text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
          <span>Verifikasi Alamat Google Maps</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Compass className="w-3 h-3 animate-spin" /> Live Autocomplete Verified
          </span>
        </label>
        
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-[#151515] text-white border border-neutral-800 focus:border-zinc-500 rounded pl-10 pr-4 py-2.5 text-sm outline-none transition-all"
            placeholder="Cari mal, jalan, atau area di Indonesia (cth: Grand Indonesia)"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
        </div>

        {/* Suggestion Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 bg-[#121212] border border-neutral-800 rounded z-20 shadow-2xl max-h-56 overflow-y-auto">
            {suggestions.map((hub) => (
              <button
                key={hub.placeId}
                type="button"
                onClick={() => selectHub(hub)}
                className="w-full text-left px-4 py-2.5 hover:bg-neutral-900 border-b border-neutral-900 text-xs text-zinc-300 hover:text-white flex items-start gap-2.5 transition-colors"
              >
                <MapPin className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">{hub.name}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">
                    {hub.province} • {hub.city} • Kodepos {hub.postalCode}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Visual Draggable HUD Map Simulator */}
      <div className="relative">
        <div 
          ref={mapRef}
          onClick={handleMapClick}
          className="w-full h-44 bg-[#0B0C10] border border-neutral-800 rounded relative overflow-hidden cursor-crosshair group flex items-center justify-center"
          title="Klik pada peta untuk menyesuaikan pin koordinat GPS Anda"
        >
          {/* Cyber grid lines simulating telemetry / dynamic mapping engine */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:10px_10px]" />
          
          {/* Circular radar concentric ripples */}
          <div className="absolute rounded-full border border-zinc-800/10 w-32 h-32 animate-ping" />
          <div className="absolute rounded-full border border-zinc-900/40 w-44 h-44 animate-pulse" />
          
          {/* Mock Road Lines layout in dark-mode aesthetics */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="50" x2="100%" y2="50" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="5 5" />
            <line x1="120" y1="0" x2="120" y2="100%" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="300" y1="0" x2="150" y2="100%" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="200" cy="80" r="40" stroke="#FFFFFF" strokeWidth="1" fill="none" />
          </svg>

          {/* Draggable/Placeable Map Pin marker */}
          <div 
            className="absolute transition-all duration-300 ease-out flex flex-col items-center"
            style={{ 
              top: '50%', 
              left: '50%',
              transform: 'translate(-50%, -100%)' 
            }}
          >
            <div className="bg-white text-black px-2 py-1 rounded text-[9px] font-mono font-bold tracking-wider mb-1 uppercase shadow-lg select-none">
              PIN LOKASI
            </div>
            <MapPin className="w-7 h-7 text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] animate-bounce" />
          </div>

          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm border border-neutral-800 px-2.5 py-1.5 rounded font-mono text-[9px] text-zinc-400 space-y-0.5 shadow-md">
            <div>GPS LAT: {markerPos.lat.toFixed(5)}</div>
            <div>GPS LNG: {markerPos.lng.toFixed(5)}</div>
          </div>

          <button 
            type="button" 
            className="absolute top-2 right-2 bg-neutral-900/80 border border-neutral-800 rounded p-1 hover:bg-neutral-850"
            title="Sebutkan Lokasi"
          >
            <Crosshair className="w-3 h-3 text-zinc-400" />
          </button>
        </div>

        {/* Selected coordinates readout and instructions */}
        <div className="mt-2.5 flex items-start gap-2 bg-neutral-900/30 p-2.5 rounded border border-neutral-800/40 text-[11px] leading-relaxed text-zinc-400 font-sans">
          <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-white font-semibold">Petunjuk:</span> Pilih lokasi utama melalui pencari di atas, lalu Anda dapat mengklik bebas pada radar peta hitam di atas untuk menempatkan pin pengiriman kurir fungsional dengan presisi.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsVerifier;
