import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { emailsApi, usersApi } from '@/lib/api';
import { Mail, Send, Users as UsersIcon, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmailsPage() {
    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedUserType, setSelectedUserType] = useState<'all' | 'clients' | 'backend'>('clients');

    // Récupérer tous les clients pour l'envoi groupé
    const { data: clientsData } = useQuery({
        queryKey: ['users', 'CLIENT'],
        queryFn: async () => {
            const res = await usersApi.getAll({ roles: 'CLIENT', limit: 1000 });
            return res.data;
        },
        enabled: activeTab === 'bulk',
    });

    // Récupérer tous les utilisateurs backend
    const { data: backendData } = useQuery({
        queryKey: ['users', 'BACKEND'],
        queryFn: async () => {
            const res = await usersApi.getAll({ roles: 'ADMIN,DEALER,INSTRUCTOR', limit: 1000 });
            return res.data;
        },
        enabled: activeTab === 'bulk' && selectedUserType === 'backend',
    });

    // Mutation pour envoyer un email unique
    const sendMutation = useMutation({
        mutationFn: (data: { to: string; subject: string; message: string }) =>
            emailsApi.send(data),
        onSuccess: () => {
            toast.success('Email envoyé avec succès !');
            setTo('');
            setSubject('');
            setMessage('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
        },
    });

    // Mutation pour envoyer des emails en masse
    const sendBulkMutation = useMutation({
        mutationFn: (data: { recipients: string[]; subject: string; message: string }) =>
            emailsApi.sendBulk(data),
        onSuccess: (response) => {
            toast.success(response.data.message);
            setSubject('');
            setMessage('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi des emails');
        },
    });

    // Mutation pour vérifier la configuration
    const verifyMutation = useMutation({
        mutationFn: () => emailsApi.verifyConnection(),
        onSuccess: (response) => {
            if (response.data.success) {
                toast.success('Configuration email valide ✓');
            } else {
                toast.error('Configuration email invalide. Vérifiez vos paramètres SMTP.');
            }
        },
        onError: () => {
            toast.error('Erreur lors de la vérification de la configuration');
        },
    });

    const handleSendSingle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!to || !subject || !message) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }
        sendMutation.mutate({ to, subject, message });
    };

    const handleSendBulk = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        let recipients: string[] = [];

        if (selectedUserType === 'clients') {
            recipients = clientsData?.data?.map((u: any) => u.email) || [];
        } else if (selectedUserType === 'backend') {
            recipients = backendData?.data?.map((u: any) => u.email) || [];
        } else {
            // Tous les utilisateurs
            const allClients = clientsData?.data?.map((u: any) => u.email) || [];
            const allBackend = backendData?.data?.map((u: any) => u.email) || [];
            recipients = [...allClients, ...allBackend];
        }

        if (recipients.length === 0) {
            toast.error('Aucun destinataire trouvé');
            return;
        }

        if (confirm(`Envoyer l'email à ${recipients.length} destinataires ?`)) {
            sendBulkMutation.mutate({ recipients, subject, message });
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Mail className="mr-3 text-yamaha-blue" size={32} />
                        Envoi d'emails
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Envoyer des emails aux clients et utilisateurs
                    </p>
                </div>
                <button
                    onClick={() => verifyMutation.mutate()}
                    disabled={verifyMutation.isPending}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-200 transition-colors"
                >
                    {verifyMutation.isPending ? (
                        <Loader2 className="animate-spin mr-2" size={20} />
                    ) : (
                        <CheckCircle size={20} className="mr-2" />
                    )}
                    Vérifier configuration
                </button>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('single')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'single'
                                ? 'border-yamaha-blue text-yamaha-blue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        <Mail className="inline mr-2" size={18} />
                        Email unique
                    </button>
                    <button
                        onClick={() => setActiveTab('bulk')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'bulk'
                                ? 'border-yamaha-blue text-yamaha-blue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        <UsersIcon className="inline mr-2" size={18} />
                        Envoi groupé
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow p-6">
                {activeTab === 'single' ? (
                    <form onSubmit={handleSendSingle} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Destinataire
                            </label>
                            <input
                                type="email"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent outline-none"
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sujet
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent outline-none"
                                placeholder="Sujet de l'email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Message (HTML accepté)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent outline-none"
                                rows={10}
                                placeholder="Contenu de l'email..."
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Vous pouvez utiliser du HTML pour formater le message
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={sendMutation.isPending}
                            className="w-full bg-yamaha-blue text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-blue-900 transition-colors disabled:opacity-50"
                        >
                            {sendMutation.isPending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Send size={20} className="mr-2" />
                                    Envoyer l'email
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSendBulk} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Destinataires
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="clients"
                                        checked={selectedUserType === 'clients'}
                                        onChange={(e) => setSelectedUserType(e.target.value as any)}
                                        className="mr-2"
                                    />
                                    <span>Tous les clients ({clientsData?.meta?.total || 0})</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="backend"
                                        checked={selectedUserType === 'backend'}
                                        onChange={(e) => setSelectedUserType(e.target.value as any)}
                                        className="mr-2"
                                    />
                                    <span>Utilisateurs backend ({backendData?.meta?.total || 0})</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="all"
                                        checked={selectedUserType === 'all'}
                                        onChange={(e) => setSelectedUserType(e.target.value as any)}
                                        className="mr-2"
                                    />
                                    <span>Tous les utilisateurs</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sujet
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent outline-none"
                                placeholder="Sujet de l'email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Message (HTML accepté)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent outline-none"
                                rows={10}
                                placeholder="Contenu de l'email..."
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Vous pouvez utiliser du HTML pour formater le message
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={sendBulkMutation.isPending}
                            className="w-full bg-yamaha-blue text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-blue-900 transition-colors disabled:opacity-50"
                        >
                            {sendBulkMutation.isPending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Send size={20} className="mr-2" />
                                    Envoyer aux destinataires sélectionnés
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>

            {/* Info box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Configuration SMTP</h3>
                <p className="text-sm text-blue-800">
                    Pour utiliser cette fonctionnalité, assurez-vous d'avoir configuré les variables d'environnement SMTP dans le fichier <code className="bg-blue-100 px-1 rounded">.env</code> :
                </p>
                <ul className="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
                    <li><code className="bg-blue-100 px-1 rounded">SMTP_HOST</code> - Serveur SMTP</li>
                    <li><code className="bg-blue-100 px-1 rounded">SMTP_PORT</code> - Port (587 ou 465)</li>
                    <li><code className="bg-blue-100 px-1 rounded">SMTP_USER</code> - Identifiant</li>
                    <li><code className="bg-blue-100 px-1 rounded">SMTP_PASS</code> - Mot de passe</li>
                    <li><code className="bg-blue-100 px-1 rounded">EMAIL_FROM</code> - Expéditeur</li>
                </ul>
            </div>
        </div>
    );
}
