import sys
import json
import argparse
import os
import time
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.svm import SVC, SVR, LinearSVC, LinearSVR
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor

# Try importing XGBoost, handle if missing
try:
    from xgboost import XGBClassifier, XGBRegressor
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

def train_model(dataset_path, algorithm_name, target_column, task_type, parameters=None):
    start_time = time.time()
    
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    # Load Data
    try:
        df = pd.read_csv(dataset_path)
    except Exception as e:
        df = pd.read_csv(dataset_path, encoding='latin1')
    
    if target_column not in df.columns:
        # Fallback: try to find column case-insensitively or use last column
        col_map = {c.lower(): c for c in df.columns}
        if target_column.lower() in col_map:
            target_column = col_map[target_column.lower()]
        else:
            target_column = df.columns[-1]

    # Preprocessing
    # 1. Handle Missing Values (Simple Imputation)
    num_cols = df.select_dtypes(include=[np.number]).columns
    cat_cols = df.select_dtypes(exclude=[np.number]).columns
    
    if not num_cols.empty:
        df[num_cols] = df[num_cols].fillna(df[num_cols].mean())
    for c in cat_cols:
        df[c] = df[c].fillna(df[c].mode()[0] if not df[c].mode().empty else "Missing")

    X = df.drop(columns=[target_column])
    y = df[target_column]

    # Handle categorical target for classification
    if task_type.lower() == 'classification':
        # Drop rows where target is NaN
        valid_y_mask = df[target_column].notna()
        X = X[valid_y_mask]
        y = y[valid_y_mask]
        
        le = LabelEncoder()
        y = le.fit_transform(y.astype(str))
        # print(f"DEBUG: Classification target encoded. Unique classes: {len(le.classes_)}")

    # Preprocessing Features
    # 1. Drop ID-like columns (all values unique and not numeric)
    cols_to_drop = []
    for col in X.columns:
        if X[col].nunique() == len(X) and not np.issubdtype(X[col].dtype, np.number):
            cols_to_drop.append(col)
        elif col.lower() in ['id', 'uuid', 'index']:
            cols_to_drop.append(col)
    X = X.drop(columns=cols_to_drop)

    # 2. Handle Text vs Categorical
    from sklearn.feature_extraction.text import TfidfVectorizer
    processed_parts = []
    
    # Numeric parts
    num_df = X.select_dtypes(include=[np.number])
    if not num_df.empty:
        processed_parts.append(num_df.fillna(num_df.mean()))

    # Categorical / Text parts
    obj_cols = X.select_dtypes(exclude=[np.number]).columns
    for col in obj_cols:
        unique_count = X[col].nunique()
        if unique_count > 100 and unique_count > len(X) * 0.1:
            # High cardinality -> Treat as Text
            vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
            text_stats = vectorizer.fit_transform(X[col].astype(str).fillna(""))
            text_df = pd.DataFrame(text_stats.toarray(), columns=[f"{col}_{w}" for w in vectorizer.get_feature_names_out()])
            processed_parts.append(text_df)
        else:
            # Low cardinality -> One-Hot Encode
            dummy = pd.get_dummies(X[col], prefix=col, drop_first=True)
            processed_parts.append(dummy)

    # Combine all parts
    if processed_parts:
        X = pd.concat(processed_parts, axis=1)
    else:
        # Fallback if no features left
        X = pd.DataFrame(index=df.index)
    
    # Final Fillna
    X = X.fillna(0)
    
    # Sanitize column names for XGBoost
    X.columns = X.columns.astype(str)
    X.columns = [c.replace('[','_').replace(']','_').replace('<','_') for c in X.columns]

    # Split Train/Test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Model Selection
    model = None
    name = algorithm_name.lower()
    
    # Default params if None
    if parameters is None: parameters = {}

    if task_type.lower() == 'classification':
        if "random" in name and "forest" in name:
            model = RandomForestClassifier(**{k: v for k, v in parameters.items() if k in ['n_estimators', 'max_depth']})
        elif "xgb" in name:
            if HAS_XGB: model = XGBClassifier(eval_metric='logloss', **{k: v for k, v in parameters.items() if k in ['n_estimators', 'max_depth', 'learning_rate']})
            else: model = RandomForestClassifier() # Fallback
        elif "logistic" in name:
            model = LogisticRegression(max_iter=1000)
        elif "svm" in name:
            kernel = parameters.get('kernel', 'rbf')
            if kernel == 'linear':
                from sklearn.svm import LinearSVC
                model = LinearSVC(max_iter=2000)
            else:
                model = SVC(kernel=kernel, cache_size=1000, **{k: v for k, v in parameters.items() if k in ['C', 'gamma']})
        elif "neighbor" in name or "knn" in name:
            model = KNeighborsClassifier()
        elif "decision" in name and "tree" in name:
             model = DecisionTreeClassifier()
        else:
            model = RandomForestClassifier()
            
    else: # Regression
        if "random" in name and "forest" in name:
            model = RandomForestRegressor(**{k: v for k, v in parameters.items() if k in ['n_estimators', 'max_depth']})
        elif "xgb" in name:
            if HAS_XGB: model = XGBRegressor(**{k: v for k, v in parameters.items() if k in ['n_estimators', 'max_depth', 'learning_rate']})
            else: model = RandomForestRegressor()
        elif "linear" in name:
            model = LinearRegression()
        elif "svm" in name or "svr" in name:
            kernel = parameters.get('kernel', 'rbf')
            if kernel == 'linear':
                from sklearn.svm import LinearSVR
                model = LinearSVR(max_iter=2000)
            else:
                model = SVR(kernel=kernel, cache_size=1000, **{k: v for k, v in parameters.items() if k in ['C', 'gamma']})
        elif "neighbor" in name or "knn" in name:
            model = KNeighborsRegressor()
        elif "decision" in name and "tree" in name:
             model = DecisionTreeRegressor()
        else:
            model = RandomForestRegressor()

    # Train
    model.fit(X_train, y_train)
    
    # Predict
    y_pred = model.predict(X_test)
    
    end_time = time.time()
    training_time = end_time - start_time
    
    # Metrics
