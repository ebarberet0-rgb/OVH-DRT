import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, usersApi, eventsApi } from '../lib/api';
import type { Motorcycle } from '../types';
import toast from 'react-hot-toast';
import { X, User, Phone, Mail, Save, FileText, Search, Users } from 'lucide-react';

interface WalkInBookingModalProps {
    eventId: string;
    motorcycle: Motorcycle;
    timeSlot: string;
    date: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function WalkInBookingModal({
    eventId,
    motorcycle,
    timeSlot,
    date,
    isOpen,
    onClose,
}: WalkInBookingModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseType: 'A',
    });

    /* New state for user search */
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Search users effect
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 2) {
            setIsSearching(true);
            usersApi.search(value)
                .then((res: any) => {
                    setSearchResults(res.data.data || []);
                })
                .catch(() => setSearchResults([]))
                .finally(() => setIsSearching(false));
        } else {
            setSearchResults([]);
        }
    };

    // Fetch unique participants for this event
    const { data: existingParticipants } = useQuery({
        queryKey: ['event-participants', eventId],
        queryFn: async () => {
            // Fetch all bookings for the event (no date filter) to get ALL participants
            const res = await eventsApi.getEventBookings(eventId);
            // Deduplicate users by ID
            const uniqueUsers = new Map();
            res.data.forEach(booking => {
                if (booking.user && !uniqueUsers.has(booking.user.id)) {
                    uniqueUsers.set(booking.user.id, booking.user);
                }
            });
            return Array.from(uniqueUsers.values());
        }
    });

    const handleParticipantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        if (!userId) return;
        const user = existingParticipants?.find((u: any) => u.id === userId);
        if (user) selectUser(user);
    };

    const selectUser = (user: any) => {
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            licenseType: user.licenseType || 'A',
        });
        setSearchTerm('');
        setSearchResults([]);
    };

    const createMutation = useMutation({
        mutationFn: (data: any) => bookingsApi.createWalkIn(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success('Réservation créée avec succès');
            onClose();
            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                licenseType: 'A',
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la réservation');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.email) {
            toast.error('Veuillez remplir les champs obligatoires');
            return;
        }

        createMutation.mutate({
            eventId,
            motorcycleId: motorcycle.id,
            timeSlot,
            date,
            ...formData,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-yamaha-blue text-white p-6 rounded-t-lg flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Nouvelle Réservation</h2>
                        <p className="text-blue-100 text-sm mt-1">
                            {motorcycle.model} • {timeSlot}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="touch-target hover:bg-white/10 rounded-lg transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 pb-0">
                    {/* Quick Select Participants */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sélection rapide (Clients inscrits à cet événement)
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value=""
                                onChange={handleParticipantSelect}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yamaha-blue appearance-none"
                                disabled={!existingParticipants || existingParticipants.length === 0}
                            >
                                <option value="">
                                    {!existingParticipants
                                        ? 'Chargement...'
                                        : existingParticipants.length === 0
                                            ? 'Aucun client inscrit pour le moment'
                                            : '-- Choisir un participant --'}
                                </option>
                                {existingParticipants?.map((u: any) => (
                                    <option key={u.id} value={u.id}>
                                        {u.firstName} {u.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* User Search Bar */}
                    <div className="mb-6 relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rechercher un client existant (Base de données)
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue"
                                placeholder="Nom, email..."
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin h-4 w-4 border-2 border-yamaha-blue border-t-transparent rounded-full"></div>
                                </div>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => selectUser(user)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-0 transition-colors"
                                    >
                                        <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                        {user._count?.bookings > 0 && (
                                            <div className="text-xs text-blue-600 mt-0.5">
                                                {user._count.bookings} réservation(s) précédente(s)
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 my-4"></div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prénom *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, firstName: e.target.value })
                                    }
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Jean"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({ ...formData, lastName: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Dupont"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="jean.dupont@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Téléphone
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="06 12 34 56 78"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type de permis
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={formData.licenseType}
                                onChange={(e) =>
                                    setFormData({ ...formData, licenseType: e.target.value })
                                }
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white"
                            >
                                <option value="A">Permis A (Toutes motos)</option>
                                <option value="A2">Permis A2 (Bridé)</option>
                                <option value="A1">Permis A1 (125cc)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="px-6 py-2 bg-yamaha-blue text-white rounded-lg hover:bg-blue-900 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {createMutation.isPending ? 'Création...' : 'Valider'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
