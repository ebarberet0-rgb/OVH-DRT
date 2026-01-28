import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealersApi } from '@/lib/api';
import {
    Store,
    Plus,
    Edit,
    Trash2,
    Search,
    Globe,
    Phone,
    X,
    Loader2,
    MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const dealerSchema = z.object({
    name: z.string().min(2, 'Nom requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(10, 'Téléphone invalide'),
    address: z.string().min(5, 'Adresse requise'),
    city: z.string().min(2, 'Ville requise'),
    postalCode: z.string().min(5, 'Code postal requis'),
    region: z.string().min(2, 'Région requise'),
    latitude: z.preprocess((val) => (typeof val === 'number' && isNaN(val) ? undefined : val), z.number().optional()),
    longitude: z.preprocess((val) => (typeof val === 'number' && isNaN(val) ? undefined : val), z.number().optional()),
    winteamUrl: z.string().url('URL invalide').optional().or(z.literal('')),
});

type DealerFormData = z.infer<typeof dealerSchema>;

export default function DealersPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDealer, setSelectedDealer] = useState<any>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);

    const { data: dealers, isLoading } = useQuery({
        queryKey: ['dealers'],
        queryFn: async () => {
            const res = await dealersApi.getAll();
            return res.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: dealersApi.create,
        onSuccess: () => {
            toast.success('Concession créée');
            queryClient.invalidateQueries({ queryKey: ['dealers'] });
            setIsModalOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la création');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => dealersApi.update(id, data),
        onSuccess: () => {
            toast.success('Concession modifiée');
            queryClient.invalidateQueries({ queryKey: ['dealers'] });
            setIsModalOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la modification');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: dealersApi.delete,
        onSuccess: () => {
            toast.success('Concession supprimée');
            queryClient.invalidateQueries({ queryKey: ['dealers'] });
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette concession ?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (dealer: any) => {
        setSelectedDealer(dealer);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedDealer(null);
        setIsModalOpen(true);
    };

    const form = useForm<DealerFormData>({
        resolver: zodResolver(dealerSchema),
        defaultValues: useMemo(() => {
            return {
                name: selectedDealer?.name || '',
                email: selectedDealer?.email || '',
                phone: selectedDealer?.phone || '',
                address: selectedDealer?.address || '',
                city: selectedDealer?.city || '',
                postalCode: selectedDealer?.postalCode || '',
                region: selectedDealer?.region || '',
                latitude: selectedDealer?.latitude || '',
                longitude: selectedDealer?.longitude || '',
                winteamUrl: selectedDealer?.winteamUrl || '',
            }
        }, [selectedDealer])
    });

    // Reset form when modal opens/changes
    useMemo(() => {
        form.reset({
            name: selectedDealer?.name || '',
            email: selectedDealer?.email || '',
            phone: selectedDealer?.phone || '',
            address: selectedDealer?.address || '',
            city: selectedDealer?.city || '',
            postalCode: selectedDealer?.postalCode || '',
            region: selectedDealer?.region || '',
            latitude: selectedDealer?.latitude || '',
            longitude: selectedDealer?.longitude || '',
            winteamUrl: selectedDealer?.winteamUrl || '',
        });
    }, [selectedDealer, isModalOpen]);


    const onSubmit = (data: DealerFormData) => {
        if (selectedDealer) {
            updateMutation.mutate({ id: selectedDealer.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const geocodeAddress = async () => {
        const address = form.getValues('address');
        const city = form.getValues('city');
        const postalCode = form.getValues('postalCode');

        if (!address || !city || !postalCode) {
            toast.error('Veuillez remplir l\'adresse, la ville et le code postal');
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

    const filteredDealers = dealers?.filter((dealer: any) =>
        dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Store className="mr-3 text-yamaha-blue" size={32} />
                        Gestion des concessions
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Réseau de concessionnaires Yamaha partenaires
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-yamaha-blue text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-900 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Ajouter une concession
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 max-w-md">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, ville..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concession</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winteam</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yamaha-blue"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredDealers?.map((dealer: any) => (
                                <tr key={dealer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{dealer.name}</div>
                                        <div className="text-sm text-gray-500">{dealer.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Phone size={14} className="mr-1" /> {dealer.phone}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{dealer.city} ({dealer.postalCode})</div>
                                        <div className="text-xs text-gray-500">{dealer.region}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                                        {dealer.winteamUrl && (
                                            <a href={dealer.winteamUrl} target="_blank" rel="noreferrer" className="flex items-center">
                                                <Globe size={14} className="mr-1" /> Lien
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(dealer)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(dealer.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Dealer Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">{selectedDealer ? 'Modifier' : 'Ajouter'} une concession</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la concession</label>
                                    <input {...form.register('name')} className="w-full px-3 py-2 border rounded-lg" placeholder="ex: Yamaha Lyon" />
                                    {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input {...form.register('email')} className="w-full px-3 py-2 border rounded-lg" placeholder="contact@..." />
                                    {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                                    <input {...form.register('region')} className="w-full px-3 py-2 border rounded-lg" />
                                    {form.formState.errors.region && <p className="text-red-500 text-xs mt-1">{form.formState.errors.region.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lien Winteam</label>
                                    <input {...form.register('winteamUrl')} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
                                    {form.formState.errors.winteamUrl && <p className="text-red-500 text-xs mt-1">{form.formState.errors.winteamUrl.message}</p>}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Coordonnées GPS</label>
                                    <button
                                        type="button"
                                        onClick={geocodeAddress}
                                        disabled={isGeocoding}
                                        className="flex items-center text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGeocoding ? (
                                            <>
                                                <Loader2 className="animate-spin mr-1" size={12} />
                                                Recherche...
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="mr-1" size={12} />
                                                Calculer automatiquement
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                                        <input type="number" step="any" {...form.register('latitude', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" placeholder="ex: 48.8566" />
                                        {form.formState.errors.latitude && <p className="text-red-500 text-xs mt-1">{form.formState.errors.latitude.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                                        <input type="number" step="any" {...form.register('longitude', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" placeholder="ex: 2.3522" />
                                        {form.formState.errors.longitude && <p className="text-red-500 text-xs mt-1">{form.formState.errors.longitude.message}</p>}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    💡 Remplissez d'abord l'adresse, puis cliquez sur "Calculer automatiquement"
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <input {...form.register('phone')} className="w-full px-3 py-2 border rounded-lg" />
                                {form.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>}
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                                    <input {...form.register('region')} className="w-full px-3 py-2 border rounded-lg" />
                                    {form.formState.errors.region && <p className="text-red-500 text-xs mt-1">{form.formState.errors.region.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lien Winteam</label>
                                    <input {...form.register('winteamUrl')} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
                                    {form.formState.errors.winteamUrl && <p className="text-red-500 text-xs mt-1">{form.formState.errors.winteamUrl.message}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Annuler</button>
                                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-yamaha-blue text-white rounded hover:bg-blue-900 flex items-center">
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin mr-2" size={16} />}
                                    Sauvegarder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
