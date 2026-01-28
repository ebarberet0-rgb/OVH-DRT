import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Eye, Search, Filter } from 'lucide-react';
import { formsApi } from '../lib/api';
import toast from 'react-hot-toast';

export default function CustomerSatisfactionFormsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedForm, setSelectedForm] = useState<any>(null);

  const { data: forms, isLoading } = useQuery({
    queryKey: ['customer-satisfaction-forms', statusFilter, searchTerm],
    queryFn: () => formsApi.getClientSatisfactionForms({ status: statusFilter, search: searchTerm }),
  });

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.success('Export en cours...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formulaires de satisfaction clients</h1>
          <p className="text-gray-600 mt-1">
            Consultez et téléchargez les réponses des clients après leurs essais
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
              placeholder="Rechercher par nom, email, événement..."
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
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Événement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Moto testée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note globale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intention d'achat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forms?.data?.map((form: any) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {form.user.firstName} {form.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{form.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{form.event.name}</div>
                      <div className="text-sm text-gray-500">{form.event.dealer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {form.booking.motorcycle.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-yamaha-blue">{form.overallRating}</span>
                        <span className="text-gray-400 ml-1">/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          form.purchaseIntent === 'YES'
                            ? 'bg-green-100 text-green-800'
                            : form.purchaseIntent === 'MAYBE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {form.purchaseIntent === 'YES' ? 'Oui' : form.purchaseIntent === 'MAYBE' ? 'Peut-être' : 'Non'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(form.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedForm(form)}
                        className="text-yamaha-blue hover:text-opacity-80 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              {/* Client Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Informations client</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nom:</span>
                    <span className="ml-2 font-medium">
                      {selectedForm.user.firstName} {selectedForm.user.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium">{selectedForm.user.email}</span>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Événement</h3>
                <div className="text-sm">
                  <p><span className="text-gray-500">Nom:</span> <span className="ml-2">{selectedForm.event.name}</span></p>
                  <p><span className="text-gray-500">Concession:</span> <span className="ml-2">{selectedForm.event.dealer.name}</span></p>
                  <p><span className="text-gray-500">Moto testée:</span> <span className="ml-2">{selectedForm.booking.motorcycle.model}</span></p>
                </div>
              </div>

              {/* Ratings */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Évaluations</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Note globale', value: selectedForm.overallRating },
                    { label: 'Moto', value: selectedForm.motorcycleRating },
                    { label: 'Instructeur', value: selectedForm.instructorRating },
                    { label: 'Organisation', value: selectedForm.organizationRating },
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

              {/* Purchase Intent */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Intention d'achat</h3>
                <div className="text-sm">
                  <p>
                    <span className="text-gray-500">Intérêt:</span>
                    <span className={`ml-2 font-semibold ${
                      selectedForm.purchaseIntent === 'YES' ? 'text-green-600' :
                      selectedForm.purchaseIntent === 'MAYBE' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedForm.purchaseIntent === 'YES' ? 'Oui' :
                       selectedForm.purchaseIntent === 'MAYBE' ? 'Peut-être' : 'Non'}
                    </span>
                  </p>
                  {selectedForm.purchaseTimeframe && (
                    <p className="mt-1">
                      <span className="text-gray-500">Délai:</span>
                      <span className="ml-2">{selectedForm.purchaseTimeframe}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Comments */}
              {selectedForm.comments && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Commentaires</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedForm.comments}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
