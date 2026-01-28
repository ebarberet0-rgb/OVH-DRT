import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  CheckCircle,
  FileText,
  Rocket,
  Flag,
  XCircle,
  Camera,
  User,
  Phone,
  Mail,
  Clock,
  Bike,
} from 'lucide-react';
import { bookingsApi } from '../lib/api';
import type { Booking } from '../types';
import toast from 'react-hot-toast';

interface BookingDetailModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingDetailModal({
  booking,
  isOpen,
  onClose,
}: BookingDetailModalProps) {
  const queryClient = useQueryClient();
  const [bibNumber, setBibNumber] = useState(booking.bibNumber?.toString() || '');

  // Mutations
  const confirmMutation = useMutation({
    mutationFn: () => bookingsApi.confirmPresence(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Présence confirmée');
    },
    onError: () => {
      toast.error('Erreur lors de la confirmation');
    },
  });

  const startMutation = useMutation({
    mutationFn: () => bookingsApi.startRide(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Essai démarré');
      onClose();
    },
    onError: () => {
      toast.error('Erreur lors du démarrage');
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => bookingsApi.completeRide(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Essai terminé');
      onClose();
    },
    onError: () => {
      toast.error('Erreur lors de la finalisation');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancelBooking(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Réservation annulée');
      onClose();
    },
    onError: () => {
      toast.error('Erreur lors de l\'annulation');
    },
  });

  const updateDocumentsMutation = useMutation({
    mutationFn: (data: {
      waiverSigned?: boolean;
      bibNumber?: number;
      licensePhotoUrl?: string;
    }) => bookingsApi.updateDocuments(booking.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Documents mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Get status info
  const getStatusInfo = () => {
    switch (booking.status) {
      case 'RESERVED':
        return {
          label: 'Réservé',
          icon: '⏳',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      case 'CONFIRMED':
        return {
          label: 'Confirmé sur place',
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case 'READY':
        return {
          label: 'Prêt à partir',
          icon: '🏍️',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case 'IN_PROGRESS':
        return {
          label: 'En cours d\'essai',
          icon: '🚀',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        };
      case 'COMPLETED':
        return {
          label: 'Terminé',
          icon: '🏁',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
      case 'CANCELLED':
        return {
          label: 'Annulé',
          icon: '❌',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        };
      default:
        return {
          label: 'Inconnu',
          icon: '❓',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Handle document updates
  const handleWaiverToggle = () => {
    updateDocumentsMutation.mutate({
      waiverSigned: !booking.waiverSigned,
    });
  };

  const handleBibNumberUpdate = () => {
    const number = parseInt(bibNumber);
    if (isNaN(number) || number < 1) {
      toast.error('Numéro de dossard invalide');
      return;
    }
    updateDocumentsMutation.mutate({
      bibNumber: number,
    });
  };

  const handlePhotoCapture = () => {
    // In a real implementation, this would open camera
    toast('Fonctionnalité photo à venir');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-yamaha-blue text-white p-6 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-bold">Détails de la réservation</h2>
          <button
            onClick={onClose}
            className="touch-target hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.color} font-semibold mb-6`}
          >
            <span className="text-xl">{statusInfo.icon}</span>
            <span>{statusInfo.label}</span>
          </div>

          {/* Client Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations client
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">
                  {booking.user.firstName} {booking.user.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {booking.user.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {booking.user.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Bike className="w-5 h-5" />
              Détails de l'essai
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Moto:</span>
                <span className="font-medium">
                  {booking.motorcycle.model} (N°{booking.motorcycle.number})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Créneau:</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {booking.timeSlot}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Groupe:</span>
                <span className="font-medium">
                  Groupe {booking.motorcycle.group}
                </span>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          {booking.status !== 'CANCELLED' &&
            booking.status !== 'COMPLETED' && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </h3>
                <div className="space-y-3">
                  {/* Waiver */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={booking.waiverSigned}
                        onChange={handleWaiverToggle}
                        className="w-5 h-5 text-yamaha-blue rounded"
                      />
                      <span className="text-gray-700">Décharge signée</span>
                    </label>
                    {booking.waiverSigned && (
                      <span className="text-green-600 text-sm">✓ Signé</span>
                    )}
                  </div>

                  {/* License Photo */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Photo du permis</span>
                    <button
                      onClick={handlePhotoCapture}
                      className="tablet-button-secondary flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      {booking.licensePhotoUrl ? 'Voir' : 'Prendre'}
                    </button>
                  </div>

                  {/* Bib Number */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-700">Numéro de dossard</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={bibNumber}
                        onChange={(e) => setBibNumber(e.target.value)}
                        placeholder="N°"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                      />
                      {bibNumber !== booking.bibNumber?.toString() && (
                        <button
                          onClick={handleBibNumberUpdate}
                          className="tablet-button-primary"
                        >
                          OK
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Actions disponibles</h3>

            {/* Confirm Presence */}
            {booking.status === 'RESERVED' && (
              <button
                onClick={() => confirmMutation.mutate()}
                disabled={confirmMutation.isPending}
                className="w-full tablet-button-primary flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirmer la présence
              </button>
            )}

            {/* View/Sign Documents */}
            {(booking.status === 'CONFIRMED' || booking.status === 'READY') && (
              <button
                onClick={() => toast('Formulaire de décharge à implémenter')}
                className="w-full tablet-button bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Voir/Signer les documents
              </button>
            )}

            {/* Start Ride */}
            {(booking.status === 'CONFIRMED' || booking.status === 'READY') && (
              <button
                onClick={() => startMutation.mutate()}
                disabled={
                  startMutation.isPending ||
                  !booking.waiverSigned ||
                  !booking.bibNumber
                }
                className="w-full tablet-button-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Rocket className="w-5 h-5" />
                Démarrer l'essai
              </button>
            )}

            {booking.status === 'CONFIRMED' &&
              (!booking.waiverSigned || !booking.bibNumber) && (
                <p className="text-sm text-orange-600 text-center">
                  ⚠️ Complétez les documents avant de démarrer l'essai
                </p>
              )}

            {/* Complete Ride */}
            {booking.status === 'IN_PROGRESS' && (
              <button
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
                className="w-full tablet-button bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Flag className="w-5 h-5" />
                Terminer l'essai
              </button>
            )}

            {/* Cancel */}
            {booking.status !== 'COMPLETED' &&
              booking.status !== 'CANCELLED' && (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        'Êtes-vous sûr de vouloir annuler cette réservation ?'
                      )
                    ) {
                      cancelMutation.mutate();
                    }
                  }}
                  disabled={cancelMutation.isPending}
                  className="w-full tablet-button-danger flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Annuler la réservation
                </button>
              )}
          </div>

          {/* Timestamps */}
          {(booking.confirmedAt || booking.startedAt || booking.completedAt) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                Historique
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                {booking.confirmedAt && (
                  <div>
                    Confirmé le:{' '}
                    {new Date(booking.confirmedAt).toLocaleString('fr-FR')}
                  </div>
                )}
                {booking.startedAt && (
                  <div>
                    Démarré le:{' '}
                    {new Date(booking.startedAt).toLocaleString('fr-FR')}
                  </div>
                )}
                {booking.completedAt && (
                  <div>
                    Terminé le:{' '}
                    {new Date(booking.completedAt).toLocaleString('fr-FR')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-lg flex justify-end">
          <button onClick={onClose} className="tablet-button-secondary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
