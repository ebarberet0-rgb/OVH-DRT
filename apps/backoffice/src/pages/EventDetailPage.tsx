import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, bookingsApi, sessionsApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  Filter,
  Download,
  Edit2,
  X,
  Save,
  Bike,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EventFleetManager from '@/components/EventFleetManager';
import SessionManager from '@/components/SessionManager';

interface Booking {
  id: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  clientLicenseType?: string;
  motorcycle: {
    model: string;
    group: 'GROUP_1' | 'GROUP_2';
  };
  session: {
    startTime: string;
    endTime: string;
  };
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  createdAt: string;
  updatedAt: string;
  bookingSource: 'WEB' | 'TABLET';
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    licenseType?: string;
  };
}

interface Session {
  id: string;
  startTime: string;
  endTime: string;
  availableSlots: number;
  bookedSlots: number;
}

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [filterModel, setFilterModel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false); // State for the new modal
  const [isSessionManagerOpen, setIsSessionManagerOpen] = useState(false); // State for session manager
  const [formData, setFormData] = useState<any>({});
  const queryClient = useQueryClient();

  const { data: event, isLoading: isEventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await eventsApi.getById(eventId!);
      return response.data;
    },
    enabled: !!eventId,
  });

  const { data: bookings, isLoading: isBookingsLoading } = useQuery<Booking[]>({
    queryKey: ['bookings', eventId],
    queryFn: async () => {
      const response = await bookingsApi.getByEvent(eventId!);
      return response.data;
    },
    enabled: !!eventId,
  });

  const { data: sessions, isLoading: isSessionsLoading } = useQuery<Session[]>({
    queryKey: ['sessions', eventId],
    queryFn: async () => {
      const response = await sessionsApi.getByEvent(eventId!);
      return response.data;
    },
    enabled: !!eventId,
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: { id: string; userData: any }) =>
      bookingsApi.updateUser(data.id, data.userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', eventId] });
      setIsEditModalOpen(false);
      setEditingBooking(null);
      toast.success('Informations mises à jour avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      firstName: booking.clientFirstName || '',
      lastName: booking.clientLastName || '',
      email: booking.clientEmail || '',
      phone: booking.clientPhone || '',
      licenseType: booking.clientLicenseType || booking.user?.licenseType || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = () => {
    if (editingBooking) {
      updateUserMutation.mutate({
        id: editingBooking.id,
        userData: formData,
      });
    }
  };

  const filteredBookings = bookings?.filter((booking) => {
    const matchesModel =
      filterModel === 'all' || booking.motorcycle.model === filterModel;
    const matchesStatus =
      filterStatus === 'all' || booking.status === filterStatus;
    return matchesModel && matchesStatus;
  });

  const uniqueModels = Array.from(
    new Set(bookings?.map((b) => b.motorcycle.model) || [])
  );

  const handleExportSatisfaction = async () => {
    try {
      const response = await bookingsApi.exportSatisfaction(eventId!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `satisfaction-${eventId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export réussi!');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      CONFIRMED: { label: 'Réservée', color: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Effectuée', color: 'bg-blue-100 text-blue-800' },
      CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
      NO_SHOW: { label: 'No-show', color: 'bg-orange-100 text-orange-800' },
    };
    return config[status as keyof typeof config] || config.CONFIRMED;
  };

  if (isEventLoading || isBookingsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yamaha-blue"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {event?.name}
            </h1>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>
                  {event?.dealer?.name && `${event.dealer.name} - `}{event?.address}, {event?.city}{' '}
                  {event?.postalCode}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>
                  Du{' '}
                  {format(new Date(event?.startDate || ''), 'dd MMMM yyyy', {
                    locale: fr,
                  })}{' '}
                  au{' '}
                  {format(new Date(event?.endDate || ''), 'dd MMMM yyyy', {
                    locale: fr,
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsFleetModalOpen(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Bike size={16} />
              <span>Gérer la flotte</span>
            </button>
            <button
              onClick={handleExportSatisfaction}
              className="px-4 py-2 bg-yamaha-blue text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Exporter satisfaction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Availability */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock size={20} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Disponibilités des créneaux</h2>
          </div>
          <button
            onClick={() => setIsSessionManagerOpen(true)}
            className="px-4 py-2 bg-yamaha-blue text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit2 size={16} />
            <span>Gérer les créneaux</span>
          </button>
        </div>

        {isSessionsLoading ? (
          <div className="text-gray-500">Chargement des disponibilités...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(() => {
              if (!sessions) return null;

              // Group sessions by start time
              const sessionsByTime = sessions.reduce((acc, session) => {
                const time = session.startTime;
                if (!acc[time]) {
                  acc[time] = {
                    ...session,
                    availableSlots: 0,
                    bookedSlots: 0,
                  };
                }
                acc[time].availableSlots += session.availableSlots;
                acc[time].bookedSlots += session.bookedSlots;
                return acc;
              }, {} as Record<string, Session>);

              const uniqueSessions = Object.values(sessionsByTime).sort((a, b) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
              );

              if (uniqueSessions.length === 0) {
                return <div className="col-span-full text-gray-500">Aucun créneau configuré.</div>;
              }

              return uniqueSessions.map(session => {
                const available = session.availableSlots - session.bookedSlots;
                const isFull = available <= 0;
                return (
                  <div key={session.startTime} className={`p-3 rounded-lg border ${isFull ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                    <div className="font-medium text-gray-900 mb-1">
                      {format(new Date(session.startTime), 'dd MMM HH:mm', { locale: fr })}
                    </div>
                    <div className={`text-sm font-bold ${isFull ? 'text-red-700' : 'text-green-700'}`}>
                      {available} / {session.availableSlots} dispo
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modèle
            </label>
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
            >
              <option value="all">Tous les modèles</option>
              {uniqueModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="CONFIRMED">Réservées</option>
              <option value="COMPLETED">Effectuées</option>
              <option value="CANCELLED">Annulées</option>
              <option value="NO_SHOW">No-show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modèle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Groupe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créneau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings?.map((booking) => {
                const statusBadge = getStatusBadge(booking.status);
                return (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {booking.clientFirstName} {booking.clientLastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center space-x-1">
                        <Mail size={14} />
                        <span>{booking.clientEmail}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-1">
                        <Phone size={14} />
                        <span>{booking.clientPhone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.motorcycle.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.motorcycle.group === 'GROUP_1'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                          }`}
                      >
                        {booking.motorcycle.group === 'GROUP_1'
                          ? 'Groupe 1'
                          : 'Groupe 2'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-0.5">
                          {format(new Date(booking.session.startTime), 'eee dd MMM', { locale: fr })}
                        </span>
                        <span>
                          {format(new Date(booking.session.startTime), 'HH:mm')} -{' '}
                          {format(new Date(booking.session.endTime), 'HH:mm')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.bookingSource === 'WEB'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                          }`}
                      >
                        {booking.bookingSource === 'WEB' ? 'En ligne' : 'Sur place'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(booking)}
                        className="text-yamaha-blue hover:text-yamaha-red mr-3"
                        title="Modifier les informations du client"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        title="Annuler la réservation"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBookings?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucune réservation trouvée</p>
          </div>
        )}
      </div>

      {/* Manage Fleet Modal */}
      {isFleetModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Gérer la flotte pour: {event?.name}
              </h2>
              <button
                onClick={() => setIsFleetModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <EventFleetManager
              eventId={eventId!}
              assignedMotorcycles={event?.motorcycles || []}
              onClose={() => setIsFleetModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Session Manager Modal */}
      {isSessionManagerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Gestion des Créneaux - {event?.name}
              </h2>
              <button
                onClick={() => setIsSessionManagerOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <SessionManager eventId={eventId!} />
            </div>
          </div>
        </div>
      )}

// ... (reste du composant)


      {/* Edit User Modal */}
      {isEditModalOpen && editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Modifier les informations du client
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingBooking.clientFirstName} {editingBooking.clientLastName} - Réservation #{editingBooking.id.slice(0, 8)}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingBooking(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form className="space-y-4">
                {/* Nom et Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                      placeholder="Nom"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                    placeholder="06 12 34 56 78"
                  />
                </div>

                {/* Type de permis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de permis
                  </label>
                  <select
                    value={formData.licenseType}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="A">A - Toutes motos</option>
                    <option value="A2">A2 - Motos bridées</option>
                    <option value="A1">A1 - 125cc</option>
                  </select>
                </div>
              </form>

              {updateUserMutation.isError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Erreur lors de la mise à jour. Veuillez réessayer.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingBooking(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={updateUserMutation.isPending}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveUser}
                className="inline-flex items-center px-6 py-2 bg-yamaha-blue hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updateUserMutation.isPending}
              >
                <Save size={16} className="mr-2" />
                {updateUserMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

