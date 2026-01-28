import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { api, usersApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Instructor {
  id: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface EventInstructorsModalProps {
  eventId: string;
  eventName: string;
  onClose: () => void;
}

export default function EventInstructorsModal({ eventId, eventName, onClose }: EventInstructorsModalProps) {
  const queryClient = useQueryClient();
  const [selectedInstructorId, setSelectedInstructorId] = useState('');

  // Fetch instructors assigned to this event
  const { data: assignedInstructors, isLoading: loadingAssigned } = useQuery<Instructor[]>({
    queryKey: ['event-instructors', eventId],
    queryFn: async () => {
      const response = await api.get(`/api/events/${eventId}/instructors`);
      return response.data;
    },
  });

  // Fetch all instructors (users with role INSTRUCTOR)
  const { data: usersResponse } = useQuery<{ data: User[] }>({
    queryKey: ['users', 'INSTRUCTOR'],
    queryFn: async () => {
      const response = await usersApi.getAll({ role: 'INSTRUCTOR', limit: 100 });
      return response.data;
    },
  });

  const allInstructors = usersResponse?.data || [];
  const assignedIds = assignedInstructors?.map(a => a.instructor.id) || [];
  const availableInstructors = allInstructors.filter(i => !assignedIds.includes(i.id));

  // Add instructor mutation
  const addInstructorMutation = useMutation({
    mutationFn: async (instructorId: string) => {
      return api.post(`/api/events/${eventId}/instructors`, { instructorId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-instructors', eventId] });
      toast.success('Instructeur ajouté avec succès');
      setSelectedInstructorId('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout de l\'instructeur');
    },
  });

  // Remove instructor mutation
  const removeInstructorMutation = useMutation({
    mutationFn: async (instructorId: string) => {
      return api.delete(`/api/events/${eventId}/instructors/${instructorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-instructors', eventId] });
      toast.success('Instructeur retiré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du retrait de l\'instructeur');
    },
  });

  const handleAdd = () => {
    if (selectedInstructorId) {
      addInstructorMutation.mutate(selectedInstructorId);
    }
  };

  const handleRemove = (instructorId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer cet instructeur de l\'événement ?')) {
      removeInstructorMutation.mutate(instructorId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Instructeurs</h2>
            <p className="text-sm text-gray-600 mt-1">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add Instructor Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Plus size={20} className="mr-2 text-blue-600" />
              Ajouter un instructeur
            </h3>
            <div className="flex gap-3">
              <select
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={availableInstructors.length === 0}
              >
                <option value="">
                  {availableInstructors.length === 0
                    ? 'Aucun instructeur disponible'
                    : 'Sélectionner un instructeur...'}
                </option>
                {availableInstructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.firstName} {instructor.lastName} ({instructor.email})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                disabled={!selectedInstructorId || addInstructorMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addInstructorMutation.isPending ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>

          {/* Assigned Instructors List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Instructeurs assignés ({assignedInstructors?.length || 0})
            </h3>
            {loadingAssigned ? (
              <div className="text-center py-8 text-gray-500">Chargement...</div>
            ) : assignedInstructors && assignedInstructors.length > 0 ? (
              <div className="space-y-2">
                {assignedInstructors.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {assignment.instructor.firstName} {assignment.instructor.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{assignment.instructor.email}</div>
                        <div className="text-xs text-gray-500">{assignment.instructor.phone}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(assignment.instructor.id)}
                      disabled={removeInstructorMutation.isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Retirer cet instructeur"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                Aucun instructeur assigné à cet événement
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
