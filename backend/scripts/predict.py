import sys
import json
import os
import numpy as np
import joblib

# Paths
BASE_DIR = os.path.dirname(__file__)
MODELS_DIR = os.path.join(BASE_DIR, '../models/')
MODEL_PATH = os.path.join(MODELS_DIR, 'naive_bayes.pkl')
SYMPTOMS_PATH = os.path.join(MODELS_DIR, 'symptoms.json')

def load_artifacts():
    try:
        model = joblib.load(MODEL_PATH)
        with open(SYMPTOMS_PATH, 'r') as f:
            symptoms_list = json.load(f)
        return model, symptoms_list
    except Exception as e:
        print(json.dumps({"error": f"Failed to load model artifacts: {str(e)}"}))
        sys.exit(1)

def get_symptoms():
    model, symptoms_list = load_artifacts()
    print(json.dumps({"symptoms": symptoms_list}))

def predict():
    # Read input from stdin
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        request = json.loads(input_data)
        
        # Extract user symptoms
        # Support both {"symptoms": [...]} and [...] formats
        if isinstance(request, dict) and "symptoms" in request:
            user_symptoms = request["symptoms"]
        elif isinstance(request, list):
            user_symptoms = request
        else:
            # Fallback: maybe the dict itself keys are symptoms? unlikely.
            # Assume values if dict? No, safe to error or try to extract valid strings.
            user_symptoms = []
            if isinstance(request, dict):
                 user_symptoms = [v for k, v in request.items() if isinstance(v, str)]

        model, symptoms_list = load_artifacts()
        
        # Create Feature Vector
        symptom_to_idx = {sym: i for i, sym in enumerate(symptoms_list)}
        input_vector = np.zeros((1, len(symptoms_list)), dtype=int)
        
        for sym in user_symptoms:
            clean_sym = sym.strip()
            if clean_sym in symptom_to_idx:
                idx = symptom_to_idx[clean_sym]
                input_vector[0, idx] = 1
                
        # Predict
        prediction = model.predict(input_vector)
        predicted_disease = str(prediction[0])
        
        # Return both keys for compatibility
        print(json.dumps({
            "predicted_disease": predicted_disease,
            "prediction": predicted_disease
        }))
        
    except Exception as e:
        print(json.dumps({"error": f"Prediction error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == 'symptoms':
        get_symptoms()
    else:
        predict()
