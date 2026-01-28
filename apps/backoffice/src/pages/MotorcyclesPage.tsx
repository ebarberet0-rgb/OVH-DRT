import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motorcyclesApi, uploadApi } from '@/lib/api';
import {
    Bike,
    Plus,
    Edit,
    Trash2,
    AlertTriangle,
    CheckCircle,
    XCircle,
    X,
    Loader2,
    Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const motorcycleSchema = z.object({
    model: z.string().min(2, 'Modèle requis'),
    plateNumber: z.string().min(2, 'Immatriculation requise'),
    group: z.enum(['GROUP_1', 'GROUP_2']),
    status: z.enum(['AVAILABLE', 'MAINTENANCE', 'DAMAGED']),
    isYAMT: z.boolean(),
    imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
});

type MotorcycleFormData = z.infer<typeof motorcycleSchema>;

export default function MotorcyclesPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMoto, setSelectedMoto] = useState<any>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: motorcycles, isLoading } = useQuery({
        queryKey: ['motorcycles'],
        queryFn: async () => {
            const res = await motorcyclesApi.getAll();
            return res.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: motorcyclesApi.create,
        onSuccess: () => {
            toast.success('Moto ajoutée');
            queryClient.invalidateQueries({ queryKey: ['motorcycles'] });
            setIsModalOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => motorcyclesApi.update(id, data),
        onSuccess: () => {
            toast.success('Moto modifiée');
            queryClient.invalidateQueries({ queryKey: ['motorcycles'] });
            setIsModalOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la modification');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: motorcyclesApi.delete,
        onSuccess: () => {
            toast.success('Moto supprimée');
            queryClient.invalidateQueries({ queryKey: ['motorcycles'] });
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette moto ?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (moto: any) => {
        setSelectedMoto(moto);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedMoto(null);
        setIsModalOpen(true);
    };

    const form = useForm<MotorcycleFormData>({
        resolver: zodResolver(motorcycleSchema),
        defaultValues: useMemo(() => {
            return {
                model: selectedMoto?.model || '',
                plateNumber: selectedMoto?.plateNumber || '',
                group: selectedMoto?.group || 'GROUP_1',
                status: selectedMoto?.status || 'AVAILABLE',
                isYAMT: selectedMoto?.isYAMT || false,
                imageUrl: selectedMoto?.imageUrl || '',
            }
        }, [selectedMoto])
    });

    // Reset form when modal opens
    useMemo(() => {
        form.reset({
            model: selectedMoto?.model || '',
            plateNumber: selectedMoto?.plateNumber || '',
            group: selectedMoto?.group || 'GROUP_1',
            status: selectedMoto?.status || 'AVAILABLE',
            isYAMT: selectedMoto?.isYAMT || false,
            imageUrl: selectedMoto?.imageUrl || '',
        });
        setImagePreview(selectedMoto?.imageUrl || null);
    }, [selectedMoto, isModalOpen]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            toast.error('Veuillez sélectionner une image');
            return;
        }

        // Vérifier la taille (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('L\'image ne doit pas dépasser 5MB');
            return;
        }

        try {
            setUploadingImage(true);

            // Upload l'image
            const response = await uploadApi.uploadMotorcycleImage(file);
            const imageUrl = `${import.meta.env.VITE_API_URL}${response.data.imageUrl}`;

            // Mettre à jour le formulaire
            form.setValue('imageUrl', imageUrl);

            // Prévisualisation
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            toast.success('Image uploadée avec succès!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'upload');
        } finally {
            setUploadingImage(false);
        }
    };

    const onSubmit = (data: MotorcycleFormData) => {
        if (selectedMoto) {
            updateMutation.mutate({ id: selectedMoto.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Bike className="mr-3 text-yamaha-blue" size={32} />
                        Gestion de la flotte
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Parc de motos disponibles pour le Demo Ride Tour
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-yamaha-blue text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-900 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Ajouter une moto
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modèle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Immatriculation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groupe</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Y-AMT</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yamaha-blue"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            motorcycles?.map((moto: any) => (
                                <tr key={moto.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        <div className="flex items-center">
                                            <img src={moto.imageUrl || 'https://placehold.co/40x40'} className="w-10 h-10 rounded object-cover mr-3 bg-gray-100" />
                                            {moto.model}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{moto.plateNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${moto.group === 'GROUP_1' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                            {moto.group}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {moto.status === 'AVAILABLE' && <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-1" /> Disponible</span>}
                                        {moto.status === 'MAINTENANCE' && <span className="flex items-center text-orange-600"><AlertTriangle size={16} className="mr-1" /> Maintenance</span>}
                                        {moto.status === 'DAMAGED' && <span className="flex items-center text-red-600"><XCircle size={16} className="mr-1" /> Accidentée</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {moto.isYAMT ? 'Oui' : 'Non'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(moto)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(moto.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Moto Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">{selectedMoto ? 'Modifier' : 'Ajouter'} une moto</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                                <input {...form.register('model')} className="w-full px-3 py-2 border rounded-lg" placeholder="ex: MT-07" />
                                {form.formState.errors.model && <p className="text-red-500 text-xs mt-1">{form.formState.errors.model.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Immatriculation</label>
                                <input {...form.register('plateNumber')} className="w-full px-3 py-2 border rounded-lg" />
                                {form.formState.errors.plateNumber && <p className="text-red-500 text-xs mt-1">{form.formState.errors.plateNumber.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Groupe</label>
                                    <select {...form.register('group')} className="w-full px-3 py-2 border rounded-lg">
                                        <option value="GROUP_1">Groupe 1 (Route)</option>
                                        <option value="GROUP_2">Groupe 2 (Sport/Adv)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                    <select {...form.register('status')} className="w-full px-3 py-2 border rounded-lg">
                                        <option value="AVAILABLE">Disponible</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                        <option value="DAMAGED">Accidentée</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="isYAMT" {...form.register('isYAMT')} className="h-4 w-4 text-yamaha-blue border-gray-300 rounded" />
                                <label htmlFor="isYAMT" className="text-sm text-gray-700">Modèle Y-AMT (Automatique)</label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Photo de la moto</label>

                                {/* Prévisualisation */}
                                {imagePreview && (
                                    <div className="mb-3">
                                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
                                    </div>
                                )}

                                {/* Bouton upload */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-yamaha-blue hover:bg-blue-50 transition-colors disabled:opacity-50"
                                >
                                    {uploadingImage ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" size={20} />
                                            Upload en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2" size={20} />
                                            {imagePreview ? 'Changer la photo' : 'Ajouter une photo'}
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 mt-1">JPG, PNG ou WEBP. Max 5MB.</p>

                                {/* Champ caché pour stocker l'URL */}
                                <input type="hidden" {...form.register('imageUrl')} />
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
