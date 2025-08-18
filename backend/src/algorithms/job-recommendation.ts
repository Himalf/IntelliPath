// Algorithm: Intelligent Job Fit Scoring (IJFS)
// Purpose: Recommend jobs that closely match the user's skill set
// Input: userSkills - array of skills from user's resume
// Output: matchedJobs

const jobsData = require('./datasets/jobs.json'); // Jobs dataset with required skills

export function recommendJobs(userSkills: string[]) {
  // Step 1: Filter jobs by matching skills
  // Jobs are selected if the user has at least one required skill
  const matchedJobs = jobsData.filter((job: any) =>
    job.skills.some((skill: string) => userSkills.includes(skill)),
  );

  // Step 2: (Optional) Sort by number of matching skills for higher fit
  matchedJobs.sort((a, b) => {
    const matchA = a.skills.filter((s: string) =>
      userSkills.includes(s),
    ).length;
    const matchB = b.skills.filter((s: string) =>
      userSkills.includes(s),
    ).length;
    return matchB - matchA;
  });

  return matchedJobs;
}
