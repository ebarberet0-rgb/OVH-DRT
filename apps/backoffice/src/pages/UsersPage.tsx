import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, dealersApi } from '@/lib/api';
import {
    Users,
    Search,
    Plus,
    Edit,
    Trash2,
    X,
    Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema for User Form
const userSchema = z.object({
    firstName: z.string().min(2, 'Prénom requis'),
    lastName: z.string().min(2, 'Nom requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'DEALER', 'INSTRUCTOR']),
    dealerId: z.string().optional(),
    password: z.string().min(6, 'Minimum 6 caractères').optional(),
}).refine((data) => {
    if (data.role === 'DEALER' && !data.dealerId) {
        return false;
    }
    return true;
}, {
    message: "Une concession doit être rattachée à un compte concessionnaire",
    path: ["dealerId"],
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<'backend' | 'clients'>('backend');
    const limit = 10;

    // Fetch Users
    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users', activeTab, page, searchTerm],
        queryFn: async () => {
            const roleFilter = activeTab === 'backend'
                ? ['ADMIN', 'DEALER', 'INSTRUCTOR']
                : ['CLIENT'];

            const params: any = {
                page,
                limit,
                roles: roleFilter.join(',')
            };

            // Only add search if it's not empty
            if (searchTerm && searchTerm.trim() !== '') {
                params.search = searchTerm.trim();
            }

            const res = await usersApi.getAll(params);

            return res.data;
        },
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
    });

    // Fetch Dealers (for dropdown)
    const { data: dealers } = useQuery({
        queryKey: ['dealers'],
        queryFn: async () => {
            const res = await dealersApi.getAll();
            return res.data;
        },
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: usersApi.create,
        onSuccess: () => {
            toast.success('Utilisateur créé');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsModalOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la création');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
        onSuccess: () => {
            toast.success('Utilisateur modifié');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsModalOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la modification');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: usersApi.delete,
        onSuccess: () => {
            toast.success('Utilisateur supprimé');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    // Form handling
    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: useMemo(() => {
            return {
                firstName: selectedUser?.firstName || '',
                lastName: selectedUser?.lastName || '',
                email: selectedUser?.email || '',
                phone: selectedUser?.phone || '',
                role: selectedUser?.role || 'INSTRUCTOR',
                dealerId: selectedUser?.dealerId || '',
                password: '',
            }
        }, [selectedUser])
    });

    // Reset form when modal opens with new data
    useMemo(() => {
        form.reset({
            firstName: selectedUser?.firstName || '',
            lastName: selectedUser?.lastName || '',
            email: selectedUser?.email || '',
            phone: selectedUser?.phone || '',
            role: selectedUser?.role || 'INSTRUCTOR',
            dealerId: selectedUser?.dealerId || '',
            password: '',
        });
    }, [selectedUser, isModalOpen]);

    const onSubmit = (data: UserFormData) => {
        if (selectedUser) {
            // Update
            const updateData = { ...data };
            if (!updateData.password) delete updateData.password; // Don't send empty password
            updateMutation.mutate({ id: selectedUser.id, data: updateData });
        } else {
            // Create
            if (!data.password) {
                form.setError('password', { message: 'Mot de passe requis pour la création' });
                return;
            }
            createMutation.mutate(data);
        }
    };

    const watchRole = form.watch('role');

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Users className="mr-3 text-yamaha-blue" size={32} />
                        Utilisateurs
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {activeTab === 'backend'
                            ? 'Gestion des comptes administrateurs, concessionnaires et instructeurs'
                            : 'Liste des clients ayant réservé un essai'}
                    </p>
                </div>
                {activeTab === 'backend' && (
                    <button
                        onClick={handleCreate}
                        className="bg-yamaha-blue text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-900 transition-colors"
                    >
                        <Plus size={20} className="mr-2" />
                        Nouvel utilisateur
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => {
                            setActiveTab('backend');
                            setPage(1);
                            setSearchTerm('');
                            queryClient.invalidateQueries({ queryKey: ['users'] });
                        }}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'backend'
                                ? 'border-yamaha-blue text-yamaha-blue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        Utilisateurs Backend
                        {activeTab === 'backend' && usersData?.meta?.total !== undefined && (
                            <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-yamaha-blue text-white">
                                {usersData.meta.total}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('clients');
                            setPage(1);
                            setSearchTerm('');
                            queryClient.invalidateQueries({ queryKey: ['users'] });
                        }}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'clients'
                                ? 'border-yamaha-blue text-yamaha-blue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        Clients
                        {activeTab === 'clients' && usersData?.meta?.total !== undefined && (
                            <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-yamaha-blue text-white">
                                {usersData.meta.total}
                            </span>
                        )}
                    </button>
                </nav>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Rechercher (nom, email...)"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Total: {usersData?.meta?.total || 0} utilisateurs
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Utilisateur
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rôle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yamaha-blue"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : usersData?.data?.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        ) : (
                            usersData?.data?.map((user: any) => {
                                // Check if user should be in this tab
                                const shouldBeInBackend = ['ADMIN', 'DEALER', 'INSTRUCTOR'].includes(user.role);
                                const shouldBeInClients = user.role === 'CLIENT';
                                const wrongTab = (activeTab === 'backend' && !shouldBeInBackend) || (activeTab === 'clients' && !shouldBeInClients);

                                return (
                                    <tr key={user.id} className={`hover:bg-gray-50 ${wrongTab ? 'bg-red-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                    {user.firstName[0]}
                                                    {user.lastName[0]}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.firstName} {user.lastName}
                                                        {wrongTab && <span className="ml-2 text-xs text-red-600">⚠️ Mauvais onglet!</span>}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.role === 'ADMIN'
                                                        ? 'bg-red-100 text-red-800'
                                                        : user.role === 'DEALER'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : user.role === 'INSTRUCTOR'
                                                                ? 'bg-green-100 text-green-800'
                                                                : user.role === 'CLIENT'
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {activeTab === 'backend' && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                    Précédent
                </button>
                <span className="text-sm text-gray-700">Page {page}</span>
                <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!usersData || !usersData.data || usersData.data.length < limit}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                    Suivant
                </button>
            </div>

            {/* Modal User Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">{selectedUser ? 'Modifier' : 'Créer'} un utilisateur</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                    <input {...form.register('firstName')} className="w-full px-3 py-2 border rounded-lg" />
                                    {form.formState.errors.firstName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.firstName.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input {...form.register('lastName')} className="w-full px-3 py-2 border rounded-lg" />
                                    {form.formState.errors.lastName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.lastName.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" {...form.register('email')} className="w-full px-3 py-2 border rounded-lg" />
                                {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <input {...form.register('phone')} className="w-full px-3 py-2 border rounded-lg" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                    <select {...form.register('role')} className="w-full px-3 py-2 border rounded-lg">
                                        <option value="ADMIN">Administrateur</option>
                                        <option value="INSTRUCTOR">Instructeur</option>
                                        <option value="DEALER">Concessionnaire</option>
                                    </select>
                                </div>
                                {watchRole === 'DEALER' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Concession</label>
                                        <select {...form.register('dealerId')} className="w-full px-3 py-2 border rounded-lg">
                                            <option value="">Sélectionner une concession</option>
                                            {dealers?.map((dealer: any) => (
                                                <option key={dealer.id} value={dealer.id}>{dealer.name} ({dealer.city})</option>
                                            ))}
                                        </select>
                                        {form.formState.errors.dealerId && <p className="text-red-500 text-xs mt-1">{form.formState.errors.dealerId.message}</p>}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe {selectedUser && '(laisser vide pour ne pas changer)'}</label>
                                <input type="password" {...form.register('password')} className="w-full px-3 py-2 border rounded-lg" />
                                {form.formState.errors.password && <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>}
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
