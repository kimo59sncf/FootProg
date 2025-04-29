import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Map } from "lucide-react";

interface MapViewProps {
  coordinates?: string; // Format: "lat,lng"
  location: string;
  className?: string;
}

export function MapView({ coordinates, location, className = "" }: MapViewProps) {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This is a placeholder for a real map implementation
    // In a real app, you would use a library like Leaflet or Google Maps
    
    // For now, just create a visual placeholder
    if (mapContainerRef.current) {
      const container = mapContainerRef.current;
      container.innerHTML = "";
      
      const mapPlaceholder = document.createElement("div");
      mapPlaceholder.className = "absolute inset-0 flex flex-col items-center justify-center bg-gray-100";
      
      const mapIcon = document.createElement("div");
      mapIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      mapIcon.className = "mb-2";
      
      const locationText = document.createElement("p");
      locationText.textContent = location;
      locationText.className = "text-sm text-gray-600";
      
      mapPlaceholder.appendChild(mapIcon);
      mapPlaceholder.appendChild(locationText);
      container.appendChild(mapPlaceholder);
      
      // If we have coordinates, add a marker
      if (coordinates) {
        const [lat, lng] = coordinates.split(",").map(parseFloat);
        
        const marker = document.createElement("div");
        marker.className = "absolute w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-md transform -translate-x-1/2 -translate-y-1/2";
        marker.style.left = "50%";
        marker.style.top = "50%";
        marker.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
        
        mapPlaceholder.appendChild(marker);
      }
    }
  }, [coordinates, location]);

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
              className="text-primary text-sm flex items-center"
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
