// ============================================================================
// Algorithm: IJFS — Intelligent Job Fit Scoring (v2.0)
// Purpose : Match users to jobs using weighted skill & experience scoring
// Author  : Himal Fullel
// ============================================================================

const jobsData = require('./datasets/ml-training/job-recommendations-dataset.json');

// ============================================================================
// UTILITY HELPERS
// ============================================================================

// Normalize skills for flexible matching
function normalize(skill: string): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9+]/g, '');
}

// Returns true if two skills match loosely
function isSkillMatch(a: string, b: string): boolean {
  const x = normalize(a);
  const y = normalize(b);
  return x === y || x.includes(y) || y.includes(x);
}

// Count matching skills
function countMatches(userSkills: string[], jobSkills: string[]): number {
  return jobSkills.filter((js) => userSkills.some((us) => isSkillMatch(us, js)))
    .length;
}

// ============================================================================
// MAIN FUNCTION — Intelligent Job Fit Scoring (IJFS)
// ============================================================================

export function recommendJobs(userSkills: string[], yearsExperience: number) {
  const normalizedUserSkills = userSkills.map(normalize);

  const results = jobsData.map((job: any) => {
    const required = job.required_skills || [];
    const preferred = job.preferred_skills || [];

    const matchRequired = countMatches(normalizedUserSkills, required);
    const matchPreferred = countMatches(normalizedUserSkills, preferred);

    const requiredRatio = matchRequired / required.length;
    const preferredRatio =
      preferred.length > 0 ? matchPreferred / preferred.length : 0;

    // ------------------------------------------------------------
    // IJFS SCORING MODEL
    // ------------------------------------------------------------
    const threshold = job.ml_features?.skill_match_threshold || 0.6;
    const expWeight = job.ml_features?.experience_weight || 0.3;
    const bonus = job.ml_features?.skill_diversity_bonus || 0.1;

    // Skill score (required + partial preferred)
    const skillScore = requiredRatio + preferredRatio * 0.4;

    // Experience score (normalized)
    const experienceScore =
      Math.min(yearsExperience, job.experience_required) /
      job.experience_required;

    // Final match score
    let finalScore = skillScore * (1 - expWeight) + experienceScore * expWeight;

    // Bonus: user has more skills than job needs
    if (matchRequired + matchPreferred > required.length) {
      finalScore += bonus;
    }

    // Ensure 0–1 range
    finalScore = Math.min(1, Math.max(0, finalScore));

    return {
      job_id: job.job_id,
      title: job.title,
      company: job.company,
      location: job.location,
      match_score: Number(finalScore.toFixed(2)),
      meets_threshold: finalScore >= threshold,
      match_breakdown: {
        required_skills_matched: matchRequired,
        preferred_skills_matched: matchPreferred,
        required_ratio: Number(requiredRatio.toFixed(2)),
        preferred_ratio: Number(preferredRatio.toFixed(2)),
        experience_match: Number(experienceScore.toFixed(2)),
      },
    };
  });

  // Sort by highest match score
  return results.sort((a, b) => b.match_score - a.match_score);
}
