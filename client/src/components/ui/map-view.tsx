import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Map } from "lucide-react";

// Conditional import for Leaflet to avoid SSR issues
let L: any = null;
let leafletLoaded = false;

// Function to load Leaflet dynamically
const loadLeaflet = async () => {
  if (leafletLoaded) return L;
  
  try {
    // Dynamic import for Leaflet
    const leafletModule = await import("leaflet");
    L = leafletModule.default;
    
    // Import CSS dynamically
    await import("leaflet/dist/leaflet.css");
    
    // Fix for default markers in Leaflet with Vite
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
    
    leafletLoaded = true;
    return L;
  } catch (error) {
    console.error('Erreur lors du chargement de Leaflet:', error);
    throw error;
  }
};

interface MapViewProps {
  coordinates?: string; // Format: "lat,lng"
  location: string;
  className?: string;
  matches?: Array<{
    id: number;
    title: string;
    coordinates?: string;
    location: string;
  }>;
}

export function MapView({ coordinates, location, className = "", matches = [] }: MapViewProps) {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  // Coordinates par défaut (Paris) si non spécifiées
  const getDefaultCoordinates = () => {
    if (coordinates) {
      const [lat, lng] = coordinates.split(",").map(parseFloat);
      return [lat, lng] as [number, number];
    }
    
    // Coordonnées par défaut selon la localisation
    const cityCoordinates: { [key: string]: [number, number] } = {
      'paris': [48.8566, 2.3522],
      'lille': [50.6292, 3.0573],
      'lyon': [45.7640, 4.8357],
      'marseille': [43.2965, 5.3698],
      'toulouse': [43.6047, 1.4442],
      'nice': [43.7102, 7.2620],
      'nantes': [47.2184, -1.5536],
      'bordeaux': [44.8378, -0.5792]
    };
    
    const cityKey = location.toLowerCase();
    return cityCoordinates[cityKey] || cityCoordinates['paris'];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let timeoutId: NodeJS.Timeout;
    let loadingTimeoutId: NodeJS.Timeout;

    // Timeout de sécurité pour éviter un chargement infini
    loadingTimeoutId = setTimeout(() => {
      console.warn('Timeout lors du chargement de la carte');
      setMapError(true);
      setIsLoading(false);
    }, 10000); // 10 secondes

    const initializeMap = async () => {
      try {
        // Load Leaflet dynamically
        const leaflet = await loadLeaflet();
        if (!leaflet || !mapContainerRef.current) return;

        // Nettoie la carte existante
        if (mapRef.current) {
          mapRef.current.remove();
        }

        const defaultCoords = getDefaultCoordinates();
        
        // Crée une nouvelle carte avec un délai pour s'assurer que le DOM est prêt
        timeoutId = setTimeout(() => {
          if (!mapContainerRef.current) return;
          
          const map = leaflet.map(mapContainerRef.current).setView(defaultCoords, 13);
          mapRef.current = map;

          // Ajoute les tuiles OpenStreetMap
          leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // Ajoute un marqueur pour la localisation principale
          if (coordinates) {
            const [lat, lng] = coordinates.split(",").map(parseFloat);
            leaflet.marker([lat, lng])
              .addTo(map)
              .bindPopup(`<strong>${location}</strong>`)
              .openPopup();
          } else {
            // Marqueur par défaut
            leaflet.marker(defaultCoords)
              .addTo(map)
              .bindPopup(`<strong>${location}</strong>`)
              .openPopup();
          }

          // Ajoute des marqueurs pour les matchs s'ils sont fournis
          matches.forEach((match) => {
            if (match.coordinates) {
              const [lat, lng] = match.coordinates.split(",").map(parseFloat);
              const customIcon = leaflet.divIcon({
                className: 'custom-match-marker',
                html: '<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">⚽</div>',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              });
              
              leaflet.marker([lat, lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(`<strong>${match.title}</strong><br/>${match.location}`);
            }
          });

          // Arrêter le timeout de chargement et marquer comme chargé
          clearTimeout(loadingTimeoutId);
          setIsLoading(false);
        }, 100);

      } catch (error) {
        console.error('Erreur lors du chargement de la carte:', error);
        clearTimeout(loadingTimeoutId);
        setMapError(true);
        setIsLoading(false);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coordinates, location, matches]);

  // Fallback si la carte ne peut pas se charger
  if (mapError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Map className="w-5 h-5 mr-2" />
            {t("map.location")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Map className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Carte non disponible</p>
              <p className="text-xs text-gray-500">📍 {location}</p>
              {coordinates && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${coordinates}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary text-sm mt-2 inline-flex items-center hover:underline"
                >
                  Voir sur Google Maps →
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Map className="w-5 h-5 mr-2" />
            {t("map.location")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Chargement de la carte...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Map className="w-5 h-5 mr-2" />
          {t("map.location")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapContainerRef} 
          className="h-64 bg-gray-100 rounded-md relative"
        />
        <div className="mt-3 flex justify-between items-center">
          <span className="text-gray-600 text-sm">{location}</span>
          {coordinates && (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${coordinates}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary text-sm flex items-center hover:underline"
            >
              {t("map.openInGoogleMaps")}
              <span className="ml-1">→</span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
