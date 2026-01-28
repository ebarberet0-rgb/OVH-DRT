import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi, usersApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Users, Edit2, Save, X, User, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Session {
  id: string;
  startTime: string;
  endTime: string;
  availableSlots: number;
  bookedSlots: number;
  group: 'GROUP_1' | 'GROUP_2';
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SessionManagerProps {
  eventId: string;
}

export default function SessionManager({ eventId }: SessionManagerProps) {
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const queryClient = useQueryClient();

  // Récupérer les sessions
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ['sessions', eventId],
    queryFn: async () => {
      const response = await sessionsApi.getByEvent(eventId);
      return response.data;
    },
    enabled: !!eventId,
  });

  // Récupérer la liste des instructeurs
  const { data: instructors } = useQuery<Instructor[]>({
    queryKey: ['instructors'],
    queryFn: async () => {
      const response = await usersApi.getAll({ role: 'INSTRUCTOR' });
      return response.data.data || []; // L'API retourne { data: users, meta: {...} }
    },
  });

  // Mutation pour créer une session
  const createSessionMutation = useMutation({
    mutationFn: (sessionData: any) => sessionsApi.create(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', eventId] });
      setIsCreating(false);
      setFormData({});
      toast.success('Créneau créé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });

  // Mutation pour mettre à jour une session
  const updateSessionMutation = useMutation({
    mutationFn: (data: { id: string; sessionData: any }) =>
      sessionsApi.update(data.id, data.sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', eventId] });
      setEditingSession(null);
      toast.success('Créneau mis à jour avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const handleEditClick = (session: Session) => {
    setEditingSession(session);
    setFormData({
      startTime: format(new Date(session.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(session.endTime), "yyyy-MM-dd'T'HH:mm"),
      availableSlots: session.availableSlots,
      group: session.group,
      instructorId: session.instructor?.id || '',
    });
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setFormData({
      startTime: '',
      endTime: '',
      availableSlots: 10,
      group: 'GROUP_1',
      instructorId: '',
    });
  };

  const handleSaveSession = () => {
    if (editingSession) {
      updateSessionMutation.mutate({
        id: editingSession.id,
        sessionData: {
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          availableSlots: parseInt(formData.availableSlots),
          group: formData.group,
          instructorId: formData.instructorId || null,
        },
      });
    }
  };

  const handleCreateSession = () => {
    createSessionMutation.mutate({
      eventId,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      availableSlots: parseInt(formData.availableSlots),
      group: formData.group,
      instructorId: formData.instructorId || null,
    });
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setIsCreating(false);
    setFormData({});
  };

  // Grouper les sessions par date
  const sessionsByDate = sessions?.reduce((acc, session) => {
    const date = format(new Date(session.startTime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  const sortedDates = Object.keys(sessionsByDate || {}).sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yamaha-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestion des Créneaux</h3>
          <p className="text-sm text-gray-500 mt-1">
            Modifier les horaires, capacités et instructeurs assignés
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {sessions && sessions.length > 0 && (
            <div className="text-sm text-gray-500">
              {sessions.length} créneau{sessions.length > 1 ? 'x' : ''}
            </div>
          )}
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center px-4 py-2 bg-yamaha-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isCreating}
          >
            <Plus size={16} className="mr-2" />
            Nouveau créneau
          </button>
        </div>
      </div>

      {/* Form for creating a new session */}
      {isCreating && (
        <div className="bg-white rounded-lg border-2 border-yamaha-blue shadow-md p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yamaha-blue">
                Créer un nouveau créneau
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Annuler"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={handleCreateSession}
                  className="inline-flex items-center px-3 py-1.5 bg-yamaha-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  disabled={createSessionMutation.isPending || !formData.startTime || !formData.endTime}
                >
                  <Save size={16} className="mr-1.5" />
                  {createSessionMutation.isPending ? 'Création...' : 'Créer'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Heure début */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Heure de début
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                />
              </div>

              {/* Heure fin */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Heure de fin
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                />
              </div>

              {/* Capacité */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre de places
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.availableSlots}
                  onChange={(e) =>
                    setFormData({ ...formData, availableSlots: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                />
              </div>

              {/* Groupe */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Groupe de motos
                </label>
                <select
                  value={formData.group}
                  onChange={(e) =>
                    setFormData({ ...formData, group: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                >
                  <option value="GROUP_1">Groupe 1</option>
                  <option value="GROUP_2">Groupe 2</option>
                </select>
              </div>

              {/* Instructeur */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Instructeur assigné
                </label>
                <select
                  value={formData.instructorId}
                  onChange={(e) =>
                    setFormData({ ...formData, instructorId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                >
                  <option value="">Aucun instructeur</option>
                  {instructors?.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.firstName} {instructor.lastName} ({instructor.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {createSessionMutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  Erreur lors de la création. Veuillez réessayer.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {(!sessions || sessions.length === 0) && !isCreating && (
        <div className="text-center py-12 text-gray-500">
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucun créneau configuré pour cet événement</p>
          <p className="text-sm mt-2">Cliquez sur "Nouveau créneau" pour commencer</p>
        </div>
      )}

      {sortedDates.map((date) => (
        <div key={date} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar size={18} className="text-gray-600" />
            <h4 className="font-semibold text-gray-900">
              {format(new Date(date), 'EEEE dd MMMM yyyy', { locale: fr })}
            </h4>
            <span className="text-sm text-gray-500">
              ({sessionsByDate?.[date]?.length ?? 0} créneaux)
            </span>
          </div>

          <div className="space-y-3">
            {(sessionsByDate?.[date] ?? [])
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map((session) => {
                const isEditing = editingSession?.id === session.id;
                const availablePlaces = session.availableSlots - session.bookedSlots;

                return (
                  <div
                    key={session.id}
                    className={`bg-white rounded-lg border ${
                      isEditing ? 'border-yamaha-blue shadow-md' : 'border-gray-200'
                    } p-4`}
                  >
                    {!isEditing ? (
                      // Vue normale
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          {/* Horaire */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Clock size={16} className="text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                {format(new Date(session.startTime), 'HH:mm')} -{' '}
                                {format(new Date(session.endTime), 'HH:mm')}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                session.group === 'GROUP_1'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {session.group === 'GROUP_1' ? 'Groupe 1' : 'Groupe 2'}
                            </span>
                          </div>

                          {/* Capacité */}
                          <div className="flex items-center space-x-2">
                            <Users size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              <span className={availablePlaces > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                {availablePlaces}
                              </span>{' '}
                              / {session.availableSlots} places disponibles
                            </span>
                            <span className="text-xs text-gray-500">
                              ({session.bookedSlots} réservation{session.bookedSlots > 1 ? 's' : ''})
                            </span>
                          </div>

                          {/* Instructeur */}
                          <div className="flex items-center space-x-2">
                            <User size={16} className="text-gray-400" />
                            {session.instructor ? (
                              <span className="text-sm text-gray-700">
                                {session.instructor.firstName} {session.instructor.lastName}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 italic">
                                Aucun instructeur assigné
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bouton modifier */}
                        <button
                          onClick={() => handleEditClick(session)}
                          className="ml-4 p-2 text-yamaha-blue hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier ce créneau"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    ) : (
                      // Mode édition
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-yamaha-blue">
                            Mode édition
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Annuler"
                            >
                              <X size={18} />
                            </button>
                            <button
                              onClick={handleSaveSession}
                              className="inline-flex items-center px-3 py-1.5 bg-yamaha-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              disabled={updateSessionMutation.isPending}
                            >
                              <Save size={16} className="mr-1.5" />
                              {updateSessionMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Heure début */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Heure de début
                            </label>
                            <input
                              type="datetime-local"
                              value={formData.startTime}
                              onChange={(e) =>
                                setFormData({ ...formData, startTime: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                            />
                          </div>

                          {/* Heure fin */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Heure de fin
                            </label>
                            <input
                              type="datetime-local"
                              value={formData.endTime}
                              onChange={(e) =>
                                setFormData({ ...formData, endTime: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                            />
                          </div>

                          {/* Capacité */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Nombre de places
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={formData.availableSlots}
                              onChange={(e) =>
                                setFormData({ ...formData, availableSlots: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Actuellement: {session.bookedSlots} réservation(s)
                            </p>
                          </div>

                          {/* Groupe */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Groupe de motos
                            </label>
                            <select
                              value={formData.group}
                              onChange={(e) =>
                                setFormData({ ...formData, group: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                            >
                              <option value="GROUP_1">Groupe 1</option>
                              <option value="GROUP_2">Groupe 2</option>
                            </select>
                          </div>

                          {/* Instructeur */}
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Instructeur assigné
                            </label>
                            <select
                              value={formData.instructorId}
                              onChange={(e) =>
                                setFormData({ ...formData, instructorId: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                            >
                              <option value="">Aucun instructeur</option>
                              {instructors?.map((instructor) => (
                                <option key={instructor.id} value={instructor.id}>
                                  {instructor.firstName} {instructor.lastName} ({instructor.email})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {updateSessionMutation.isError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              Erreur lors de la mise à jour. Veuillez réessayer.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
