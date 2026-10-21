import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { MapPin, Navigation, Search } from 'lucide-react';

const DEFAULT_LAT = 5.6358;
const DEFAULT_LNG = -0.1614;

const parseCoord = (value, fallback) => {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : fallback;
};

const createVendorPinIcon = () =>
  L.divIcon({
    className: 'custom-vendor-pin',
    html: '<div class="vendor-pin-marker"><div class="vendor-pin-inner"></div></div>',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -36]
  });

const StoreLocationMap = ({ lat, lng, onChangeLocation }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChangeLocation);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChangeLocation;
  }, [onChangeLocation]);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return undefined;

    const initialLat = parseCoord(lat, DEFAULT_LAT);
    const initialLng = parseCoord(lng, DEFAULT_LNG);

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: createVendorPinIcon()
    }).addTo(map);

    marker.bindTooltip('Drag pin to your exact store location', {
      direction: 'top',
      offset: [0, -34]
    });

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const nextLat = pos.lat.toFixed(6);
      const nextLng = pos.lng.toFixed(6);
      map.panTo([pos.lat, pos.lng]);
      if (onChangeRef.current) {
        onChangeRef.current({ lat: nextLat, lng: nextLng });
      }
      toast.success(`Pin moved to ${nextLat}, ${nextLng}`);
    });

    map.on('click', (e) => {
      const { lat: clickedLat, lng: clickedLng } = e.latlng;
      marker.setLatLng([clickedLat, clickedLng]);
      const nextLat = clickedLat.toFixed(6);
      const nextLng = clickedLng.toFixed(6);
      if (onChangeRef.current) {
        onChangeRef.current({ lat: nextLat, lng: nextLng });
      }
      toast.success(`Pin placed at ${nextLat}, ${nextLng}`);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Ensure proper tile sizing after render
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker & map view when lat/lng inputs are edited manually
  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const nextLat = parseCoord(lat, DEFAULT_LAT);
    const nextLng = parseCoord(lng, DEFAULT_LNG);
    const currentPos = marker.getLatLng();

    if (
      Math.abs(currentPos.lat - nextLat) > 0.00001 ||
      Math.abs(currentPos.lng - nextLng) > 0.00001
    ) {
      marker.setLatLng([nextLat, nextLng]);
      map.setView([nextLat, nextLng], map.getZoom(), { animate: true });
    }
  }, [lat, lng]);

  const handleSearchPlace = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=gh&q=${encodeURIComponent(
          query
        )}`
      );
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        const hit = results[0];
        const nextLat = parseFloat(hit.lat).toFixed(6);
        const nextLng = parseFloat(hit.lon).toFixed(6);
        if (onChangeRef.current) {
          onChangeRef.current({
            lat: nextLat,
            lng: nextLng,
            suggestedAddress: hit.display_name
          });
        }
        toast.success(`Pin moved to ${hit.display_name.split(',')[0]}`);
      } else {
        toast.error('Location not found. Try dragging the pin directly on the map.');
      }
    } catch {
      toast.error('Unable to search location right now.');
    } finally {
      setSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextLat = pos.coords.latitude.toFixed(6);
        const nextLng = pos.coords.longitude.toFixed(6);
        if (onChangeRef.current) {
          onChangeRef.current({ lat: nextLat, lng: nextLng });
        }
        setLocating(false);
        toast.success('Pin updated to your current GPS location');
      },
      () => {
        setLocating(false);
        toast.error('Unable to retrieve your current GPS location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="location-picker-card">
      <div className="location-picker-header">
        <div className="location-picker-title">
          <div className="payout-method-icon">
            <MapPin size={18} />
          </div>
          <div>
            <h4>Store Pin Location on Map</h4>
            <p>
              Drag the green pin or click anywhere on the map to automatically fill your exact Latitude &amp; Longitude.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-outline btn-sm"
          onClick={handleUseCurrentLocation}
          disabled={locating}
        >
          <Navigation size={14} />
          {locating ? 'Locating...' : 'Use Current GPS'}
        </button>
      </div>

      {/* Quick Location Search Bar */}
      <div className="location-search-row">
        <div className="search-box" style={{ maxWidth: '100%', flex: 1 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search area or street in Ghana (e.g. East Legon, Adenta, Osu)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchPlace();
              }
            }}
            style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}
          />
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={handleSearchPlace}
          disabled={searching}
        >
          {searching ? 'Finding...' : 'Find on Map'}
        </button>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div ref={mapContainerRef} className="location-map-frame" />
    </div>
  );
};

export default StoreLocationMap;
