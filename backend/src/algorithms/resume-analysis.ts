// ============================================================================
// INTELLIPATH — Resume ML ANALYSIS ENGINE
// Algorithm: CPCA (Competency Profiling & Career Alignment)
// Author: Himal Fullel
// ============================================================================

const skillsData = require('./datasets/skills.json');
const careersData = require('./datasets/careers.json');

// If skillsData is an array of strings, use it directly; otherwise, define its type:
type SkillItem = { skill: string };

// ============================================================================
// TYPE DEFINITIONS (Add ResumeDatasetItem interface)
// ============================================================================

interface ResumeDatasetItem {
  resume_id: string;
  extracted_features: {
    skills: string[];
    years_experience: number;
    projects_count: number;
    has_certifications: boolean;
  };
  ml_analysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    job_recommendations: JobRecommendation[];
  };
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ResumeAnalysisResult {
  resumeId: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  jobRecommendations: JobRecommendation[];
  overallScore: number;
  missingSkills: string[];
  matchedSkills: string[];
}

interface JobRecommendation {
  title: string;
  url: string;
  match_score: number;
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9+]/g, '');
}

function isSkillMatch(a: string, b: string): boolean {
  const x = normalizeSkill(a);
  const y = normalizeSkill(b);

  if (x === y) return true;
  if (x.includes(y) || y.includes(x)) return true;

  return false;
}

function findMatchingSkills(
  userSkills: string[],
  targetSkills: string[],
): string[] {
  return targetSkills.filter((target) =>
    userSkills.some((user) => isSkillMatch(user, target)),
  );
}

// ============================================================================
// SCORE CALCULATION
// ============================================================================

function calculateSkillScore(userSkills: string[], required: string[]): number {
  const matches = findMatchingSkills(userSkills, required);
  return matches.length / required.length;
}

function getOverallScore(
  experience: number,
  skillScore: number,
  projectCount: number,
  hasCert: boolean,
): number {
  let score = 0;

  score += skillScore * 60;
  score += Math.min(experience, 10) * 2.5;
  score += Math.min(projectCount, 5) * 3;
  score += hasCert ? 10 : 0;

  return Math.round(score);
}

// ============================================================================
// MAIN ML ANALYSIS ENGINE
// ============================================================================

export function analyzeResumeML(
  resume: ResumeDatasetItem,
): ResumeAnalysisResult {
  const { extracted_features, ml_analysis } = resume;
  // If skillsData is an array of objects with a 'skill' property:
  // const globalSkills = (skillsData as SkillItem[]).map((s) => s.skill);

  // If skillsData is an array of strings:
  const globalSkills = skillsData as string[];
  const userSkills = extracted_features.skills;

  const matchedSkills = findMatchingSkills(userSkills, globalSkills);
  const missingSkills = globalSkills.filter(
    (skill) => !matchedSkills.includes(skill),
  );

  const strengths = ml_analysis.strengths;
  const weaknesses = ml_analysis.weaknesses;
  const recommendations = ml_analysis.recommendations;

  const jobRecommendations = ml_analysis.job_recommendations.map((role) => {
    const roleDefinition = (
      careersData as unknown as { title: string; requiredSkills?: string[] }[]
    ).find((c) => normalizeSkill(c.title) === normalizeSkill(role.title));

    if (!roleDefinition) return role;

    const skillScore = calculateSkillScore(
      userSkills,
      roleDefinition.requiredSkills || [],
    );

    return {
      ...role,
      match_score:
        Math.round(((skillScore + role.match_score) / 2) * 100) / 100,
    };
  });

  const skillScore = matchedSkills.length / (globalSkills.length || 1);

  const overallScore = getOverallScore(
    extracted_features.years_experience,
    skillScore,
    extracted_features.projects_count,
    extracted_features.has_certifications,
  );

  return {
    resumeId: resume.resume_id,
    strengths,
    weaknesses,
    recommendations,
    jobRecommendations,
    overallScore,
    matchedSkills,
    missingSkills,
  };
}

// ============================================================================
// BULK PROCESSOR — For full dataset
// ============================================================================

export function analyzeAllResumes(dataset: ResumeDatasetItem[]) {
  return dataset.map((resume) => analyzeResumeML(resume));
}
