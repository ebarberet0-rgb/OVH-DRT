import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  totalSlots: number;
}

interface EventListProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
}

export default function EventList({ events, onEventSelect }: EventListProps) {
  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'bg-green-100 border-green-300 text-green-800';
    if (percentage > 20) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  const getAvailabilityText = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'Beaucoup de places';
    if (percentage > 20) return 'Places limitées';
    return 'Dernières places';
  };

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">Aucun événement disponible pour le moment.</p>
          <p className="text-gray-500 text-sm mt-2">Les prochaines dates seront bientôt annoncées!</p>
        </div>
      ) : (
        events.map((event) => {
          const availabilityColorClass = getAvailabilityColor(
            event.availableSlots,
            event.totalSlots
          );

          return (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  {/* Informations principales */}
                  <div className="flex-1 mb-4 md:mb-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Demo Ride Tour - {event.city}
                    </h3>

                    {/* Lieu */}
                    <div className="flex items-start mb-2">
                      <MapPin className="mr-2 text-yamaha-red mt-1 flex-shrink-0" size={18} />
                      <div>
                        <p className="font-semibold text-gray-700">{event.dealerName}</p>
                        <p className="text-sm text-gray-600">{event.address}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center mb-2">
                      <Calendar className="mr-2 text-yamaha-blue flex-shrink-0" size={18} />
                      <p className="text-gray-700">
                        {format(new Date(event.startDate), 'dd', { locale: fr })} &{' '}
                        {format(new Date(event.endDate), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>

                    {/* Horaires */}
                    <div className="flex items-center mb-2">
                      <Clock className="mr-2 text-yamaha-blue flex-shrink-0" size={18} />
                      <p className="text-gray-700">9h - 18h</p>
                    </div>

                    {/* Disponibilité */}
                    <div className="flex items-center mt-3">
                      <Users className="mr-2 text-gray-600 flex-shrink-0" size={18} />
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700 font-semibold">
                          {event.availableSlots} / {event.totalSlots} places
                        </span>
                        <span
                          className={`text-xs px-3 py-1 rounded-full border ${availabilityColorClass}`}
                        >
                          {getAvailabilityText(event.availableSlots, event.totalSlots)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bouton réserver */}
                  <div className="flex flex-col items-center md:items-end space-y-2">
                    <button
                      onClick={() => onEventSelect(event)}
                      disabled={event.availableSlots === 0}
                      className={`px-8 py-3 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 ${
                        event.availableSlots > 0
                          ? 'bg-yamaha-red hover:bg-red-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {event.availableSlots > 0 ? 'CHOISIR LE MODÈLE' : 'COMPLET'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="h-2 bg-gray-200">
                <div
                  className="h-full bg-yamaha-red transition-all duration-500"
                  style={{
                    width: `${((event.totalSlots - event.availableSlots) / event.totalSlots) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
