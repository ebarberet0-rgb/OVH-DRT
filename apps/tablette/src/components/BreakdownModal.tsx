import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Camera, AlertTriangle } from 'lucide-react';
import { motorcyclesApi } from '../lib/api';
import type { Motorcycle } from '../types';
import toast from 'react-hot-toast';

interface BreakdownModalProps {
  motorcycle: Motorcycle;
  isOpen: boolean;
  onClose: () => void;
}

export default function BreakdownModal({
  motorcycle,
  isOpen,
  onClose,
}: BreakdownModalProps) {
  const queryClient = useQueryClient();
  const [problemType, setProblemType] = useState<'CRASH' | 'MECHANICAL' | 'OTHER'>('CRASH');
  const [description, setDescription] = useState('');
  const [blockFutureBookings, setBlockFutureBookings] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const reportMutation = useMutation({
    mutationFn: async () => {
      // In a real implementation, first upload the photo if present
      let photoUrl: string | undefined;

      if (photoFile) {
        // Upload photo logic here
        // photoUrl = await uploadPhoto(photoFile);
        toast('Upload photo à implémenter');
      }

      return motorcyclesApi.reportBreakdown(motorcycle.id, {
        motorcycleId: motorcycle.id,
        type: problemType,
        description,
        photoUrl,
        blockFutureBookings,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Problème signalé avec succès');

      if (blockFutureBookings) {
        toast.success('Les clients concernés seront notifiés par email', {
          duration: 5000,
        });
      }

      onClose();
      resetForm();
    },
    onError: () => {
      toast.error('Erreur lors du signalement');
    },
  });

  const resetForm = () => {
    setProblemType('CRASH');
    setDescription('');
    setBlockFutureBookings(true);
    setPhotoFile(null);
  };

  const handlePhotoCapture = () => {
    // In a real implementation, this would open camera or file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setPhotoFile(file);
        toast.success('Photo ajoutée');
      }
    };
    input.click();
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('Veuillez décrire le problème');
      return;
    }

    if (description.length < 10) {
      toast.error('La description doit contenir au moins 10 caractères');
      return;
    }

    reportMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full">
        {/* Header */}
        <div className="bg-yamaha-red text-white p-6 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Signaler un problème</h2>
          </div>
          <button
            onClick={onClose}
            className="touch-target hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Motorcycle Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yamaha-blue text-white rounded-full flex items-center justify-center font-bold text-lg">
                {motorcycle.number}
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-lg">
                  {motorcycle.model}
                </div>
                <div className="text-sm text-gray-600">
                  Groupe {motorcycle.group}
                </div>
              </div>
            </div>
          </div>

          {/* Problem Type */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-800 mb-3">
              Type de problème:
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="radio"
                  name="problemType"
                  value="CRASH"
                  checked={problemType === 'CRASH'}
                  onChange={(e) => setProblemType(e.target.value as 'CRASH')}
                  className="w-5 h-5 text-yamaha-red"
                />
                <div>
                  <div className="font-medium text-gray-800">Chute</div>
                  <div className="text-sm text-gray-500">
                    Moto tombée ou accident
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="radio"
                  name="problemType"
                  value="MECHANICAL"
                  checked={problemType === 'MECHANICAL'}
                  onChange={(e) =>
                    setProblemType(e.target.value as 'MECHANICAL')
                  }
                  className="w-5 h-5 text-yamaha-red"
                />
                <div>
                  <div className="font-medium text-gray-800">
                    Panne mécanique
                  </div>
                  <div className="text-sm text-gray-500">
                    Problème moteur, électrique, etc.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="radio"
                  name="problemType"
                  value="OTHER"
                  checked={problemType === 'OTHER'}
                  onChange={(e) => setProblemType(e.target.value as 'OTHER')}
                  className="w-5 h-5 text-yamaha-red"
                />
                <div>
                  <div className="font-medium text-gray-800">Autre</div>
                  <div className="text-sm text-gray-500">
                    Autre type de problème
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-800 mb-2">
              Description:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez en détail le problème rencontré..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yamaha-blue focus:ring-2 focus:ring-yamaha-blue/20 outline-none transition-all resize-none"
            />
            <div className="text-sm text-gray-500 mt-1">
              {description.length} caractères (minimum 10)
            </div>
          </div>

          {/* Photo */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-800 mb-2">
              Photo:
            </label>
            <button
              onClick={handlePhotoCapture}
              className="w-full tablet-button-secondary flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {photoFile ? `Photo: ${photoFile.name}` : 'Prendre une photo'}
            </button>
            {photoFile && (
              <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                ✓ Photo ajoutée ({(photoFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {/* Block Future Bookings */}
          <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={blockFutureBookings}
                onChange={(e) => setBlockFutureBookings(e.target.checked)}
                className="w-5 h-5 text-yamaha-red mt-0.5"
              />
              <div>
                <div className="font-semibold text-gray-800">
                  Bloquer toutes les réservations futures
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Les créneaux suivants de cette moto seront marqués comme
                  indisponibles et les clients concernés recevront un email
                  automatique avec proposition de motos alternatives.
                </div>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 tablet-button-secondary"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={reportMutation.isPending || !description.trim()}
              className="flex-1 tablet-button-danger disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reportMutation.isPending ? 'Signalement...' : 'Signaler'}
            </button>
          </div>

          {/* Warning */}
          {blockFutureBookings && (
            <div className="mt-4 flex items-start gap-2 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Cette action enverra automatiquement des emails aux clients
                ayant réservé cette moto pour les créneaux suivants.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
