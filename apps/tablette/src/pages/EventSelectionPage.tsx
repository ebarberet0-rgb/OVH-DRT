import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, Bike, RefreshCw, LogOut } from 'lucide-react';
import { eventsApi } from '../lib/api';
import type { Event } from '../types';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function EventSelectionPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const {
    data: events,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await eventsApi.getEvents();
      return response.data;
    },
  });

  const handleEventSelect = (eventId: string) => {
    navigate(`/event/${eventId}/planning`);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Événements actualisés');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getEventStatus = (event: Event) => {
    const start = parseISO(event.startDate);
    const end = parseISO(event.endDate);

    if (isPast(end)) return 'TERMINE';
    if (isFuture(start)) return 'A_VENIR';
    return 'EN_COURS';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_COURS':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'A_VENIR':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'TERMINE':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EN_COURS':
        return 'En cours';
      case 'A_VENIR':
        return 'À venir';
      case 'TERMINE':
        return 'Terminé';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yamaha-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur de connexion</h2>
          <p className="text-gray-600 mb-4">
            Impossible de se connecter à l'API. Vérifiez que le backend est démarré sur le port 3001.
          </p>
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-left">
            <p className="text-sm text-red-700 font-mono">
              {error instanceof Error ? error.message : 'Erreur inconnue'}
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => refetch()}
              className="w-full tablet-button-primary"
            >
              Réessayer
            </button>
            <button
              onClick={handleLogout}
              className="w-full tablet-button-secondary"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-yamaha-blue text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Yamaha Demo Ride Tour</h1>
              <p className="text-blue-200 text-sm mt-1">
                Bienvenue, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={isFetching}
                className="touch-target bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`}
                />
              </button>
              <button
                onClick={handleLogout}
                className="touch-target bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Sélectionnez un événement
          </h2>
          <p className="text-gray-600 mt-1">
            {events?.length || 0} événement(s) disponible(s)
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => {
            const status = getEventStatus(event);
            const statusColor = getStatusColor(status);
            const statusLabel = getStatusLabel(status);

            return (
              <div
                key={event.id}
                onClick={() => handleEventSelect(event.id)}
                className="tablet-card cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 active:scale-100"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}
                  >
                    {statusLabel}
                  </span>
                  <Bike className="w-6 h-6 text-yamaha-blue" />
                </div>

                {/* Event Name */}
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {event.name}
                </h3>

                {/* Dealer Info */}
                {event.dealer && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {event.dealer.name} - {event.dealer.city}
                    </span>
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center text-gray-600 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {format(parseISO(event.startDate), 'dd MMM', {
                      locale: fr,
                    })}{' '}
                    -{' '}
                    {format(parseISO(event.endDate), 'dd MMM yyyy', {
                      locale: fr,
                    })}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yamaha-blue">
                      {event.motorcycles?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">Motos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {event.bookings?.filter((b) => b.status === 'COMPLETED')
                        .length || 0}
                    </p>
                    <p className="text-xs text-gray-500">Essais terminés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {event.bookings?.filter(
                        (b) =>
                          b.status === 'RESERVED' ||
                          b.status === 'CONFIRMED' ||
                          b.status === 'READY'
                      ).length || 0}
                    </p>
                    <p className="text-xs text-gray-500">En attente</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {events?.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun événement disponible
            </h3>
            <p className="text-gray-500">
              Contactez votre administrateur pour plus d'informations
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
