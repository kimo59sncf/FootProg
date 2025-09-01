import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, MapPin, AlertCircle } from "lucide-react";

interface DebugMapProps {
  coordinates?: string;
  location: string;
}

export function DebugMap({ coordinates, location }: DebugMapProps) {
  const [debugInfo, setDebugInfo] = useState<{
    hasCoordinates: boolean;
    parsedCoords: [number, number] | null;
    leafletAvailable: boolean;
    error: string | null;
  }>({
    hasCoordinates: false,
    parsedCoords: null,
    leafletAvailable: false,
    error: null
  });

  useEffect(() => {
    const checkDebugInfo = async () => {
      try {
        // Vérifier les coordonnées
        const hasCoordinates = Boolean(coordinates);
        let parsedCoords: [number, number] | null = null;
        
        if (coordinates) {
          const [lat, lng] = coordinates.split(",").map(parseFloat);
          if (!isNaN(lat) && !isNaN(lng)) {
            parsedCoords = [lat, lng];
          }
        }

        // Vérifier Leaflet
        let leafletAvailable = false;
        try {
          await import("leaflet");
          leafletAvailable = true;
        } catch (error) {
          console.error("Leaflet non disponible:", error);
        }

        setDebugInfo({
          hasCoordinates,
          parsedCoords,
          leafletAvailable,
          error: null
        });
      } catch (error) {
        setDebugInfo(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "Erreur inconnue"
        }));
      }
    };

    checkDebugInfo();
  }, [coordinates]);

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-yellow-800">
          <AlertCircle className="w-5 h-5 mr-2" />
          Debug Carte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Localisation:</strong> {location}
          </div>
          <div>
            <strong>Coordonnées brutes:</strong> {coordinates || "Non définies"}
          </div>
          <div className="flex items-center">
            <strong>A des coordonnées:</strong>
            {debugInfo.hasCoordinates ? (
              <span className="ml-2 text-green-600">✅ Oui</span>
            ) : (
              <span className="ml-2 text-red-600">❌ Non</span>
            )}
          </div>
          <div className="flex items-center">
            <strong>Coordonnées valides:</strong>
            {debugInfo.parsedCoords ? (
              <span className="ml-2 text-green-600">✅ Oui ({debugInfo.parsedCoords[0]}, {debugInfo.parsedCoords[1]})</span>
            ) : (
              <span className="ml-2 text-red-600">❌ Non</span>
            )}
          </div>
          <div className="flex items-center">
            <strong>Leaflet disponible:</strong>
            {debugInfo.leafletAvailable ? (
              <span className="ml-2 text-green-600">✅ Oui</span>
            ) : (
              <span className="ml-2 text-red-600">❌ Non</span>
            )}
          </div>
          <div className="flex items-center">
            <strong>Erreur:</strong>
            {debugInfo.error ? (
              <span className="ml-2 text-red-600">❌ {debugInfo.error}</span>
            ) : (
              <span className="ml-2 text-green-600">✅ Aucune</span>
            )}
          </div>
        </div>
        
        {debugInfo.parsedCoords && (
          <div className="mt-4 p-3 bg-white rounded border">
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <strong>Liens utiles:</strong>
            </div>
            <div className="space-y-1 text-sm">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${debugInfo.parsedCoords[0]},${debugInfo.parsedCoords[1]}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block"
              >
                🗺️ Voir sur Google Maps
              </a>
              <a 
                href={`https://www.openstreetmap.org/#map=15/${debugInfo.parsedCoords[0]}/${debugInfo.parsedCoords[1]}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block"
              >
                🗺️ Voir sur OpenStreetMap
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
