import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BookingModal from './BookingModal';

// Fix pour les icônes Leaflet avec Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Event {
  id: string;
  name: string;
  city: string;
  dealerName: string;
  startDate: Date;
  endDate: Date;
  address: string;
  latitude: number;
  longitude: number;
  availableSlots: number;
}

interface Dealer {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  phone: string;
}

interface EventMapProps {
  events: Event[];
  dealers?: Dealer[];
  onEventSelect: (event: Event) => void;
}

// Composant pour créer une icône personnalisée Yamaha
function createYamahaIcon(colorClass: string = 'bg-yamaha-red') {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div class="${colorClass} rounded-full p-3 shadow-lg border-4 border-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.18l6 3.75v7.14l-6 3.75-6-3.75V7.93l6-3.75z"/>
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          </div>
          <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
            <div class="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
          </div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
}

// Composant pour recentrer la carte
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 6);
  }, [center, map]);

  return null;
}

export default function EventMap({ events, onEventSelect }: EventMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [center] = useState<[number, number]>([46.603354, 1.888334]); // Centre de la France
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleBookNow = () => {
    setIsModalOpen(false);
    if (selectedEvent) {
      onEventSelect(selectedEvent);
    }
  };

  return (
    <div className="w-full">
      {/* Info bulle au-dessus de la carte */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg px-6 py-3 shadow-lg mb-4 max-w-xl mx-auto">
        <p className="text-sm text-blue-900 text-center">
          <span className="font-semibold">Carte interactive :</span> Cliquez sur un marqueur pour voir les détails et réserver votre essai gratuit !
        </p>
      </div>

      {/* Carte */}
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-xl">
        <MapContainer
          center={center}
          zoom={6}
          className="w-full h-full"
          ref={mapRef}
        >
          {/* Fond de carte */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={center} />

          {/* Marqueurs pour les événements uniquement */}
          {events.filter(e => e.latitude && e.longitude).map((event) => (
            <Marker
              key={event.id}
              position={[event.latitude, event.longitude]}
              icon={createYamahaIcon('bg-yamaha-red')}
            >
              <Popup className="custom-popup">
                <div className="p-4 min-w-[280px]">
                  {/* Titre */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <MapPin className="mr-2 text-yamaha-red" size={20} />
                    Demo Ride {event.city}
                  </h3>

                  {/* Lieu */}
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700">Lieu:</p>
                    <p className="text-sm text-gray-600">{event.dealerName}</p>
                  </div>

                  {/* Date */}
                  <div className="mb-3 flex items-start">
                    <Calendar className="mr-2 text-yamaha-blue mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Date:</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(event.startDate), 'dd', { locale: fr })} &{' '}
                        {format(new Date(event.endDate), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  {/* Horaires */}
                  <div className="mb-4 flex items-start">
                    <Clock className="mr-2 text-yamaha-blue mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Horaires:</p>
                      <p className="text-sm text-gray-600">9h - 18h</p>
                    </div>
                  </div>

                  {/* Places disponibles */}
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-green-800 text-center">
                      {event.availableSlots} places disponibles
                    </p>
                  </div>

                  {/* Bouton Réserver */}
                  <button
                    onClick={() => handleEventClick(event)}
                    className="w-full bg-gradient-to-r from-yamaha-red to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    VOIR LES DÉTAILS
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Booking Modal */}
        <BookingModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onBookNow={handleBookNow}
        />
      </div>
    </div>
  );
}
