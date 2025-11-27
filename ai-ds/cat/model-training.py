# --- 4. Model Training (XGBoost) ---
print("Training XGBoost Classifier...")

xgb_model = XGBClassifier(
    objective='multi:softmax',          # Sets the objective for multiclass classification
    num_class=len(class_names),         # Should be 3 (Healthy, At Risk, Unhealthy)
    eval_metric='mlogloss',             # Log loss metric for training evaluation
    use_label_encoder=False,            
    n_estimators=100,                   # Number of boosting stages (trees)
    learning_rate=0.1,                  # Step size shrinkage to prevent overfitting
    random_state=42
)

# X_train and y_train come from the data splitting step
xgb_model.fit(X_train, y_train) 

# --- 5. Evaluation (Prediction on the test set) ---
y_pred = xgb_model.predict(X_test)