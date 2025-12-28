import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Layers,
  Activity,
  Download,
  ArrowLeft,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

export function Visualization() {
  const navigate = useNavigate();
  const { state: workflowState } = useWorkflow();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  /* New Logic for Dynamic Backend Connection */
  const { id } = useParams();
  const [fetchedResults, setFetchedResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`/api/training/history/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch history");
          return res.json();
        })
        .then(data => {
          // Reconstruct the trainingResults object structure expected by this component
          try {
            const metrics = JSON.parse(data.fullMetrics);
            const results = {
              bestModel: data.modelName,
              comparison: { [data.modelName]: metrics }
            };
            setFetchedResults(results);
          } catch (e) {
            console.error("Error parsing history", e);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const trainingResults = fetchedResults || workflowState.trainingResults || {};
  const bestModel = trainingResults.bestModel;

  const metrics = (trainingResults.comparison && bestModel) ? trainingResults.comparison[bestModel] : {};
  const isRegression = fetchedResults
    ? (!!metrics.mse || !!metrics.r2)
    : (workflowState.featureSelectionResult?.mode?.toLowerCase() === 'regression' || !!metrics.mse);

  const [activeTab, setActiveTab] = useState<'confusion' | 'importance' | 'learning' | 'regression' | 'residuals'>('confusion');

  useEffect(() => {
    if (isRegression) {
      setActiveTab('regression');
    }
  }, [isRegression]);

  const classMetrics = metrics.class_metrics || [];
  const rawMatrix = metrics.confusion_matrix;

  // Process raw confusion matrix if formatted data is missing
  const confusionMatrixData = metrics.confusion_matrix_data || (() => {
    if (!rawMatrix || !Array.isArray(rawMatrix)) return [];

    const size = rawMatrix.length;
    const flattened: any[] = [];

    // Heuristics for binary classification (Size 2x2)
    // Assuming standard sklearn format: [ [TN, FP], [FN, TP] ]
    // Index 0: Negative, Index 1: Positive

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const val = rawMatrix[i][j]; // Row i (True), Col j (Predicted)

        let type = size === 2 ? "" : (i === j ? "Correct" : "Erreur");
        let color = "#cbd5e1"; // Default Gray

        if (size === 2) {
          // Binary Logic
          if (i === 0 && j === 0) { type = "Vrai Négatif"; color = "#64748b"; } // TN
          else if (i === 0 && j === 1) { type = "Faux Positif"; color = "#ef4444"; } // FP
          else if (i === 1 && j === 0) { type = "Faux Négatif"; color = "#f97316"; } // FN
          else if (i === 1 && j === 1) { type = "Vrai Positif"; color = "#22c55e"; } // TP
        } else {
          // Multi-class: Diagonal is Green, others Red/Orange scaled by magnitude could be fancy, but simple for now
          color = i === j ? "#22c55e" : "#ef4444";
        }

        flattened.push({
          value: val,
          predicted: `Classe ${j}`, // Fallback if no labels
          actual: `Classe ${i}`,
          type: type,
          color: color
        });
      }
    }
    return flattened;
  })();

  const matrixSize = rawMatrix ? rawMatrix.length : 2;


  // Enhanced regression data with residuals
  const regressionData = metrics.predictions?.map((p: number, i: number) => ({
    actual: metrics.y_test ? metrics.y_test[i] : i,
    predicted: p,
    residual: metrics.y_test ? p - metrics.y_test[i] : 0,
    index: i,
  })) || [];

  // Calculate residual distribution for histogram
  const calculateResidualDistribution = () => {
    if (regressionData.length === 0) return [];

    const residuals = regressionData.map((d: any) => d.residual);
    const minResidual = Math.min(...residuals);
    const maxResidual = Math.max(...residuals);
    const binCount = 20;
    const binSize = (maxResidual - minResidual) / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => {
      const binStart = minResidual + i * binSize;
      const binEnd = binStart + binSize;
      const count = residuals.filter((r: number) => r >= binStart && r < binEnd).length;
      return {
        bin: binStart.toFixed(2),
        count,
        range: `${binStart.toFixed(2)} à ${binEnd.toFixed(2)}`,
      };
    });

    return bins;
  };

  const residualDistribution = calculateResidualDistribution();

  // Calculate regression metrics
  const calculateRegressionMetrics = () => {
    if (regressionData.length === 0) return null;

    const actual = regressionData.map((d: any) => d.actual);
    const residuals = regressionData.map((d: any) => d.residual);

    const meanActual = actual.reduce((a: number, b: number) => a + b, 0) / actual.length;
    const ssTotal = actual.reduce((sum: number, val: number) => sum + Math.pow(val - meanActual, 2), 0);
    const ssResidual = residuals.reduce((sum: number, val: number) => sum + Math.pow(val, 2), 0);
    const r2Score = 1 - (ssResidual / ssTotal);
    const mse = ssResidual / residuals.length;
    const rmse = Math.sqrt(mse);
    const mae = residuals.reduce((sum: number, val: number) => sum + Math.abs(val), 0) / residuals.length;

    return { r2Score, mse, rmse, mae };
  };

  const regressionMetrics = calculateRegressionMetrics();

  const featureImportanceData = (metrics.feature_importance || []).map((f: any) => ({
    feature: f.feature,
    importance: f.importance
  })).sort((a: any, b: any) => b.importance - a.importance);

  const learningCurveData = metrics.learning_curve || [];

  const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  const tabs = [
    { id: 'confusion', label: 'Matrice de confusion', icon: Target, hidden: isRegression || !metrics.confusion_matrix },
    { id: 'regression', label: 'Prédictions vs Réel', icon: TrendingUp, hidden: !isRegression },
    { id: 'residuals', label: 'Analyse des résidus', icon: Activity, hidden: !isRegression },
    { id: 'importance', label: 'Importance features', icon: Layers, hidden: !metrics.feature_importance },
    { id: 'learning', label: 'Apprentissage', icon: BarChart3, hidden: !metrics.learning_curve },
  ].filter(t => !t.hidden);

  return (
    <div className="p-6 max-w-7xl mx-auto animation-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="page-title">Visualisation des résultats</h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium italic">
            Analyse approfondie pour : <span className="text-blue-600 dark:text-blue-400 font-bold">{bestModel}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/results')}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Retour
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap border-2 ${isActive
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-blue-900/50'
                : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Visualization Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm min-h-[500px]">
        {/* Enhanced Confusion Matrix */}
        {activeTab === 'confusion' && confusionMatrixData.length > 0 && (
          <div className="animation-slide-up space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="text-blue-600" />
                Matrice de confusion détaillée
              </h3>
              <div
                className="grid gap-6 max-w-2xl mx-auto"
                style={{ gridTemplateColumns: `repeat(${matrixSize}, minmax(0, 1fr))` }}
              >
                {confusionMatrixData.map((cell: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative p-10 rounded-2xl border-2 transition-all hover:shadow-lg cursor-pointer"
                    style={{
                      borderColor: cell.color,
                      backgroundColor: isDarkMode ? `${cell.color}15` : `${cell.color}05`
                    }}
                  >
                    <div className="text-center">
                      <div className="text-6xl font-black mb-2" style={{ color: cell.color }}>
                        {cell.value}
                      </div>
                      <div className="text-sm font-bold opacity-60 uppercase tracking-widest mb-1 text-gray-700 dark:text-slate-300">
                        {cell.type}
                      </div>
                      <div className="text-sm font-bold text-gray-600 dark:text-slate-400 mb-1">
                        Prédit: {cell.predicted}
                      </div>
                      <div className="text-xs font-medium text-gray-400 dark:text-slate-500">
                        Réel: {cell.actual}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-Class Metrics */}
            {classMetrics.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Métriques par classe</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classMetrics.map((cm, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                      <h5 className="text-md font-bold text-gray-900 dark:text-white mb-4">{cm.className}</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-slate-400">Précision</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{cm.precision}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-slate-400">Rappel</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{cm.recall}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-slate-400">F1-Score</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{cm.f1Score}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Regression Scatter Plot */}
        {activeTab === 'regression' && regressionData.length > 0 && (
          <div className="animation-slide-up space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Prédictions vs Valeurs Réelles
            </h3>

            {/* Metrics Cards */}
            {regressionMetrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">R² Score</div>
                  <div className="text-2xl font-black text-blue-900 dark:text-blue-100">{regressionMetrics.r2Score.toFixed(4)}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-1">RMSE</div>
                  <div className="text-2xl font-black text-purple-900 dark:text-purple-100">{regressionMetrics.rmse.toFixed(4)}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200 dark:border-green-700">
                  <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-1">MAE</div>
                  <div className="text-2xl font-black text-green-900 dark:text-green-100">{regressionMetrics.mae.toFixed(4)}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                  <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase mb-1">MSE</div>
                  <div className="text-2xl font-black text-orange-900 dark:text-orange-100">{regressionMetrics.mse.toFixed(4)}</div>
                </div>
              </div>
            )}

            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#E2E8F0'} />
                  <XAxis
                    type="number"
                    dataKey="actual"
                    name="Valeur Réelle"
                    stroke={isDarkMode ? '#94A3B8' : '#64748B'}
                    label={{ value: 'Valeurs Réelles', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="predicted"
                    name="Prédiction"
                    stroke={isDarkMode ? '#94A3B8' : '#64748B'}
                    label={{ value: 'Prédictions', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1E293B' : '#fff',
                      border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                      borderRadius: '12px',
                      color: isDarkMode ? '#F8FAFC' : '#1E293B'
                    }}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Legend />
                  <Scatter name="Points de données" data={regressionData} fill="#3B82F6" opacity={0.6} />
                  <Line
                    type="linear"
                    dataKey="actual"
                    data={[
                      { actual: Math.min(...regressionData.map((d: any) => d.actual)), predicted: Math.min(...regressionData.map((d: any) => d.actual)) },
                      { actual: Math.max(...regressionData.map((d: any) => d.actual)), predicted: Math.max(...regressionData.map((d: any) => d.actual)) }
                    ]}
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={false}
                    name="Ligne idéale"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Residuals Analysis */}
        {activeTab === 'residuals' && regressionData.length > 0 && (
          <div className="animation-slide-up space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Graphique des Résidus</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#E2E8F0'} />
                    <XAxis
                      type="number"
                      dataKey="predicted"
                      name="Prédictions"
                      stroke={isDarkMode ? '#94A3B8' : '#64748B'}
                      label={{ value: 'Prédictions', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="residual"
                      name="Résidus"
                      stroke={isDarkMode ? '#94A3B8' : '#64748B'}
                      label={{ value: 'Résidus', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1E293B' : '#fff',
                        border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                        borderRadius: '12px',
                        color: isDarkMode ? '#F8FAFC' : '#1E293B'
                      }}
                      cursor={{ strokeDasharray: '3 3' }}
                    />
                    <Legend />
                    <Scatter name="Résidus" data={regressionData} fill="#EC4899" opacity={0.6} />
                    <Line
                      type="linear"
                      dataKey={() => 0}
                      data={regressionData}
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      name="Ligne zéro"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Residual Distribution */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Distribution des Résidus</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={residualDistribution} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#E2E8F0'} />
                    <XAxis
                      dataKey="bin"
                      stroke={isDarkMode ? '#94A3B8' : '#64748B'}
                      label={{ value: 'Résidus', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                      stroke={isDarkMode ? '#94A3B8' : '#64748B'}
                      label={{ value: 'Fréquence', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1E293B' : '#fff',
                        border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                        borderRadius: '12px',
                        color: isDarkMode ? '#F8FAFC' : '#1E293B'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Nombre d'échantillons" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}


        {/* Feature Importance */}
        {activeTab === 'importance' && featureImportanceData.length > 0 && (
          <div className="animation-slide-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Importance des variables</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureImportanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#E2E8F0'} horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="feature"
                    type="category"
                    width={150}
                    stroke={isDarkMode ? '#94A3B8' : '#64748B'}
                    fontSize={11}
                    fontWeight="bold"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1E293B' : '#fff',
                      border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                      borderRadius: '12px',
                      color: isDarkMode ? '#F8FAFC' : '#1E293B'
                    }}
                  />
                  <Bar dataKey="importance" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Learning Curve */}
        {activeTab === 'learning' && learningCurveData.length > 0 && (
          <div className="animation-slide-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Évolution de l'apprentissage</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={learningCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#E2E8F0'} />
                  <XAxis dataKey="epoch" stroke={isDarkMode ? '#94A3B8' : '#64748B'} />
                  <YAxis stroke={isDarkMode ? '#94A3B8' : '#64748B'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1E293B' : '#fff',
                      border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                      borderRadius: '12px',
                      color: isDarkMode ? '#F8FAFC' : '#1E293B'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="trainLoss" name="Train Loss" stroke="#3B82F6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="valLoss" name="Val Loss" stroke="#EC4899" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tabs.length === 0 && (
          <div className="flex flex-col items-center justify-center p-20 opacity-40">
            <Activity size={64} className="text-gray-400 dark:text-slate-600 mb-4" />
            <p className="text-xl font-bold text-gray-700 dark:text-slate-300">Données visuelles limitées</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Le modèle sélectionné ne fournit pas de graphiques détaillés.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">

        <button
          onClick={() => navigate('/export')}
          className="btn-primary"
        >
          Exporter le modèle gagnant
        </button>
      </div>
    </div>
  );
}
