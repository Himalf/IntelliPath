// ============================================================================
// Algorithm: ALPR — Adaptive Learning Path Recommendation (v2.0)
// Purpose : Recommend careers and courses based on skills, gaps & learning needs
// Author  : Himal Fullel
// ============================================================================

const skillsData = require('./datasets/skills.json');
const careersData = require('./datasets/ml-training/career-recommendations.json');
const coursesData = require('./datasets/courses.json');

// Utility: Normalize skill text
function normalize(skill: string): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9+]/g, '');
}

// Check skill match
function isMatch(a: string, b: string): boolean {
  const x = normalize(a);
  const y = normalize(b);
  return x === y || x.includes(y) || y.includes(x);
}

// Count skill matches
function countMatches(userSkills: string[], jobSkills: string[]) {
  return jobSkills.filter((js) => userSkills.some((us) => isMatch(us, js)))
    .length;
}

// ============================================================================
// MAIN: Adaptive Learning Path Recommendation (ALPR)
// ============================================================================
export function careerGuidance(
  userSkills: string[],
  yearsExperience: number = 0,
) {
  const normSkills = userSkills.map(normalize);

  // ------------------------------------------------------------
  // CAREER RECOMMENDATION ENGINE
  // ------------------------------------------------------------
  const recommendedCareers = careersData.map((career: any) => {
    const required = career.required_skills || [];
    const matched = countMatches(normSkills, required);
    const missing = required.filter(
      (r: string) => !normSkills.some((s) => isMatch(s, r)),
    );

    const matchRatio = matched / required.length;

    // Skill gap = percentage of missing skills
    const skillGap = 1 - matchRatio;

    // Experience factor (0–1 scale)
    const experienceFactor =
      Math.min(yearsExperience, career.experience_required || 0) /
      (career.experience_required || 1);

    // Confidence score: a weighted mix of required skills & experience
    let confidence = matchRatio * 0.75 + experienceFactor * 0.25;

    confidence = Number(confidence.toFixed(2));

    return {
      career: career.title,
      confidence_score: confidence,
      match_reason:
        matched === required.length
          ? `Strong alignment with all required skills`
          : `Good alignment with ${matched}/${required.length} required skills`,

      required_skills: required,
      missing_skills: missing,
      skill_gap: Number(skillGap.toFixed(2)),
    };
  });

  // Sort careers by confidence
  recommendedCareers.sort(
    (a: any, b: any) => b.confidence_score - a.confidence_score,
  );

  // ------------------------------------------------------------
  // SKILL GAP ANALYSIS
  // ------------------------------------------------------------
  const allGlobalSkills = skillsData.map((s: any) => normalize(s.skill || s));

  const strengths = normSkills.filter((s) => allGlobalSkills.includes(s));

  const weaknesses = allGlobalSkills.filter(
    (globalSkill: string) => !normSkills.includes(globalSkill),
  );

  // Generate recommendations based on missing skills
  const skillRecommendations = weaknesses.slice(0, 5).map((w) => {
    return `Improve your knowledge in ${w} to expand your career opportunities`;
  });

  // ------------------------------------------------------------
  // COURSE RECOMMENDATIONS (AI-enhanced)
  // ------------------------------------------------------------
  const recommendedCourses = coursesData
    .filter((course: any) => {
      // Recommend course if user lacks required skills
      return course.skills.some(
        (skill: string) => !normSkills.includes(normalize(skill)),
      );
    })
    .map((course: any) => ({
      course: course.title,
      skills_covered: course.skills,
    }));

  return {
    recommended_careers: recommendedCareers,
    skill_gap_analysis: {
      strengths,
      weaknesses,
      recommendations: skillRecommendations,
    },
    recommended_courses: recommendedCourses,
  };
}
