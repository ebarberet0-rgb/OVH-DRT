import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Eye, Search, Filter, AlertCircle, TrendingUp } from 'lucide-react';
import { formsApi } from '../lib/api';
import toast from 'react-hot-toast';

export default function DRTTeamReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'overdue'>('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showYearlyReport, setShowYearlyReport] = useState(false);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['drt-team-reports', statusFilter, searchTerm],
    queryFn: () => formsApi.getDRTTeamReports({ status: statusFilter, search: searchTerm }),
  });

  const { data: yearlyReport, isLoading: isLoadingYearlyReport } = useQuery({
    queryKey: ['drt-team-yearly-report'],
    queryFn: () => formsApi.getDRTTeamYearlyReport(),
    enabled: showYearlyReport,
  });

  const handleExportYearlyReport = () => {
    toast.success('Export du rapport annuel en cours...');
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports d'évaluation équipe DRT</h1>
          <p className="text-gray-600 mt-1">
            Évaluation de l'investissement des concessionnaires selon 5 critères
          </p>
        </div>
        <button
          onClick={() => setShowYearlyReport(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yamaha-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          Rapport annuel
        </button>
      </div>

      {/* Scoring Criteria Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Critères d'évaluation (5 critères)</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Traitement des leads</strong>: 100% des leads traités sous 7 jours</li>
          <li>• <strong>Animation</strong>: Transformation en portes ouvertes (food truck, promos, ateliers, pilotes...)</li>
          <li>• <strong>Engagement des équipes</strong>: Mobilisation et performance commerciale</li>
          <li>• <strong>Communication</strong>: Visibilité avant/pendant/après (magasin, ville, réseaux sociaux...)</li>
          <li>• <strong>Satisfaction client</strong>: Évaluations via formulaires post essai</li>
        </ul>
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
              <option value="all">Tous les rapports</option>
              <option value="completed">Complétés</option>
              <option value="pending">En attente</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note totale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rapporteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports?.data?.map((report: any) => {
                  const isOverdue = !report.completed && new Date(report.event.endDate) < new Date();
                  return (
                    <tr key={report.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.event.dealer.name}</div>
                        <div className="text-sm text-gray-500">{report.event.dealer.city}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.event.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.event.endDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.completed ? (
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.completed ? (
                          <span className={`text-2xl font-bold ${getScoreColor(report.totalScore)}`}>
                            {report.totalScore.toFixed(1)}/5
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.completed ? (
                          <div>
                            <div className="font-medium">{report.reporter.firstName} {report.reporter.lastName}</div>
                            <div className="text-gray-500">{new Date(report.createdAt).toLocaleDateString('fr-FR')}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {report.completed && (
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-yamaha-blue hover:text-opacity-80 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Voir
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

      {/* View Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Rapport d'évaluation détaillé</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Event & Dealer Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Concession</h3>
                  <p className="text-sm"><span className="text-gray-500">Nom:</span> <span className="ml-2 font-medium">{selectedReport.event.dealer.name}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Ville:</span> <span className="ml-2">{selectedReport.event.dealer.city}</span></p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Événement</h3>
                  <p className="text-sm"><span className="text-gray-500">Nom:</span> <span className="ml-2">{selectedReport.event.name}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Date:</span> <span className="ml-2">
                    {new Date(selectedReport.event.startDate).toLocaleDateString('fr-FR')} - {new Date(selectedReport.event.endDate).toLocaleDateString('fr-FR')}
                  </span></p>
                </div>
              </div>

              {/* Total Score */}
              <div className="bg-gradient-to-r from-yamaha-blue to-blue-600 rounded-lg p-6 text-white text-center">
                <h3 className="text-lg font-semibold mb-2">Note Totale</h3>
                <p className="text-5xl font-bold">{selectedReport.totalScore.toFixed(2)}/5</p>
              </div>

              {/* Individual Scores */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Détail des critères</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Traitement des leads', value: selectedReport.leadTreatmentScore, key: 'leadTreatment' },
                    { label: 'Animation', value: selectedReport.animationScore, key: 'animation' },
                    { label: 'Engagement des équipes', value: selectedReport.teamEngagementScore, key: 'teamEngagement' },
                    { label: 'Communication', value: selectedReport.communicationScore, key: 'communication' },
                    { label: 'Satisfaction client', value: selectedReport.clientSatisfactionScore, key: 'clientSatisfaction' },
                  ].map((criterion) => (
                    <div key={criterion.key} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{criterion.label}</span>
                        <span className={`text-2xl font-bold ${getScoreColor(criterion.value)}`}>
                          {criterion.value.toFixed(1)}/5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            criterion.value >= 4.5 ? 'bg-green-500' :
                            criterion.value >= 3.5 ? 'bg-blue-500' :
                            criterion.value >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(criterion.value / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Notes détaillées</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Investissement concession</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedReport.dealerInvestmentNotes}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Animations</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedReport.animationNotes}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Ventes et activité commerciale</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedReport.salesNotes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photos */}
              {selectedReport.photoUrls && selectedReport.photoUrls.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Photos</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedReport.photoUrls.map((url: string, index: number) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Reporter Info */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">
                  Rapport complété par <span className="font-medium text-gray-900">
                    {selectedReport.reporter.firstName} {selectedReport.reporter.lastName}
                  </span> le {new Date(selectedReport.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yearly Report Modal */}
      {showYearlyReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Rapport annuel - Classement des concessions</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportYearlyReport}
                  className="flex items-center gap-2 px-4 py-2 bg-yamaha-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
                <button
                  onClick={() => setShowYearlyReport(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              {isLoadingYearlyReport ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yamaha-blue"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rang
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Concession
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Note moyenne
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Événements
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leads
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Animation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Engagement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Communication
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Satisfaction
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {yearlyReport?.data?.rankings?.map((dealer: any, index: number) => (
                        <tr key={dealer.dealerId} className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xl font-bold ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                              index === 2 ? 'text-orange-600' : 'text-gray-600'
                            }`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{dealer.dealerName}</div>
                            <div className="text-sm text-gray-500">{dealer.city}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-2xl font-bold ${getScoreColor(dealer.averageScore)}`}>
                              {dealer.averageScore.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dealer.eventCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={getScoreColor(dealer.avgLeadScore)}>{dealer.avgLeadScore.toFixed(1)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={getScoreColor(dealer.avgAnimationScore)}>{dealer.avgAnimationScore.toFixed(1)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={getScoreColor(dealer.avgEngagementScore)}>{dealer.avgEngagementScore.toFixed(1)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={getScoreColor(dealer.avgCommunicationScore)}>{dealer.avgCommunicationScore.toFixed(1)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={getScoreColor(dealer.avgSatisfactionScore)}>{dealer.avgSatisfactionScore.toFixed(1)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
