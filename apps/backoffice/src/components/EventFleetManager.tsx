import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motorcyclesApi, eventsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Save } from 'lucide-react';

interface Motorcycle {
  id: string;
  model: string;
  plateNumber: string;
  group: string;
  imageUrl: string;
}

interface EventFleetManagerProps {
  eventId: string;
  assignedMotorcycles: Motorcycle[];
  onClose: () => void;
}

export default function EventFleetManager({
  eventId,
  assignedMotorcycles,
  onClose,
}: EventFleetManagerProps) {
  const queryClient = useQueryClient();
  const [selectedMotorcycleIds, setSelectedMotorcycleIds] = useState<Set<string>>(
    new Set(assignedMotorcycles.map((m) => m.id))
  );

  // Fetch all motorcycles from the fleet
  const { data: allMotorcycles, isLoading: isLoadingMotorcycles } = useQuery<
    Motorcycle[]
  >({
    queryKey: ['motorcycles'],
    queryFn: async () => {
      const res = await motorcyclesApi.getAll();
      return res.data;
    },
  });

  // Mutation to save the changes
  const syncFleetMutation = useMutation({
    mutationFn: (motorcycleIds: string[]) =>
      eventsApi.syncMotorcycles(eventId, motorcycleIds),
    onSuccess: () => {
      toast.success('Flotte de l\'événement mise à jour !');
      // Invalidate queries to refetch data on the detail page and the list page
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Fleet sync error:', error);
      toast.error(
        error.response?.data?.message ||
        'Erreur lors de la mise à jour de la flotte. Vérifiez votre connexion ou vos droits.'
      );
    },
  });

  const handleToggleMotorcycle = (motorcycleId: string) => {
    setSelectedMotorcycleIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(motorcycleId)) {
        newSet.delete(motorcycleId);
      } else {
        newSet.add(motorcycleId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    syncFleetMutation.mutate(Array.from(selectedMotorcycleIds));
  };

  if (isLoadingMotorcycles) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" size={32} />
        <p className="ml-2">Chargement de la flotte...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        <p className="text-sm text-gray-600 mb-4">
          Sélectionnez les motos qui seront disponibles pour cet événement. Les
          modifications seront appliquées à l'application tablette.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMotorcycles?.map((moto) => (
            <div
              key={moto.id}
              onClick={() => handleToggleMotorcycle(moto.id)}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedMotorcycleIds.has(moto.id)
                ? 'border-yamaha-blue bg-blue-50'
                : 'border-gray-200 hover:border-gray-400'
                }`}
            >
              <div className="flex items-center">
                <img
                  src={moto.imageUrl || 'https://placehold.co/100x100'}
                  alt={moto.model}
                  className="w-16 h-16 rounded object-cover mr-4"
                />
                <div>
                  <p className="font-bold text-gray-800">{moto.model}</p>
                  <p className="text-sm text-gray-500">{moto.plateNumber}</p>
                  <span
                    className={`mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${moto.group === 'GROUP_1'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-indigo-100 text-indigo-800'
                      }`}
                  >
                    {moto.group}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 p-6 border-t border-gray-200 mt-4">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={syncFleetMutation.isPending}
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-6 py-2 bg-yamaha-blue hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={syncFleetMutation.isPending}
        >
          <Save size={16} className="mr-2" />
          {syncFleetMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
