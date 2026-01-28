import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  Search,
  Filter,
  User,
  Bike,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
  Edit,
  X,
  Save,
} from 'lucide-react';

interface Booking {
  id: string;
  status: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    licenseType: string;
  };
  motorcycle: {
    model: string;
    plateNumber: string;
  };
  session: {
    startTime: string;
    endTime: string;
  };
  event: {
    name: string;
    city: string;
    dealer?: {
      name: string;
    };
  };
}

const statusConfig = {
  RESERVED: { label: 'Réservé', color: 'bg-blue-100 text-blue-800', icon: Calendar },
  CONFIRMED: { label: 'Confirmé', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  COMPLETED: { label: 'Terminé', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  CANCELLED: { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: XCircle },
  NO_SHOW: { label: 'Absent', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
};

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await bookingsApi.getAll();
      return response.data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: { id: string; userData: any }) =>
      bookingsApi.updateUser(data.id, data.userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setIsEditModalOpen(false);
      setEditingBooking(null);
    },
  });

  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      firstName: booking.user.firstName || '',
      lastName: booking.user.lastName || '',
      email: booking.user.email || '',
      phone: booking.user.phone || '',
      licenseType: booking.user.licenseType || '',
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
    // Vérifier que toutes les données nécessaires existent
    if (!booking.user || !booking.motorcycle || !booking.event) {
      return false;
    }

    const matchesSearch =
      booking.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.motorcycle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.event.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: 'bg-gray-100 text-gray-800',
      icon: AlertCircle,
    };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon size={14} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const stats = {
    total: bookings?.length || 0,
    reserved: bookings?.filter(b => b.status === 'RESERVED').length || 0,
    confirmed: bookings?.filter(b => b.status === 'CONFIRMED').length || 0,
    completed: bookings?.filter(b => b.status === 'COMPLETED').length || 0,
    cancelled: bookings?.filter(b => b.status === 'CANCELLED' || b.status === 'NO_SHOW').length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yamaha-blue"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Réservations
        </h1>
        <p className="text-gray-600">
          Liste de toutes les réservations effectuées sur le site web
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Calendar size={24} className="text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Réservées</p>
              <p className="text-3xl font-bold text-blue-600">{stats.reserved}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Confirmées</p>
              <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Terminées</p>
              <p className="text-3xl font-bold text-gray-600">{stats.completed}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <CheckCircle size={24} className="text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Annulées</p>
              <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Ban size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher par nom, email, moto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="RESERVED">Réservées</option>
              <option value="CONFIRMED">Confirmées</option>
              <option value="COMPLETED">Terminées</option>
              <option value="CANCELLED">Annulées</option>
              <option value="NO_SHOW">Absents</option>
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
                  Moto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Événement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créneau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date réservation
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings?.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-yamaha-blue rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.user?.firstName || 'N/A'} {booking.user?.lastName || ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          Permis {booking.user?.licenseType || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <Mail size={14} className="mr-2 text-gray-400" />
                        {booking.user?.email || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Phone size={14} className="mr-2 text-gray-400" />
                        {booking.user?.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Bike size={20} className="mr-2 text-yamaha-red" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.motorcycle?.model || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{booking.motorcycle?.plateNumber || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <MapPin size={16} className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.event?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          {booking.event?.dealer?.name || booking.event?.city || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.session?.startTime ? format(new Date(booking.session.startTime), 'dd MMM yyyy', { locale: fr }) : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.session?.startTime && booking.session?.endTime ? (
                        <>
                          {format(new Date(booking.session.startTime), 'HH:mm', { locale: fr })} -{' '}
                          {format(new Date(booking.session.endTime), 'HH:mm', { locale: fr })}
                        </>
                      ) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleEditClick(booking)}
                      className="inline-flex items-center px-3 py-2 bg-yamaha-blue hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      title="Modifier les informations du client"
                    >
                      <Edit size={16} className="mr-1" />
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings?.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Aucune réservation trouvée</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 text-sm text-gray-600 text-center">
        Affichage de {filteredBookings?.length || 0} réservation(s) sur {bookings?.length || 0} au total
      </div>

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
                  Réservation #{editingBooking.id.slice(0, 8)}
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
