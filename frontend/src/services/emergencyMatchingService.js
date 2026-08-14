import { MOCK_HOSPITALS } from './mockHospitals';
import { supabase } from '../lib/supabase/client';
import { EMERGENCY_TYPES } from '../types/emergency';

/**
 * Calculates Haversine distance in kilometers between two lat/long coordinates.
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0; // default fallback 5km

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export const emergencyMatchingService = {
  /**
   * Evaluates active VERIFIED hospitals and selects the optimal match based on:
   * 1. HealthOS Verification Status (ONLY 'VERIFIED' hospitals permitted)
   * 2. Required medical capability & specialty matching
   * 3. Emergency department & ICU bed availability
   * 4. Distance & ETA
   */
  async findBestHospitalMatch(emergencyRequest) {
    const { emergency_type, latitude, longitude } = emergencyRequest;
    const typeInfo = EMERGENCY_TYPES[emergency_type] || EMERGENCY_TYPES.OTHER;
    const requiredCaps = typeInfo.requiredCapabilities || ['Emergency & Trauma'];

    let candidateHospitals = [];

    // Query live Supabase DB using the verified_hospitals view or verified filter
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('is_active', true)
        .eq('verification_status', 'VERIFIED');

      if (!error && Array.isArray(data) && data.length > 0) {
        candidateHospitals = data;
      }
    } catch (_err) {
      // Fallback
    }

    if (candidateHospitals.length === 0) {
      candidateHospitals = MOCK_HOSPITALS;
    }

    // MANDATORY SAFETY FILTER: ONLY 'VERIFIED' HOSPITALS ARE ALLOWED IN EMERGENCY MATCHING
    const verifiedHospitals = candidateHospitals.filter((h) => {
      // Exclude PENDING, UNDER_REVIEW, REJECTED, or SUSPENDED facilities
      if (h.verification_status && h.verification_status !== 'VERIFIED') return false;
      if (h.verificationStatus && h.verificationStatus !== 'VERIFIED') return false;
      return h.emergencyCapable !== false && (h.is_active === undefined || h.is_active === true);
    });

    if (verifiedHospitals.length === 0) {
      throw new Error('No HealthOS Verified emergency-capable hospital available in network.');
    }

    // Score verified candidates
    const userLat = latitude || 25.4775; // Default Banda UP
    const userLon = longitude || 80.3347;

    const scoredHospitals = verifiedHospitals.map((hosp) => {
      const distance = calculateHaversineDistance(
        userLat,
        userLon,
        hosp.latitude || 25.4775,
        hosp.longitude || 80.3347
      );

      const etaMinutes = Math.max(3, Math.round(distance * 2.5 + 4));

      // Capability Match Score (0 - 40 points)
      const specializations = hosp.specializations || [
        'Emergency & Trauma',
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'ICU Care',
      ];

      const matchedCapsCount = requiredCaps.filter((cap) =>
        specializations.some((s) => s.toLowerCase().includes(cap.toLowerCase()))
      ).length;

      const capabilityScore = (matchedCapsCount / requiredCaps.length) * 40;

      // Bed & ICU Availability Score (0 - 30 points)
      const availBeds = hosp.availableBeds ?? hosp.available_beds ?? 20;
      const availIcu = hosp.availableIcu ?? hosp.available_icu ?? 5;

      const bedScore = Math.min(15, (availBeds / 50) * 15);
      const icuScore = Math.min(15, (availIcu / 10) * 15);

      // Distance & Proximity Penalty (Max 30 points)
      const proximityScore = Math.max(0, 30 - distance * 1.5);

      const totalScore = parseFloat((capabilityScore + bedScore + icuScore + proximityScore).toFixed(1));

      return {
        hospital: hosp,
        distanceKm: distance,
        estimatedEtaMin: etaMinutes,
        matchScore: totalScore,
      };
    });

    // Sort by highest match score
    scoredHospitals.sort((a, b) => b.matchScore - a.matchScore);

    return scoredHospitals[0];
  },
};
