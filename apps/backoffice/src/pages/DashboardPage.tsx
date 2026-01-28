import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/lib/api';
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Bike,
  Award,
  ShoppingCart,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalPotentialTests: number;
  totalReserved: number;
  totalCompleted: number;
  totalCancelled: number;
  totalNoShow: number;
  motorcycleStats: Array<{
    model: string;
    testsCount: number;
  }>;
  licenseStats: {
    A: number;
    A1: number;
    A2: number;
  };
  averageCustomerRating: number;
  averageDealerRating: number;
  totalSales: number;
  yAmtTestsCount: number;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg')}/10`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await statsApi.getDashboard();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yamaha-blue"></div>
      </div>
    );
  }

  const completionRate = stats
    ? ((stats.totalCompleted / stats.totalPotentialTests) * 100).toFixed(1)
    : '0';

  const reservationRate = stats
    ? ((stats.totalReserved / stats.totalPotentialTests) * 100).toFixed(1)
    : '0';

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard - Vue d'ensemble DRT 2026
        </h1>
        <p className="text-gray-600">
          Statistiques globales et indicateurs clés de performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Essais potentiels"
          value={stats?.totalPotentialTests || 0}
          subtitle="Total sur la saison"
          icon={Calendar}
          color="text-blue-600"
        />
        <StatCard
          title="Essais réservés"
          value={stats?.totalReserved || 0}
          subtitle={`${reservationRate}% du total`}
          icon={Users}
          color="text-green-600"
        />
        <StatCard
          title="Essais réalisés"
          value={stats?.totalCompleted || 0}
          subtitle={`${completionRate}% de completion`}
          icon={CheckCircle}
          color="text-yamaha-blue"
        />
        <StatCard
          title="Annulations + No-show"
          value={(stats?.totalCancelled || 0) + (stats?.totalNoShow || 0)}
          subtitle={`${stats?.totalCancelled || 0} annul. / ${stats?.totalNoShow || 0} no-show`}
          icon={XCircle}
          color="text-red-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Essais Y-AMT"
          value={stats?.yAmtTestsCount || 0}
          subtitle="Transmission automatique"
          icon={Bike}
          color="text-purple-600"
        />
        <StatCard
          title="Note moyenne clients"
          value={`${stats?.averageCustomerRating?.toFixed(1) || 0}/5`}
          subtitle="Satisfaction essayeurs"
          icon={Award}
          color="text-yellow-600"
        />
        <StatCard
          title="Note concessionnaires"
          value={`${stats?.averageDealerRating?.toFixed(1) || 0}/5`}
          subtitle="Satisfaction dealers"
          icon={TrendingUp}
          color="text-indigo-600"
        />
        <StatCard
          title="Ventes réalisées"
          value={stats?.totalSales || 0}
          subtitle="Conversions post-essai"
          icon={ShoppingCart}
          color="text-green-600"
        />
      </div>

      {/* License Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Répartition par permis
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-yamaha-blue">
              {stats?.licenseStats?.A || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Permis A</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yamaha-blue">
              {stats?.licenseStats?.A2 || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Permis A2</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yamaha-blue">
              {stats?.licenseStats?.A1 || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Permis A1</p>
          </div>
        </div>
      </div>

      {/* Top Motorcycles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Top modèles essayés
        </h2>
        <div className="space-y-3">
          {stats?.motorcycleStats?.slice(0, 10).map((moto, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-gray-400 w-6">
                  #{index + 1}
                </span>
                <span className="font-medium text-gray-900">{moto.model}</span>
              </div>
              <span className="text-lg font-bold text-yamaha-blue">
                {moto.testsCount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
