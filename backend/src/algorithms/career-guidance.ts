// Algorithm: Adaptive Learning Path Recommendation (ALPR)
// Purpose: Recommend careers and courses tailored to the user's skills
// Input: userSkills - array of skills from user's resume
// Output: recommendedCareers, recommendedCourses

const skillsData = require('./datasets/skills.json');
const careersData = require('./datasets/careers.json');
const coursesData = require('./datasets/courses.json');
// courses.json structure example: [{ title: "React Advanced", skills: ["React", "JavaScript"] }, ...]

export function careerGuidance(userSkills: string[]) {
  // Step 1: Match user's skills to possible careers
  const recommendedCareers = careersData.filter((career: any) =>
    userSkills.some((skill) =>
      career.requiredSkills.some((s: string) => s === skill),
    ),
  );

  // Step 2: Recommend courses to improve missing or weak skills
  const recommendedCourses = coursesData
    .filter((course) =>
      course.skills.some((skill: string) => userSkills.includes(skill)),
    )
    .map((course) => course.title);

  return {
    recommendedCareers,
    recommendedCourses,
  };
}
