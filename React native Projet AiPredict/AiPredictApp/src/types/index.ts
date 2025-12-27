import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Login: undefined;
    Main: undefined; // Tab Navigator
    DatasetDetail: { datasetId: string; title: string; type: 'Classification' | 'Regression' };
    TrainingDetail: { training: TrainingHistory };
};

export type TabParamList = {
    Dashboard: undefined;
    Notifications: undefined;
};

export type Dataset = {
    id: string;
    name: string;
    type: 'Classification' | 'Regression';
    date: string;
    status: 'Completed' | 'Processing';
    accuracy?: number;
};

export type TrainingHistory = {
    id: string;
    datasetName: string;
    modelName: string;
    date: string;
    type: 'CLASSIFICATION' | 'REGRESSION';
    status: 'success' | 'failed';
    description?: string;
    trainingTime?: string;

    // Classification metrics
    accuracy?: number;
    precisionMetric?: number;
    recall?: number;
    f1Score?: number;
    fullMetrics?: string;

    // Regression metrics
    mae?: number;
    mse?: number;
    r2?: number;
    rmse?: number;
};
