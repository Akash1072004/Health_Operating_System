/**
 * HealthOS Emergency SOS Data Constants & Definitions
 */

export const EMERGENCY_TYPES = {
  ACCIDENT: {
    id: 'ACCIDENT',
    title: 'Accident',
    description: 'Road traffic collision or physical impact trauma',
    icon: '🚗',
    defaultSeverity: 'HIGH',
    requiredCapabilities: ['Emergency & Trauma', 'Orthopedics', 'ICU Care'],
  },
  POSSIBLE_HEART_ATTACK: {
    id: 'POSSIBLE_HEART_ATTACK',
    title: 'Possible Heart Attack / Chest Pain',
    description: 'Crushing chest pressure, radiating pain, diaphoresis',
    icon: '🫀',
    defaultSeverity: 'CRITICAL',
    requiredCapabilities: ['Cardiology', 'Emergency & Trauma', 'ICU Care'],
  },
  UNCONSCIOUSNESS: {
    id: 'UNCONSCIOUSNESS',
    title: 'Unconsciousness',
    description: 'Unresponsive patient, altered level of consciousness',
    icon: '😵',
    defaultSeverity: 'CRITICAL',
    requiredCapabilities: ['Emergency & Trauma', 'Neurology', 'ICU Care'],
  },
  BREATHING_DIFFICULTY: {
    id: 'BREATHING_DIFFICULTY',
    title: 'Breathing Difficulty',
    description: 'Acute shortness of breath, asphyxia, or severe asthma',
    icon: '🫁',
    defaultSeverity: 'CRITICAL',
    requiredCapabilities: ['Emergency & Trauma', 'ICU Care'],
  },
  SEVERE_BLEEDING: {
    id: 'SEVERE_BLEEDING',
    title: 'Severe Bleeding',
    description: 'Uncontrolled arterial or venous hemorrhaging',
    icon: '🩸',
    defaultSeverity: 'CRITICAL',
    requiredCapabilities: ['Emergency & Trauma', 'ICU Care'],
  },
  STROKE_SYMPTOMS: {
    id: 'STROKE_SYMPTOMS',
    title: 'Stroke Symptoms',
    description: 'Facial drooping, arm weakness, speech difficulty (FAST)',
    icon: '🧠',
    defaultSeverity: 'CRITICAL',
    requiredCapabilities: ['Neurology', 'Emergency & Trauma', 'ICU Care'],
  },
  SEVERE_BURN: {
    id: 'SEVERE_BURN',
    title: 'Severe Burn',
    description: 'Thermal, chemical, or electrical 2nd/3rd degree burns',
    icon: '🔥',
    defaultSeverity: 'HIGH',
    requiredCapabilities: ['Emergency & Trauma', 'ICU Care'],
  },
  POISONING: {
    id: 'POISONING',
    title: 'Poisoning',
    description: 'Toxic substance ingestion, overdose, or chemical exposure',
    icon: '🧪',
    defaultSeverity: 'HIGH',
    requiredCapabilities: ['Emergency & Trauma', 'ICU Care'],
  },
  SEVERE_INJURY: {
    id: 'SEVERE_INJURY',
    title: 'Severe Injury',
    description: 'Fracture, severe fall, laceration, or crush injury',
    icon: '🦴',
    defaultSeverity: 'HIGH',
    requiredCapabilities: ['Orthopedics', 'Emergency & Trauma'],
  },
  OTHER: {
    id: 'OTHER',
    title: 'Other Emergency',
    description: 'Any acute medical condition requiring rapid care',
    icon: '🚨',
    defaultSeverity: 'HIGH',
    requiredCapabilities: ['Emergency & Trauma'],
  },
};

export const EMERGENCY_STATUS = {
  REQUESTED: 'REQUESTED',
  ASSESSING: 'ASSESSING',
  MATCHING_HOSPITAL: 'MATCHING_HOSPITAL',
  HOSPITAL_SELECTED: 'HOSPITAL_SELECTED',
  HOSPITAL_ACCEPTED: 'HOSPITAL_ACCEPTED',
  AMBULANCE_REQUESTED: 'AMBULANCE_REQUESTED',
  AMBULANCE_ASSIGNED: 'AMBULANCE_ASSIGNED',
  AMBULANCE_DISPATCHED: 'AMBULANCE_DISPATCHED',
  AMBULANCE_ARRIVING: 'AMBULANCE_ARRIVING',
  PATIENT_PICKED_UP: 'PATIENT_PICKED_UP',
  HOSPITAL_ARRIVAL: 'HOSPITAL_ARRIVAL',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const EMERGENCY_STATUS_LABELS = {
  REQUESTED: 'Emergency Request Initiated',
  ASSESSING: 'Assessing Triage Urgency',
  MATCHING_HOSPITAL: 'Finding Best Capable Hospital',
  HOSPITAL_SELECTED: 'Hospital Matched',
  HOSPITAL_ACCEPTED: 'Hospital Accepted Triage',
  AMBULANCE_REQUESTED: 'Requesting Ambulance Unit',
  AMBULANCE_ASSIGNED: 'Ambulance Assigned',
  AMBULANCE_DISPATCHED: 'Ambulance Dispatched',
  AMBULANCE_ARRIVING: 'Ambulance is Arriving',
  PATIENT_PICKED_UP: 'Patient Picked Up & En Route',
  HOSPITAL_ARRIVAL: 'Arrived at Hospital Trauma Bay',
  COMPLETED: 'Emergency Resolved',
  CANCELLED: 'Emergency Assistance Cancelled',
};

export const EMERGENCY_SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MODERATE: 'MODERATE',
};
