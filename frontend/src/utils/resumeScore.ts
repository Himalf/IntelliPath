import { ResumeAnalysis } from "@/services/resumeService";

/**
 * Calculate resume score based on strengths, recommendations, and weaknesses
 * 
 * Scoring Formula:
 * - Each strength adds 15 points (max 60 points for 4+ strengths)
 * - Each recommendation adds 10 points (max 40 points for 4+ recommendations)
 * - Each weakness subtracts 5 points (max -25 points for 5+ weaknesses)
 * 
 * Final score is capped between 0 and 100
 * 
 * @param resume - ResumeAnalysis object
 * @returns Score between 0 and 100
 */
export function calculateResumeScore(resume: ResumeAnalysis): number {
  if (!resume) return 0;

  // Count items
  const strengthsCount = resume.strengths?.length || 0;
  const recommendationsCount = resume.recommendation?.length || 0;
  const weaknessesCount = resume.weakness?.length || 0;

  // Calculate base scores
  // Strengths are most valuable - each adds 15 points
  const strengthScore = Math.min(strengthsCount * 15, 60); // Cap at 60 for 4+ strengths
  
  // Recommendations are valuable - each adds 10 points
  const recommendationScore = Math.min(recommendationsCount * 10, 40); // Cap at 40 for 4+ recommendations
  
  // Weaknesses reduce score - each subtracts 5 points
  const weaknessPenalty = Math.min(weaknessesCount * 5, 25); // Cap at -25 for 5+ weaknesses

  // Calculate total score
  const totalScore = strengthScore + recommendationScore - weaknessPenalty;

  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, totalScore));
}

/**
 * Get score color class based on score value
 * @param score - Score between 0 and 100
 * @returns CSS class string for badge color
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return "bg-green-100 text-green-700 border-green-300";
  if (score >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-red-100 text-red-700 border-red-300";
}

/**
 * Get score label based on score value
 * @param score - Score between 0 and 100
 * @returns Label string (Excellent, Good, Fair, Poor)
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 30) return "Needs Improvement";
  return "Poor";
}

/**
 * Get score description with breakdown
 * @param resume - ResumeAnalysis object
 * @returns Object with score breakdown details
 */
export function getScoreBreakdown(resume: ResumeAnalysis) {
  const strengthsCount = resume.strengths?.length || 0;
  const recommendationsCount = resume.recommendation?.length || 0;
  const weaknessesCount = resume.weakness?.length || 0;
  
  const strengthScore = Math.min(strengthsCount * 15, 60);
  const recommendationScore = Math.min(recommendationsCount * 10, 40);
  const weaknessPenalty = Math.min(weaknessesCount * 5, 25);
  
  return {
    total: calculateResumeScore(resume),
    strengthScore,
    recommendationScore,
    weaknessPenalty,
    strengthsCount,
    recommendationsCount,
    weaknessesCount,
  };
}

