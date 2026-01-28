import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, bookingsApi, dealersApi } from '@/lib/api';
import { format, differenceInDays, addMinutes, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  MapPin,
  Users,
  Download,
  Filter,
  Search,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Trash2,
  Edit,
  UserCog,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import EventInstructorsModal from '@/components/EventInstructorsModal';

interface Event {
  id: string;
  name: string;
  type: 'PUBLIC_EVENT' | 'DEALERSHIP';
  dealerId: string | null;
  dealer: {
    name: string;
    city: string;
  } | null;
  startDate: string;
  endDate: string;
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  maxSlotsPerSession: number;
  _count: {
    bookings: number;
  };
}

const eventSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  dealerId: z.string().nullable().optional(),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  type: z.enum(['PUBLIC_EVENT', 'DEALERSHIP']),
  address: z.string().min(2, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().min(5, 'Code postal requis'),
  latitude: z.preprocess(
    (val) => (val === '' || val === null ? undefined : Number(val)),
    z.number().optional()
  ),
  longitude: z.preprocess(
    (val) => (val === '' || val === null ? undefined : Number(val)),
    z.number().optional()
  ),
  maxSlotsPerSession: z.number().min(1),
  generateSessions: z.boolean().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function EventsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [instructorsModalEvent, setInstructorsModalEvent] = useState<{ id: string; name: string } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await eventsApi.getAll();
      return response.data;
    },
  });

  const { data: dealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: async () => {
      const res = await dealersApi.getAll();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      toast.success('Événement créé');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      toast.success('Événement supprimé');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => eventsApi.update(id, data),
    onSuccess: () => {
      toast.success('Événement modifié');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsModalOpen(false);
      setEditingEvent(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification');
    }
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: 'PUBLIC_EVENT',
      maxSlotsPerSession: 8,
      generateSessions: true,
    }
  });

  // Watch dealer selection to auto-fill address
  const selectedDealerId = form.watch('dealerId');

  useEffect(() => {
    if (selectedDealerId && dealers) {
      const dealer = (dealers as any[]).find((d) => d.id === selectedDealerId);
      if (dealer) {
        form.setValue('address', dealer.address);
        form.setValue('city', dealer.city);
        form.setValue('postalCode', dealer.postalCode);
        if (dealer.latitude) form.setValue('latitude', dealer.latitude);
        if (dealer.longitude) form.setValue('longitude', dealer.longitude);
      }
    }
  }, [selectedDealerId, dealers, form]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('CLICK - Delete button for:', id);

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      console.log('CONFIRMED - Deleting:', id);
      toast.loading('Suppression en cours...', { duration: 1000 });
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, event: Event) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingEvent(event);

    // Pre-fill form with event data
    form.reset({
      name: event.name,
      dealerId: event.dealerId || '',
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      type: event.type,
      address: event.address,
      city: event.city,
      postalCode: event.postalCode,
      latitude: event.latitude,
      longitude: event.longitude,
      maxSlotsPerSession: event.maxSlotsPerSession,
      generateSessions: false,
    });

    setIsModalOpen(true);
  };

  const geocodeAddress = async () => {
    const address = form.getValues('address');
    const city = form.getValues('city');
    const postalCode = form.getValues('postalCode');

    if (!address || !city || !postalCode) {
      toast.error('Veuillez remplir l\'adresse, la ville et le code postal d\'abord');
      return;
    }

    setIsGeocoding(true);
    try {
      // Construction de l'adresse avec numéro de rue en premier (meilleure précision)
      const fullAddress = `${address}, ${postalCode} ${city}`;

      // Paramètres améliorés pour une meilleure précision
      const params = new URLSearchParams({
        format: 'json',
        q: fullAddress,
        countrycodes: 'fr', // Limite la recherche à la France
        addressdetails: '1', // Retourne les détails de l'adresse
        limit: '3', // Récupère 3 résultats pour pouvoir choisir le meilleur
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'Yamaha-DRT-App/1.0'
          }
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        // Prendre le premier résultat (meilleur score)
        const result = data[0];
        const { lat, lon, display_name, importance, type, addresstype, address: addressDetails } = result;

        // Validation des coordonnées
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (isNaN(latitude) || isNaN(longitude)) {
          toast.error('Coordonnées invalides reçues de l\'API de géocodage');
          return;
        }

        // Vérification que les coordonnées sont bien en France métropolitaine
        // Latitude: 41°N à 51°N, Longitude: -5°W à 10°E
        if (latitude < 41 || latitude > 51 || longitude < -5 || longitude > 10) {
          toast.error('Les coordonnées trouvées ne semblent pas être en France');
          console.warn('Coordonnées hors France:', { latitude, longitude, display_name });
          return;
        }

        form.setValue('latitude', latitude);
        form.setValue('longitude', longitude);

        // Évaluation de la qualité basée sur des critères fiables
        let qualityScore = 0;
        let qualityDetails = [];

        // Critère 1: Type d'adresse (le plus important)
        if (type === 'house' || addresstype === 'house') {
          qualityScore += 40; // Adresse exacte avec numéro
          qualityDetails.push('Adresse exacte');
        } else if (type === 'building' || addresstype === 'building') {
          qualityScore += 30;
          qualityDetails.push('Bâtiment identifié');
        } else if (type === 'road' || addresstype === 'road') {
          qualityScore += 15;
          qualityDetails.push('Rue trouvée');
        } else {
          qualityScore += 5;
          qualityDetails.push('Zone approximative');
        }

        // Critère 2: Présence du numéro de rue dans les détails
        if (addressDetails?.house_number) {
          qualityScore += 30;
          qualityDetails.push('N° de rue confirmé');
        }

        // Critère 3: Correspondance du code postal
        const inputPostalCode = form.getValues('postalCode');
        if (addressDetails?.postcode === inputPostalCode) {
          qualityScore += 20;
          qualityDetails.push('Code postal confirmé');
        } else if (addressDetails?.postcode) {
          qualityScore += 5;
          qualityDetails.push('Code postal différent');
        }

        // Critère 4: Score importance de Nominatim (bonus seulement)
        if (importance && importance > 0.5) {
          qualityScore += 10;
          qualityDetails.push('Importance élevée');
        }

        // Détermination du niveau de qualité final
        let qualityLevel = '';
        let qualityIcon = '';
        if (qualityScore >= 70) {
          qualityLevel = 'Haute précision';
          qualityIcon = '✅';
        } else if (qualityScore >= 40) {
          qualityLevel = 'Précision moyenne';
          qualityIcon = '⚡';
        } else {
          qualityLevel = 'Précision faible - vérifiez la position';
          qualityIcon = '⚠️';
        }

        const qualityMessage = ` (${qualityLevel})`;

        toast.success(
          `${qualityIcon} Coordonnées GPS trouvées${qualityMessage}\n${display_name}`,
          { duration: 5000 }
        );

        // Log pour debug
        console.log('Geocoding result:', {
          address: display_name,
          lat: latitude,
          lon: longitude,
          importance,
          type,
          addresstype,
          addressDetails,
          qualityScore,
          qualityLevel,
          qualityDetails,
        });
      } else {
        toast.error('Impossible de trouver les coordonnées pour cette adresse. Vérifiez l\'adresse saisie.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Erreur lors de la recherche des coordonnées');
    } finally {
      setIsGeocoding(false);
    }
  };


  const generateStandardSessions = (startDateStr: string, endDateStr: string, maxSlots: number) => {
    const sessions = [];
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Morning: 9:00 - 12:00 (Last ride starts at 11:00, ends at 11:45)
      // Slots: 9:00, 10:00, 11:00
      let current = setMinutes(setHours(new Date(d), 9), 0);
      const lunchBreak = setMinutes(setHours(new Date(d), 12), 0); // 12h00 strict stop for lunch

      while (current < lunchBreak) {
        sessions.push({
          startTime: current.toISOString(),
          endTime: addMinutes(current, 45).toISOString(),
          availableSlots: maxSlots,
          bookedSlots: 0,
          group: 'GROUP_1',
        });
        sessions.push({
          startTime: current.toISOString(),
          endTime: addMinutes(current, 45).toISOString(),
          availableSlots: maxSlots,
          bookedSlots: 0,
          group: 'GROUP_2',
        });
        // 45 min ride + 15 min break = 60 min total
        current = addMinutes(current, 60);
      }

      // Afternoon: 14:00 - 18:00 (Last ride starts at 17:00, ends at 17:45)
      // Slots: 14:00, 15:00, 16:00, 17:00
      current = setMinutes(setHours(new Date(d), 14), 0);
      const endDay = setMinutes(setHours(new Date(d), 18), 0);

      while (current < endDay) {
        sessions.push({
          startTime: current.toISOString(),
          endTime: addMinutes(current, 45).toISOString(),
          availableSlots: maxSlots,
          bookedSlots: 0,
          group: 'GROUP_1',
        });
        sessions.push({
          startTime: current.toISOString(),
          endTime: addMinutes(current, 45).toISOString(),
          availableSlots: maxSlots,
          bookedSlots: 0,
          group: 'GROUP_2',
        });
        // 45 min ride + 15 min break = 60 min total
        current = addMinutes(current, 60);
      }
    }
    return sessions;
  };

  const onSubmit = (data: EventFormData) => {
    const payload: any = { ...data };
    if (data.generateSessions && !editingEvent) {
      payload.sessions = generateStandardSessions(data.startDate, data.endDate, data.maxSlotsPerSession);
    }
    delete payload.generateSessions;

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredEvents = events?.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.dealer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (event.dealer?.city.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const now = new Date();
    const endDate = new Date(event.endDate);
    const isUpcoming = endDate >= now;

    if (filterStatus === 'upcoming') {
      return matchesSearch && isUpcoming;
    } else if (filterStatus === 'past') {
      return matchesSearch && !isUpcoming;
    }

    return matchesSearch;
  });

  const handleExportLeads = async (eventId: string) => {
    try {
      const response = await bookingsApi.exportLeads(eventId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads - ${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors de l\'export des leads:', error);
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const daysUntilStart = differenceInDays(startDate, now);

    if (endDate < now) {
      return { label: 'Terminé', color: 'bg-gray-100 text-gray-800' };
    } else if (startDate <= now && endDate >= now) {
      return { label: 'En cours', color: 'bg-green-100 text-green-800' };
    } else if (daysUntilStart <= 7) {
      return {
        label: `Dans ${daysUntilStart} jours`,
        color: 'bg-yellow-100 text-yellow-800',
      };
    } else {
      return {
        label: `Dans ${daysUntilStart} jours`,
        color: 'bg-blue-100 text-blue-800',
      };
    }
  };

  const getBookingRate = (event: Event) => {
    // Calcul approximatif: 7 créneaux par jour (9h-18h) sur 2 jours
    const totalSlots = 7 * 2 * 2; // Approximativement pour 2 groupes
    const bookedSlots = event._count?.bookings || 0;
    const percentage = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;
    return { bookedSlots, totalSlots, percentage };
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des événements
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de tous les événements Demo Ride Tour 2026
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => {
              setEditingEvent(null);
              form.reset({
                type: 'PUBLIC_EVENT',
                maxSlotsPerSession: 8,
                generateSessions: true,
              });
              setIsModalOpen(true);
            }}
            className="bg-yamaha-blue text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-900 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Créer un événement
          </button>
        )}
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
              placeholder="Rechercher par ville, concession..."
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
              onChange={(e) =>
                setFilterStatus(e.target.value as 'all' | 'upcoming' | 'past')
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
            >
              <option value="all">Tous les événements</option>
              <option value="upcoming">À venir</option>
              <option value="past">Passés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredEvents?.map((event) => {
          const status = getEventStatus(event);
          const bookingRate = getBookingRate(event);
          const isPast = new Date(event.endDate) < new Date();

          return (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {event.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin size={16} />
                        <span>
                          {event.dealer?.name && `${event.dealer.name} - `}{event.dealer?.city || event.city}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>
                          {format(new Date(event.startDate), 'dd', { locale: fr })}{' '}
                          &{' '}
                          {format(new Date(event.endDate), 'dd MMMM yyyy', {
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {user?.role === 'ADMIN' && (
                    <div className="flex items-center space-x-2 ml-4">
                      {isPast && (
                        <button
                          onClick={() => handleExportLeads(event.id)}
                          title="Exporter les leads"
                          className="px-3 py-2 bg-yamaha-blue text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center"
                        >
                          <Download size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setInstructorsModalEvent({ id: event.id, name: event.name });
                        }}
                        title="Gérer les instructeurs"
                        className="px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors flex items-center"
                      >
                        <UserCog size={16} />
                      </button>
                      <button
                        onClick={(e) => handleEdit(e, event)}
                        title="Modifier l'événement"
                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, event.id)}
                        title="Supprimer l'événement"
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Booking Stats */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center space-x-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-gray-600">
                        {bookingRate.bookedSlots} réservations
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to={`/events/${event.id}`}
                  className="inline-flex items-center space-x-2 text-yamaha-red hover:text-red-700 font-semibold transition-colors"
                >
                  <span>Voir les détails</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}

        {filteredEvents?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Aucun événement trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Event Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{editingEvent ? 'Modifier l\'événement' : 'Créer un événement'}</h2>
              <button onClick={() => {
                setIsModalOpen(false);
                setEditingEvent(null);
              }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'événement</label>
                <input {...form.register('name')} className="w-full px-3 py-2 border rounded-lg" placeholder="ex: Demo Ride Tour - Lyon" />
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concessionnaire</label>
                <select {...form.register('dealerId')} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Sélectionner une concession</option>
                  {Array.isArray(dealers) && dealers.map((dealer: any) => (
                    <option key={dealer.id} value={dealer.id}>{dealer.name} ({dealer.city})</option>
                  ))}
                </select>
                {form.formState.errors.dealerId && <p className="text-red-500 text-xs mt-1">{form.formState.errors.dealerId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input type="date" {...form.register('startDate')} className="w-full px-3 py-2 border rounded-lg" />
                  {form.formState.errors.startDate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input type="date" {...form.register('endDate')} className="w-full px-3 py-2 border rounded-lg" />
                  {form.formState.errors.endDate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.endDate.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input {...form.register('address')} className="w-full px-3 py-2 border rounded-lg" />
                {form.formState.errors.address && <p className="text-red-500 text-xs mt-1">{form.formState.errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input {...form.register('city')} className="w-full px-3 py-2 border rounded-lg" />
                  {form.formState.errors.city && <p className="text-red-500 text-xs mt-1">{form.formState.errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                  <input {...form.register('postalCode')} className="w-full px-3 py-2 border rounded-lg" />
                  {form.formState.errors.postalCode && <p className="text-red-500 text-xs mt-1">{form.formState.errors.postalCode.message}</p>}
                </div>
              </div>

              {/* Geocoding Button */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <button
                  type="button"
                  onClick={geocodeAddress}
                  disabled={isGeocoding}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yamaha-blue text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Recherche en cours...</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={20} />
                      <span>Calculer automatiquement les coordonnées GPS</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Remplissez l'adresse, la ville et le code postal, puis cliquez pour obtenir les coordonnées GPS
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (ex: 48.8566)</label>
                  <input type="number" step="any" {...form.register('latitude', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" placeholder="Optionnel" />
                  {form.formState.errors.latitude && <p className="text-red-500 text-xs mt-1">{form.formState.errors.latitude.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (ex: 2.3522)</label>
                  <input type="number" step="any" {...form.register('longitude', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" placeholder="Optionnel" />
                  {form.formState.errors.longitude && <p className="text-red-500 text-xs mt-1">{form.formState.errors.longitude.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slots par session</label>
                  <input type="number" {...form.register('maxSlotsPerSession', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select {...form.register('type')} className="w-full px-3 py-2 border rounded-lg">
                    <option value="PUBLIC_EVENT">Road Tour (Public)</option>
                    <option value="DEALERSHIP">Événement Concession</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-blue-50 p-4 rounded-lg">
                <input type="checkbox" id="generateSessions" {...form.register('generateSessions')} className="h-4 w-4 text-yamaha-blue border-gray-300 rounded" />
                <label htmlFor="generateSessions" className="text-sm text-gray-700">
                  Générer automatiquement les sessions (9h-12h30, 14h-18h / 45min)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                <button type="button" onClick={() => {
                  setIsModalOpen(false);
                  setEditingEvent(null);
                }} className="px-4 py-2 border rounded hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-yamaha-blue text-white rounded hover:bg-blue-900 flex items-center">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin mr-2" size={16} />}
                  {editingEvent ? 'Modifier l\'événement' : 'Créer l\'événement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instructors Modal */}
      {instructorsModalEvent && (
        <EventInstructorsModal
          eventId={instructorsModalEvent.id}
          eventName={instructorsModalEvent.name}
          onClose={() => setInstructorsModalEvent(null)}
        />
      )}
    </div>
  );
}
