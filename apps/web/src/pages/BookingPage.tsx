import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import EventMap from '../components/booking/EventMap';
import EventList from '../components/booking/EventList';

// Données de démonstration (à remplacer par l'API)
const mockEvents = [
  {
    id: '1',
    name: 'Demo Ride Tour Paris Nord',
    city: 'Paris',
    dealerName: 'Yamaha Paris Nord',
    startDate: new Date('2026-03-14'),
    endDate: new Date('2026-03-15'),
    address: '123 Avenue de la République, 75011 Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    availableSlots: 42,
    totalSlots: 84,
  },
  {
    id: '2',
    name: 'Demo Ride Tour Lyon',
    city: 'Lyon',
    dealerName: 'Yamaha Lyon Centre',
    startDate: new Date('2026-03-21'),
    endDate: new Date('2026-03-22'),
    address: '45 Rue de la Liberté, 69003 Lyon',
    latitude: 45.7640,
    longitude: 4.8357,
    availableSlots: 28,
    totalSlots: 84,
  },
  {
    id: '3',
    name: 'Demo Ride Tour Marseille',
    city: 'Marseille',
    dealerName: 'Yamaha Provence',
    startDate: new Date('2026-03-28'),
    endDate: new Date('2026-03-29'),
    address: '78 Boulevard Michelet, 13008 Marseille',
    latitude: 43.2965,
    longitude: 5.3698,
    availableSlots: 12,
    totalSlots: 84,
  },
  {
    id: '4',
    name: 'Demo Ride Tour Toulouse',
    city: 'Toulouse',
    dealerName: 'Yamaha Toulouse Sud',
    startDate: new Date('2026-04-04'),
    endDate: new Date('2026-04-05'),
    address: '156 Route d\'Espagne, 31100 Toulouse',
    latitude: 43.6047,
    longitude: 1.4442,
    availableSlots: 56,
    totalSlots: 84,
  },
  {
    id: '5',
    name: 'Demo Ride Tour Bordeaux',
    city: 'Bordeaux',
    dealerName: 'Yamaha Gironde',
    startDate: new Date('2026-04-11'),
    endDate: new Date('2026-04-12'),
    address: '234 Avenue Thiers, 33100 Bordeaux',
    latitude: 44.8378,
    longitude: -0.5792,
    availableSlots: 70,
    totalSlots: 84,
  },
  {
    id: '6',
    name: 'Demo Ride Tour Strasbourg',
    city: 'Strasbourg',
    dealerName: 'Yamaha Alsace',
    startDate: new Date('2026-04-18'),
    endDate: new Date('2026-04-19'),
    address: '89 Route du Rhin, 67100 Strasbourg',
    latitude: 48.5734,
    longitude: 7.7521,
    availableSlots: 38,
    totalSlots: 84,
  },
];

export default function BookingPage() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Query pour récupérer les événements
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();

        // Transform API data to match component expectations
        return data.map((event: any) => ({
          ...event,
          dealerName: event.dealer?.name || 'Yamaha',
          latitude: Number(event.latitude), // Ensure number
          longitude: Number(event.longitude), // Ensure number
          availableSlots: 42, // Mock/Default since API might not return this exact field yet or structure differs
          totalSlots: 84
        }));
      } catch (err) {
        console.warn('API non disponible, utilisation des données de démonstration');
        return mockEvents;
      }
    },
  });

  // Query pour récupérer les concessionnaires
  const { data: dealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/dealers');
        if (!response.ok) return [];
        return response.json();
      } catch (err) {
        return [];
      }
    },
  });

  const navigate = useNavigate();

  const handleEventSelect = (event: any) => {
    navigate(`/reserver/event/${event.id}`);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Événements Démo Ride Tour 2026
          </h1>
          <p className="text-xl text-gray-600">
            Choisissez l'événement le plus proche de chez vous et réservez jusqu'à 2 essais gratuits
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode('map')}
              className={`inline-flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition-all ${viewMode === 'map'
                ? 'bg-yamaha-blue text-white'
                : 'text-gray-700 hover:text-gray-900'
                }`}
            >
              <Map size={20} />
              <span>VUE CARTE</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition-all ${viewMode === 'list'
                ? 'bg-yamaha-blue text-white'
                : 'text-gray-700 hover:text-gray-900'
                }`}
            >
              <List size={20} />
              <span>VUE LISTE</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yamaha-blue mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des événements...</p>
            </div>
          </div>
        ) : viewMode === 'map' ? (
          <EventMap events={events || []} dealers={dealers || []} onEventSelect={handleEventSelect} />
        ) : (
          <EventList events={events || []} onEventSelect={handleEventSelect} />
        )}

        {/* Bon à savoir */}
        <div className="mt-12 bg-blue-50 border-l-4 border-yamaha-blue p-6 rounded-r-lg shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yamaha-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yamaha-blue mb-2">
                Bon à savoir
              </h3>
              <p className="text-gray-700">
                N'oubliez pas d'apporter votre permis, pièce d'identité et votre équipement complet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
