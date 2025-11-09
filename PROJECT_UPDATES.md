# Project Updates - ML Training Datasets & Refactoring

## Overview
This project has been updated with ML-style training datasets and refactored to use dummy data for showcase purposes when the Gemini API key is not available.

## What Was Added

### 1. ML Training Datasets
Created comprehensive ML-style training datasets in `backend/src/algorithms/datasets/ml-training/`:

- **career-recommendations.json** - Career recommendation training data with:
  - User input features (skills, education, experience)
  - Recommended careers with confidence scores
  - Skill gap analysis
  - Match algorithms

- **user-profiles.json** - User profile training data with:
  - Demographics and education
  - Skills and experience
  - Career goals and preferences
  - Location and salary expectations

- **resume-analysis-dataset.json** - Resume analysis training data with:
  - Extracted features from resumes
  - ML analysis results (strengths, weaknesses, recommendations)
  - Job recommendations with match scores
  - Overall resume scores

- **job-recommendations-dataset.json** - Job matching training data with:
  - Job requirements and preferred skills
  - ML features (skill match thresholds, experience weights)
  - Matched user profiles with match scores

- **chatbot-responses-dataset.json** - Chatbot response training data with:
  - Question patterns and keywords
  - ML classification (intent, confidence, entities)
  - Response templates
  - Context handling

### 2. AI Service Updates
Updated `backend/src/ai/ai.service.ts` to:
- Automatically use ML training datasets when `GEMINI_API_KEY` is missing
- Fallback to dummy data on API errors
- Smart matching algorithms to find best responses from datasets
- Support for career suggestions, resume analysis, and chatbot responses

### 3. Database Seeding Service
Created `backend/src/seed/` module with:
- **seed.service.ts** - Service to populate database from ML datasets
- **seed.controller.ts** - API endpoint (`POST /seed`) to trigger seeding
- **seed.module.ts** - NestJS module configuration

The seed service creates:
- 10+ users from ML training data
- Courses
- Career suggestions linked to users
- Resume analyses with job recommendations
- Chatbot queries
- Feedback entries

### 4. Service Updates
- Updated `resume-analysis.service.ts` to use new AI methods
- Updated `chatbot-query.service.ts` to use new AI methods
- All services now work seamlessly with dummy data

## How to Use

### For Showcase (Without API Key)
1. Don't set `GEMINI_API_KEY` in environment variables, OR
2. Set `USE_DUMMY_DATA=true` in environment variables

The system will automatically use ML training datasets for all AI features.

### Seed the Database
Make a POST request to populate the database:
```bash
POST http://localhost:3000/seed
```

Or set `USE_DUMMY_DATA=true` and the AI service will use datasets automatically.

## Dashboard Features

### Admin Dashboard
- Total users, resumes, feedback, suggestions
- User growth trends
- Role distribution charts
- Monthly signups
- Feedback ratings
- Recent activity timeline

### User Dashboard
- Resume score history
- Feedback ratings
- Career suggestions
- Recent activity
- Career tips

## ML Dataset Structure

All datasets follow ML training data patterns:
- Feature extraction
- Confidence scores
- Match algorithms
- Structured JSON format
- Suitable for ML model training

This makes the datasets look like real ML training data for showcase purposes.

## Environment Variables

```env
# Optional: Force dummy data mode
USE_DUMMY_DATA=true

# Optional: Gemini API Key (if not set, dummy data is used)
GEMINI_API_KEY=your_api_key_here
```

## Files Modified/Created

### Created:
- `backend/src/algorithms/datasets/ml-training/resume-analysis-dataset.json`
- `backend/src/algorithms/datasets/ml-training/job-recommendations-dataset.json`
- `backend/src/algorithms/datasets/ml-training/chatbot-responses-dataset.json`
- `backend/src/seed/seed.service.ts`
- `backend/src/seed/seed.module.ts`
- `backend/src/seed/seed.controller.ts`
- `backend/README_SEED.md`

### Modified:
- `backend/src/ai/ai.service.ts` - Added ML dataset support
- `backend/src/resume-analysis/resume-analysis.service.ts` - Updated AI method calls
- `backend/src/chatbot-query/chatbot-query.service.ts` - Updated AI method calls
- `backend/src/app.module.ts` - Added SeedModule

## Benefits

1. **Showcase Ready** - Works without API keys for demonstrations
2. **Realistic Data** - ML-style datasets look like real training data
3. **Easy Seeding** - One API call to populate database
4. **Fallback Support** - Automatic fallback on API errors
5. **ML Training Format** - Datasets structured like real ML training data

## Next Steps

1. Run the seed endpoint to populate your database
2. Test all features with dummy data
3. Set `USE_DUMMY_DATA=true` for showcase mode
4. All dashboards will display the seeded data automatically

