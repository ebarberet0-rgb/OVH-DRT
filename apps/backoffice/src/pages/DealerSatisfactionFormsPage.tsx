import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Eye, Search, Filter, Mail, AlertCircle } from 'lucide-react';
import { formsApi } from '../lib/api';
import toast from 'react-hot-toast';

export default function DealerSatisfactionFormsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'overdue'>('all');
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: forms, isLoading } = useQuery({
    queryKey: ['dealer-satisfaction-forms', statusFilter, searchTerm],
    queryFn: () => formsApi.getDealerSatisfactionForms({ status: statusFilter, search: searchTerm }),
  });

  const sendReminderMutation = useMutation({
    mutationFn: (eventId: string) => formsApi.sendDealerFormReminder(eventId),
    onSuccess: () => {
      toast.success('Email de rappel envoyé avec succès');
      queryClient.invalidateQueries({ queryKey: ['dealer-satisfaction-forms'] });
    },
    onError: () => {
      toast.error('Erreur lors de l\'envoi de l\'email');
    },
  });

  const handleExport = () => {
    toast.success('Export en cours...');
  };

  const handleSendReminder = (eventId: string, dealerName: string) => {
    if (confirm(`Envoyer un email de rappel à ${dealerName} ?`)) {
      sendReminderMutation.mutate(eventId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formulaires de satisfaction concessionnaires</h1>
          <p className="text-gray-600 mt-1">
            Satisfaction des concessionnaires, auto-déclaration des activités et ventes
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-yamaha-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter les réponses
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par concession, événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
            >
              <option value="all">Tous les formulaires</option>
              <option value="completed">Complétés</option>
              <option value="pending">En attente</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forms List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yamaha-blue"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concession
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Événement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date événement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventes déclarées
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participerait à nouveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forms?.data?.map((form: any) => {
                  const isOverdue = !form.completed && new Date(form.event.endDate) < new Date();
                  return (
                    <tr key={form.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{form.dealer.name}</div>
                        <div className="text-sm text-gray-500">{form.dealer.city}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {form.event.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(form.event.endDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {form.completed ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Complété
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            En retard
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {form.completed ? (
                          <span className="font-semibold text-yamaha-blue">{form.salesCount} ventes</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {form.completed ? (
                          form.wouldParticipateAgain ? (
                            <span className="text-green-600 font-semibold">✓ Oui</span>
                          ) : (
                            <span className="text-red-600 font-semibold">✗ Non</span>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {form.completed ? (
                          <button
                            onClick={() => setSelectedForm(form)}
                            className="text-yamaha-blue hover:text-opacity-80 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Voir
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSendReminder(form.eventId, form.dealer.name)}
                            className="text-yamaha-red hover:text-opacity-80 flex items-center gap-1"
                            disabled={sendReminderMutation.isPending}
                          >
                            <Mail className="w-4 h-4" />
                            Relancer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Détails du formulaire</h2>
              <button
                onClick={() => setSelectedForm(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Dealer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Informations concession</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nom:</span>
                    <span className="ml-2 font-medium">{selectedForm.dealer.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ville:</span>
                    <span className="ml-2 font-medium">{selectedForm.dealer.city}</span>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Événement</h3>
                <div className="text-sm">
                  <p><span className="text-gray-500">Nom:</span> <span className="ml-2">{selectedForm.event.name}</span></p>
                  <p><span className="text-gray-500">Date:</span> <span className="ml-2">
                    {new Date(selectedForm.event.startDate).toLocaleDateString('fr-FR')} - {new Date(selectedForm.event.endDate).toLocaleDateString('fr-FR')}
                  </span></p>
                </div>
              </div>

              {/* Ratings */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Évaluations</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Organisation', value: selectedForm.organizationRating },
                    { label: 'Équipe DRT', value: selectedForm.teamRating },
                  ].map((rating) => (
                    <div key={rating.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{rating.label}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-xl ${
                              star <= rating.value ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-2 text-sm font-semibold">{rating.value}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Self-declarations */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Auto-déclarations</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Animations proposées</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedForm.animationsDescription}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Promotions offertes</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedForm.promotionsOffered}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Ventes réalisées</h4>
                    <p className="text-2xl font-bold text-yamaha-blue">{selectedForm.salesCount} ventes</p>
                  </div>
                </div>
              </div>

              {/* Future Participation */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Participation future</h3>
                <p className="text-sm">
                  <span className="text-gray-500">Participerait à nouveau:</span>
                  <span className={`ml-2 font-semibold ${
                    selectedForm.wouldParticipateAgain ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedForm.wouldParticipateAgain ? '✓ Oui' : '✗ Non'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
