// Algorithm: Competency Profiling & Career Alignment (CPCA)
// Purpose: Analyze user's resume skills to suggest potential careers and highlight skill gaps
// Input: userSkills - array of skills from user's resume
// Output: suggestedCareers, skillGapAnalysis

const skillsData = require('./datasets/skills.json'); // Full list of skills in the system
const careersData = require('./datasets/careers.json'); // Mapping of careers to skills

export function analyzeResume(userSkills: string[]) {
  // Step 1: Suggested careers
  // Find careers that match at least one skill the user has
  const suggestedCareers = careersData.filter((career: string) =>
    userSkills.some((skill) => skillsData.includes(skill)),
  );

  // Step 2: Skill gap analysis
  // Identify skills that are in the dataset but missing in the user's resume
  const skillGap = skillsData.filter((skill) => !userSkills.includes(skill));

  return {
    suggestedCareers,
    skillGapAnalysis: skillGap,
  };
}
