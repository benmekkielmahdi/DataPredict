import { BarChart3, TrendingUp, Award, Target, Zap, AlertCircle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

// Helper to safely format numbers
const formatMetric = (val: any) => {
  if (typeof val === 'number') return (val * 100).toFixed(1) + '%';
  return 'N/A';
};

export function Results() {
  const navigate = useNavigate();
  const { state } = useWorkflow();
  const { trainingResults } = state;

  if (!state.datasetId || !trainingResults || !trainingResults.comparison) {
    return (
      <div className="flex flex-col items-center justify-center p-20 h-96 bg-white rounded-xl border border-gray-200 shadow-sm">
        <Award size={48} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-700">Aucun résultat</h3>
        <p className="text-gray-500 mt-2 text-center max-w-sm">
          Vous devez d'abord entraîner un modèle pour voir ses performances détaillées ici.
        </p>
        <button
          onClick={() => navigate('/training')}
          className="mt-6 px-6 py-3 bg-[#1E293B] text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
        >
          Lancer l'entraînement
        </button>
      </div>
    );
  }

  const { bestModel, comparison } = trainingResults;
  const bestMetrics = comparison[bestModel] || {};

  // Determine if task is regression
  const isRegression = bestMetrics['mse'] !== undefined || bestMetrics['r2'] !== undefined;

  // Identify all valid numerical metrics to display
  // Exclude 'accuracy' if it's a regression task
  const metricKeys = Object.keys(bestMetrics).filter(k =>
    typeof bestMetrics[k] === 'number' &&
    k !== 'trainingTime' &&
    (k !== 'accuracy' || !isRegression)
  );



  const getMetricStyles = (key: string) => {
    const styles: Record<string, { label: string, gradient: string, icon: any }> = {
      accuracy: { label: 'Accuracy', gradient: 'from-blue-500 to-cyan-500', icon: Award },
      precision: { label: 'Précision', gradient: 'from-purple-500 to-pink-500', icon: Target },
      recall: { label: 'Rappel', gradient: 'from-green-500 to-emerald-500', icon: Zap },
      f1: { label: 'F1-Score', gradient: 'from-orange-500 to-red-500', icon: BarChart3 },
      r2: { label: 'R² Score', gradient: 'from-indigo-500 to-purple-500', icon: Award },
      mse: { label: 'MSE', gradient: 'from-red-500 to-rose-500', icon: Target },
      mae: { label: 'MAE', gradient: 'from-amber-500 to-orange-500', icon: Zap },
      rmse: { label: 'RMSE', gradient: 'from-teal-500 to-emerald-500', icon: Activity },
    };
    return styles[key.toLowerCase()] || { label: key.toUpperCase(), gradient: 'from-slate-500 to-gray-500', icon: BarChart3 };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animation-fade-in">
      {/* Header Section */}
      <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <h1 className="page-title">Résultats et métriques</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-gray-500 dark:text-slate-400 font-medium">Meilleur modèle :</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full text-sm">
            {bestModel}
          </span>

        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricKeys.slice(0, 4).map((key, index) => {
          const style = getMetricStyles(key);
          const val = bestMetrics[key];
          const Icon = style.icon;
          const displayValue = (val <= 1 && val >= -1 && key !== 'mse' && key !== 'mae')
            ? (val * 100).toFixed(1) + '%'
            : val.toFixed(4);

          return (
            <div
              key={key}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${style.gradient} text-white shadow-lg`}>
                  <Icon size={24} />
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                  Métriques
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-1">{style.label}</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{displayValue}</div>
            </div>
          );
        })}
      </div>



      {/* Comparison Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm mb-8 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Synthèse comparative</h3>
          <div className="text-xs text-gray-400 dark:text-slate-500 font-medium">Tous les modèles entraînés</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-700">
                <th className="text-left p-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Modèle</th>
                {metricKeys.map(k => (
                  <th key={k} className="text-left p-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                    {getMetricStyles(k).label}
                  </th>
                ))}
                <th className="text-left p-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Temps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {Object.entries(comparison).map(([name, m]: [string, any]) => (
                <tr key={name} className={`hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors ${name === bestModel ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      {name}
                      {name === bestModel && (
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase shadow-sm shadow-blue-500/50">
                          Best
                        </span>
                      )}
                    </div>
                  </td>
                  {metricKeys.map(k => {
                    const val = m[k];
                    const formatted = (val <= 1 && val >= -1 && k !== 'mse' && k !== 'mae')
                      ? (val * 100).toFixed(2) + '%'
                      : val.toFixed(4);
                    return (
                      <td key={k} className={`p-4 font-medium ${name === bestModel ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>
                        {formatted}
                      </td>
                    );
                  })}
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{(m.trainingTime || 0).toFixed(2)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <button
          onClick={() => navigate('/visualization')}
          className="btn-secondary"
        >
          <TrendingUp size={20} />
          Visualisation
        </button>
        <button
          onClick={() => navigate('/export')}
          className="btn-primary"
        >
          Exporter le modèle
        </button>
      </div>
    </div>
  );
}
