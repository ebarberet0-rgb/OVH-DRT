import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { eventsApi } from '../lib/api';
import type { Booking, Motorcycle } from '../types';
import BookingCell from '../components/BookingCell';
import BookingDetailModal from '../components/BookingDetailModal';
import WalkInBookingModal from '../components/WalkInBookingModal';
import toast from 'react-hot-toast';

type FilterType = 'ALL' | 'GROUP_1' | 'GROUP_2' | 'AVAILABLE';

export default function PlanningPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [selectedDay, setSelectedDay] = useState(0); // 0 = jour 1, 1 = jour 2
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for new booking (Walk-in)
  const [selectedSlot, setSelectedSlot] = useState<{
    motorcycle: Motorcycle;
    timeSlot: string;
  } | null>(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await eventsApi.getEvent(eventId!);
      return response.data;
    },
    enabled: !!eventId,
  });

  // Calculate current date based on selected day
  const getCurrentDate = () => {
    if (!event) return '';
    const startDate = parseISO(event.startDate);
    const currentDate = addDays(startDate, selectedDay);
    return format(currentDate, 'yyyy-MM-dd');
  };

  // Fetch bookings for selected date
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', eventId, getCurrentDate()],
    queryFn: async () => {
      const response = await eventsApi.getEventBookings(
        eventId!,
        getCurrentDate()
      );
      return response.data;
    },
    enabled: !!eventId && !!event,
  });

  // Define specific time slots based on the schedule:
  // Morning: 9h, 10h, 11h (ends at 12h)
  // Afternoon: 14h, 15h, 16h, 17h (ends at 18h)
  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Filter motorcycles based on selected filter
  const getFilteredMotorcycles = () => {
    if (!event?.motorcycles) return [];

    let filtered = event.motorcycles;

    if (filter === 'GROUP_1') {
      filtered = filtered.filter((m) => m.group === 1);
    } else if (filter === 'GROUP_2') {
      filtered = filtered.filter((m) => m.group === 2);
    } else if (filter === 'AVAILABLE') {
      filtered = filtered.filter((m) => m.status === 'AVAILABLE');
    }

    return filtered.sort((a, b) => {
      if (a.group !== b.group) return a.group - b.group;
      return a.number - b.number;
    });
  };

  // Get booking for specific motorcycle and time slot
  const getBooking = (motorcycleId: string, timeSlot: string) => {
    return bookings.find(
      (b) => b.motorcycleId === motorcycleId && b.timeSlot === timeSlot
    );
  };

  // Handle cell click
  const handleCellClick = (
    motorcycle: Motorcycle,
    timeSlot: string,
    booking?: Booking
  ) => {
    if (booking) {
      setSelectedBooking(booking);
      setIsModalOpen(true);
    } else {
      // Open modal for new booking
      setSelectedSlot({ motorcycle, timeSlot });
      setIsWalkInModalOpen(true);
    }
  };

  // Get current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Helper to convert time string to minutes from start of day
    const timeToMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const currentTotalMinutes = currentHour * 60 + currentMinute;

    // Find the current or next slot
    // We want to highlight the column if we are WITHIN the slot duration (start <= now < start + 60)
    // Or just find the closest match

    const slotIndex = timeSlots.findIndex(slot => {
      const slotStart = timeToMinutes(slot);
      const slotEnd = slotStart + 60; // 60 min duration (45 ride + 15 break)
      return currentTotalMinutes >= slotStart && currentTotalMinutes < slotEnd;
    });

    return slotIndex !== -1 ? slotIndex : null;
  };

  const currentTimeIndex = getCurrentTimePosition();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yamaha-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du planning...</p>
        </div>
      </div>
    );
  }

  const filteredMotorcycles = getFilteredMotorcycles();
  const group1Motorcycles = filteredMotorcycles.filter((m) => m.group === 1);
  const group2Motorcycles = filteredMotorcycles.filter((m) => m.group === 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-yamaha-blue text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="touch-target hover:bg-white/10 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">{event?.name}</h1>
                {event?.dealer && (
                  <p className="text-blue-200 text-sm">
                    {event.dealer.name} - {event.dealer.city}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Day Selector */}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                <button
                  onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                  disabled={selectedDay === 0}
                  className="touch-target disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center min-w-[120px]">
                  <div className="font-semibold">Jour {selectedDay + 1}</div>
                  <div className="text-xs text-blue-200">
                    {event &&
                      format(
                        addDays(parseISO(event.startDate), selectedDay),
                        'dd MMM yyyy',
                        { locale: fr }
                      )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDay(selectedDay + 1)}
                  className="touch-target"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Current Time */}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">
                  {format(new Date(), 'HH:mm')}
                </span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mt-4">
            <Filter className="w-5 h-5" />
            <button
              onClick={() => setFilter('ALL')}
              className={`tablet-button ${filter === 'ALL'
                ? 'bg-white text-yamaha-blue'
                : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('GROUP_1')}
              className={`tablet-button ${filter === 'GROUP_1'
                ? 'bg-white text-yamaha-blue'
                : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
              Groupe 1
            </button>
            <button
              onClick={() => setFilter('GROUP_2')}
              className={`tablet-button ${filter === 'GROUP_2'
                ? 'bg-white text-yamaha-blue'
                : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
              Groupe 2
            </button>
            <button
              onClick={() => setFilter('AVAILABLE')}
              className={`tablet-button ${filter === 'AVAILABLE'
                ? 'bg-white text-yamaha-blue'
                : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
              Disponibles
            </button>
          </div>
        </div>
      </header>

      {/* Main Planning Grid */}
      <main className="p-6 overflow-x-auto">
        {/* Group 1 */}
        {(filter === 'ALL' || filter === 'GROUP_1') &&
          group1Motorcycles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                GROUPE 1
              </h2>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                          Moto
                        </th>
                        {timeSlots.map((slot, index) => (
                          <th
                            key={slot}
                            className={`border border-gray-200 p-3 text-center min-w-[120px] ${index === currentTimeIndex
                              ? 'bg-yellow-100 relative'
                              : ''
                              }`}
                          >
                            {slot}
                            {index === currentTimeIndex && (
                              <div className="absolute top-0 left-0 right-0 h-1 bg-yamaha-red"></div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group1Motorcycles.map((motorcycle) => (
                        <tr key={motorcycle.id}>
                          <td className="border border-gray-200 p-3 sticky left-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-yamaha-blue text-white rounded-full flex items-center justify-center font-bold">
                                {motorcycle.number}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {motorcycle.model}
                                </div>
                                <div
                                  className={`text-xs ${motorcycle.status === 'AVAILABLE'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}
                                >
                                  {motorcycle.status === 'AVAILABLE'
                                    ? 'Disponible'
                                    : 'Indisponible'}
                                </div>
                              </div>
                            </div>
                          </td>
                          {timeSlots.map((slot) => {
                            const booking = getBooking(motorcycle.id, slot);
                            return (
                              <BookingCell
                                key={`${motorcycle.id}-${slot}`}
                                motorcycle={motorcycle}
                                timeSlot={slot}
                                booking={booking}
                                onClick={() =>
                                  handleCellClick(motorcycle, slot, booking)
                                }
                              />
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        {/* Group 2 */}
        {(filter === 'ALL' || filter === 'GROUP_2') &&
          group2Motorcycles.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                GROUPE 2
              </h2>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                          Moto
                        </th>
                        {timeSlots.map((slot, index) => (
                          <th
                            key={slot}
                            className={`border border-gray-200 p-3 text-center min-w-[120px] ${index === currentTimeIndex
                              ? 'bg-yellow-100 relative'
                              : ''
                              }`}
                          >
                            {slot}
                            {index === currentTimeIndex && (
                              <div className="absolute top-0 left-0 right-0 h-1 bg-yamaha-red"></div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group2Motorcycles.map((motorcycle) => (
                        <tr key={motorcycle.id}>
                          <td className="border border-gray-200 p-3 sticky left-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                                {motorcycle.number}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {motorcycle.model}
                                </div>
                                <div
                                  className={`text-xs ${motorcycle.status === 'AVAILABLE'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}
                                >
                                  {motorcycle.status === 'AVAILABLE'
                                    ? 'Disponible'
                                    : 'Indisponible'}
                                </div>
                              </div>
                            </div>
                          </td>
                          {timeSlots.map((slot) => {
                            const booking = getBooking(motorcycle.id, slot);
                            return (
                              <BookingCell
                                key={`${motorcycle.id}-${slot}`}
                                motorcycle={motorcycle}
                                timeSlot={slot}
                                booking={booking}
                                onClick={() =>
                                  handleCellClick(motorcycle, slot, booking)
                                }
                              />
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        {/* Empty State */}
        {filteredMotorcycles.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucune moto disponible
            </h3>
            <p className="text-gray-500">
              Modifiez les filtres ou ajoutez des motos à l'événement
            </p>
          </div>
        )}
      </main>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* Walk-in Booking Modal */}
      {selectedSlot && (
        <WalkInBookingModal
          eventId={eventId!}
          motorcycle={selectedSlot.motorcycle}
          timeSlot={selectedSlot.timeSlot}
          date={getCurrentDate()}
          isOpen={isWalkInModalOpen}
          onClose={() => {
            setIsWalkInModalOpen(false);
            setSelectedSlot(null);
          }}
        />
      )}

      {/* Floating Action Button - New Reservation */}
      <button
        onClick={() => toast('Fonctionnalité à venir')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-yamaha-red text-white rounded-full shadow-lg hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