<<<<<<< HEAD
    metrics = {}
    
    if task_type.lower() == 'classification':
=======
    # Metrics
    metrics = {}
    
    if task_type.lower() == 'classification':
        from sklearn.metrics import roc_curve, roc_auc_score
        
>>>>>>> f2ca84ca05045926dc254d3581d23412f59c8cb4
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        metrics = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "confusion_matrix": cm,
            "trainingTime": round(training_time, 2)
        }
<<<<<<< HEAD
=======

        # ROC Curve Logic (Binary Classification primarily, or macro-average for multi-class if adapted)
        # For simplicity and robustness, we attempt ROC for binary/multiclass if predict_proba is available.
        if hasattr(model, "predict_proba"):
            try:
                # Check for binary classification or multiclass
                if len(np.unique(y)) == 2:
                    y_prob = model.predict_proba(X_test)[:, 1]
                    fpr, tpr, _ = roc_curve(y_test, y_prob)
                    auc_score = roc_auc_score(y_test, y_prob)
                    
                    # subsample to reduce payload size if too many points
                    if len(fpr) > 100:
                        indices = np.linspace(0, len(fpr) - 1, 100).astype(int)
                        fpr = fpr[indices]
                        tpr = tpr[indices]

                    metrics["roc_curve"] = {
                        "fpr": fpr.tolist(),
                        "tpr": tpr.tolist(),
                        "auc": round(auc_score, 4)
                    }
            except Exception as e:
                # Fallback if ROC fails (e.g. multiclass complexity without specific handling)
                print(f"DEBUG: ROC calculation failed: {e}", file=sys.stderr)
                pass

>>>>>>> f2ca84ca05045926dc254d3581d23412f59c8cb4
    else:
        mse = mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        metrics = {
            "mse": round(mse, 4),
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2": round(r2, 4),
<<<<<<< HEAD
            "accuracy": round(max(0, r2), 4), # Fallback for frontend
=======
>>>>>>> f2ca84ca05045926dc254d3581d23412f59c8cb4
            "trainingTime": round(training_time, 2)
        }

    # Add Visualization Data (Common)
    # Serialize numpy arrays to list and limit size for performance
    limit = 500
    metrics["predictions"] = y_pred[:limit].tolist()
    if isinstance(y_test, (pd.Series, pd.DataFrame)):
        metrics["y_test"] = y_test.iloc[:limit].values.tolist()
    else:
        metrics["y_test"] = y_test[:limit].tolist()
        
    # Feature Importance
    if hasattr(model, "feature_importances_"):
        try:
            importances = model.feature_importances_
            metrics["feature_importance"] = [
                {"feature": str(col), "importance": float(imp)} 
                for col, imp in zip(X.columns, importances)
            ]
        except Exception as e:
            pass # Ignore if feature importance fails extraction

    # Save Model (Mocking a persistent path or returning a specific artifact)
    model_filename = f"{algorithm_name}_{task_type}_model.pkl"
    model_path = os.path.join("/tmp", model_filename)
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    # If using volume, could move to /app/datasets/models/
    # For now, simplistic

    result = {
        "algorithm": algorithm_name,
        "metrics": metrics,
        "modelPath": model_path
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('dataset_path', type=str)
    parser.add_argument('algorithm', type=str)
    parser.add_argument('target_column', type=str)
    parser.add_argument('task_type', type=str)
    parser.add_argument('parameters', type=str, nargs='?', default='{}')
    
    args = parser.parse_args()
    
    try:
        params = json.loads(args.parameters)
        train_model(args.dataset_path, args.algorithm, args.target_column, args.task_type, params)
    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
