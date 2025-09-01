import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, MapPin, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SimpleMapViewProps {
  coordinates?: string | null;
  location: string;
  className?: string;
}

export function SimpleMapView({ coordinates, location, className = "" }: SimpleMapViewProps) {
  const { t } = useTranslation();

  // Coordonnées par défaut pour les villes communes
  const getCoordinatesForLocation = (loc: string): string => {
    const cityCoordinates: { [key: string]: string } = {
      'lille': '50.6292,3.0573',
      'paris': '48.8566,2.3522',
      'lyon': '45.7640,4.8357',
      'marseille': '43.2965,5.3698',
      'toulouse': '43.6047,1.4442',
      'nice': '43.7102,7.2620',
      'nantes': '47.2184,-1.5536',
      'bordeaux': '44.8378,-0.5792'
    };
    
    const locationLower = loc.toLowerCase();
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (locationLower.includes(city)) {
        return coords;
      }
    }
    
    // Coordonnées par défaut (Paris)
    return cityCoordinates['paris'];
  };

  const finalCoordinates = coordinates || getCoordinatesForLocation(location);
  const [lat, lng] = finalCoordinates.split(',').map(parseFloat);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Map className="w-5 h-5 mr-2" />
          {t("map.location")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
          {/* Image de fond de carte statique */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: `url(https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=14&size=400x256&maptype=mapnik&markers=${lat},${lng},red-pushpin)`
            }}
          />
          
          <div className="text-center relative z-10">
            <div className="bg-white rounded-full p-3 shadow-lg mb-3 mx-auto w-fit">
              <MapPin className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">{location}</p>
            <p className="text-xs text-gray-600">
              📍 {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <span className="text-gray-600 text-sm">{location}</span>
          <div className="flex gap-2">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary text-sm flex items-center hover:underline"
            >
              Google Maps
              <ExternalLink className="ml-1 w-3 h-3" />
            </a>
            <a 
              href={`https://www.openstreetmap.org/#map=15/${lat}/${lng}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary text-sm flex items-center hover:underline"
            >
              OSM
              <ExternalLink className="ml-1 w-3 h-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
