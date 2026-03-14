// useSymptoms.js - Custom hook for symptom checker
import { useState, useEffect } from 'react';
import api from '../api/axios';

const SPECIALTY_MAP = {
  "Fungal infection": ["Dermatologist", "General Physician"],
  "Allergy": ["Allergist", "General Physician"],
  "GERD": ["Gastroenterologist", "General Physician"],
  "Chronic cholestasis": ["Hepatologist", "Gastroenterologist"],
  "Drug Reaction": ["Dermatologist", "Allergist", "General Physician"],
  "Peptic ulcer diseae": ["Gastroenterologist", "General Physician"],
  "AIDS": ["Infectious Disease Specialist", "General Physician"],
  "Diabetes": ["Endocrinologist", "General Physician"],
  "Gastroenteritis": ["Gastroenterologist", "General Physician"],
  "Bronchial Asthma": ["Pulmonologist", "General Physician"],
  "Hypertension": ["Cardiologist", "General Physician"],
  "Migraine": ["Neurologist", "General Physician"],
  "Cervical spondylosis": ["Orthopedic Surgeon", "Neurologist", "Physiotherapist"],
  "Paralysis (brain hemorrhage)": ["Neurologist", "Physiotherapist"],
  "Jaundice": ["Hepatologist", "Gastroenterologist", "General Physician"],
  "Malaria": ["Infectious Disease Specialist", "General Physician"],
  "Chicken pox": ["Infectious Disease Specialist", "General Physician"],
  "Dengue": ["Infectious Disease Specialist", "General Physician"],
  "Typhoid": ["Infectious Disease Specialist", "General Physician"],
  "hepatitis A": ["Hepatologist", "Infectious Disease Specialist"],
  "Hepatitis B": ["Hepatologist", "Infectious Disease Specialist"],
  "Hepatitis C": ["Hepatologist", "Infectious Disease Specialist"],
  "Hepatitis D": ["Hepatologist", "Infectious Disease Specialist"],
  "Hepatitis E": ["Hepatologist", "Infectious Disease Specialist"],
  "Alcoholic hepatitis": ["Hepatologist", "Gastroenterologist"],
  "Tuberculosis": ["Pulmonologist", "Infectious Disease Specialist"],
  "Common Cold": ["General Physician", "ENT Specialist"],
  "Pneumonia": ["Pulmonologist", "General Physician"],
  "Dimorphic hemmorhoids(piles)": ["Proctologist", "General Surgeon"],
  "Heart attack": ["Cardiologist"],
  "Varicose veins": ["Vascular Surgeon", "Dermatologist"],
  "Hypothyroidism": ["Endocrinologist"],
  "Hyperthyroidism": ["Endocrinologist"],
  "Hypoglycemia": ["Endocrinologist", "General Physician"],
  "Osteoarthristis": ["Orthopedic Surgeon", "Physiotherapist"],
  "Arthritis": ["Rheumatologist", "Orthopedic Surgeon"],
  "(vertigo) Paroymsal Positional Vertigo": ["ENT Specialist", "Neurologist"],
  "Acne": ["Dermatologist"],
  "Urinary tract infection": ["Urologist", "General Physician"],
  "Psoriasis": ["Dermatologist"],
  "Impetigo": ["Dermatologist", "Infectious Disease Specialist"]
};

export const useSymptoms = (currentPage, doctors) => {
  const [symptoms, setSymptoms] = useState([]);
  const [searchSymptom, setSearchSymptom] = useState('');
  const [symptomList, setSymptomList] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPage === 'symptoms' && symptomList.length === 0) {
      fetchSymptoms();
    }
  }, [currentPage]);

  const fetchSymptoms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/predict/symptoms');
      if (res.data.symptoms) {
        setSymptomList(res.data.symptoms);
      }
    } catch (error) {
      console.error('Failed to fetch symptoms:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSymptom = (symptom) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
    setSearchSymptom('');
  };

  const removeSymptom = (symptom) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      throw new Error('Please add at least one symptom');
    }

    try {
      setLoading(true);
      const res = await api.post('/predict', { symptoms });

      const diseaseName = res.data.predicted_disease || res.data.prediction || "Unknown Condition";

      const result = [{
        name: diseaseName,
        probability: res.data.confidence ? Math.round(res.data.confidence * 100) : 95,
        description: 'Based on your symptoms and our AI analysis.'
      }];

      setPrediction(result);

      const recommendedSpecialties = SPECIALTY_MAP[diseaseName] || ["General Physician"];

      let filtered = doctors.filter(d =>
        recommendedSpecialties.some(spec => spec.toLowerCase() === d.specialty.toLowerCase())
      );

      if (filtered.length === 0) {
        filtered = doctors;
      }

      setRecommendedDoctors(filtered);
      return { prediction: result, doctors: filtered };
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSymptoms([]);
    setSearchSymptom('');
    setPrediction(null);
    setRecommendedDoctors([]);
  };

  return {
    symptoms,
    searchSymptom,
    setSearchSymptom,
    symptomList,
    prediction,
    recommendedDoctors,
    loading,
    addSymptom,
    removeSymptom,
    analyzeSymptoms,
    reset
  };
};
