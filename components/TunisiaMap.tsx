"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AutoEcole {
  id: string;
  name: string;
  address?: string;
  city?: string;
  email?: string;
  phone?: string;
}

interface TunisiaMapProps {
  autoEcoles: AutoEcole[];
}

// Tunisia major cities coordinates
const cityCoordinates: { [key: string]: [number, number] } = {
  'tunis': [36.8065, 10.1815],
  'sfax': [34.7406, 10.7603],
  'sousse': [35.8256, 10.6411],
  'kairouan': [35.6781, 10.0963],
  'bizerte': [37.2744, 9.8739],
  'gabès': [33.8815, 10.0982],
  'ariana': [36.8625, 10.1956],
  'gafsa': [34.4250, 8.7842],
  'monastir': [35.7770, 10.8261],
  'ben arous': [36.7536, 10.2306],
  'kasserine': [35.1676, 8.8361],
  'médenine': [33.3547, 10.5055],
  'nabeul': [36.4561, 10.7377],
  'tataouine': [32.9297, 10.4517],
  'beja': [36.7256, 9.1817],
  'jendouba': [36.5011, 8.7803],
  'mahdia': [35.5047, 11.0622],
  'sidi bouzid': [35.0381, 9.4858],
  'zaghouan': [36.4028, 10.1428],
  'siliana': [36.0850, 9.3700],
  'kef': [36.1742, 8.7050],
  'tozeur': [33.9197, 8.1339],
  'kebili': [33.7047, 8.9692],
  'manouba': [36.8080, 10.0975],
};

// Function to get coordinates from city name
const getCityCoordinates = (city: string): [number, number] => {
  const normalizedCity = city.toLowerCase().trim();
  
  // Try exact match first
  if (cityCoordinates[normalizedCity]) {
    return cityCoordinates[normalizedCity];
  }
  
  // Try partial match
  for (const [key, coords] of Object.entries(cityCoordinates)) {
    if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
      return coords;
    }
  }
  
  // Default to Tunis if city not found
  return [36.8065, 10.1815];
};

export default function TunisiaMap({ autoEcoles }: TunisiaMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on Tunisia
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [34.0, 9.5], // Center of Tunisia
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add markers for each auto-école
    autoEcoles.forEach((autoEcole) => {
      if (autoEcole.city && mapRef.current) {
        const coords = getCityCoordinates(autoEcole.city);
        
        // Create custom icon
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: #1E3A8A;
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg style="transform: rotate(45deg); width: 16px; height: 16px;" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const marker = L.marker(coords, { icon: customIcon }).addTo(mapRef.current);
        
        // Create popup content
        const popupContent = `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px; color: #1E3A8A;">
              ${autoEcole.name}
            </h3>
            <div style="font-size: 12px; color: #4B5563; line-height: 1.6;">
              ${autoEcole.address ? `
                <p style="margin: 4px 0;">
                  <strong>📍 Adresse:</strong><br/>
                  ${autoEcole.address}
                </p>
              ` : ''}
              ${autoEcole.city ? `
                <p style="margin: 4px 0;">
                  <strong>🏙️ Ville:</strong> ${autoEcole.city}
                </p>
              ` : ''}
              ${autoEcole.email ? `
                <p style="margin: 4px 0;">
                  <strong>✉️ Email:</strong><br/>
                  <a href="mailto:${autoEcole.email}" style="color: #1E3A8A; text-decoration: none;">
                    ${autoEcole.email}
                  </a>
                </p>
              ` : ''}
              ${autoEcole.phone ? `
                <p style="margin: 4px 0;">
                  <strong>📞 Téléphone:</strong> ${autoEcole.phone}
                </p>
              ` : ''}
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent);
      }
    });

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [autoEcoles]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Carte des Auto-écoles en Tunisie</h2>
        <p className="text-sm text-gray-500 mt-1">
          Distribution géographique de {autoEcoles.length} auto-école{autoEcoles.length > 1 ? 's' : ''} à travers la Tunisie
        </p>
      </div>
      <div 
        ref={mapContainerRef} 
        className="w-full h-[500px] rounded-lg border border-gray-300 z-0"
        style={{ position: 'relative' }}
      />
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#1E3A8A] rounded-full border-2 border-white shadow"></div>
          <span>Emplacement Auto-école</span>
        </div>
        <span className="text-gray-400">•</span>
        <span>Cliquez sur un marqueur pour voir les détails</span>
      </div>
    </div>
  );
}
