# API Key and Dataset Usage Guide

## ✅ Yes, it works with both API key and datasets!

The system is designed to work seamlessly in multiple scenarios:

## How It Works

### Scenario 1: **With API Key (Primary)**

When `GEMINI_API_KEY` is set:

1. ✅ **First tries Gemini API** - Uses real AI for responses
2. ✅ **Falls back to ML datasets** - If API fails (network error, rate limit, etc.)
3. ✅ **Automatic fallback** - No manual intervention needed

**Example:**

```env
GEMINI_API_KEY=your_api_key_here
```

- Uses Gemini API for all requests
- Automatically uses ML datasets if API fails

### Scenario 2: **Without API Key (Dataset Mode)**

When `GEMINI_API_KEY` is NOT set:

1. ✅ **Uses ML datasets directly** - No API calls made
2. ✅ **Perfect for showcase** - Works offline, no API costs
3. ✅ **Fast responses** - No network latency

**Example:**

```env
# No GEMINI_API_KEY set
```

- Uses ML training datasets for all responses
- No API calls attempted

### Scenario 3: **Force Dataset Mode**

When you want to force dataset usage even with API key:

1. ✅ **Set `USE_DUMMY_DATA=true`** - Overrides API key
2. ✅ **Always uses datasets** - Even if API key exists
3. ✅ **Useful for testing** - Test dataset responses

**Example:**

```env
GEMINI_API_KEY=your_api_key_here
USE_DUMMY_DATA=true
```

- Ignores API key, uses datasets only

## Code Logic

```typescript
// Line 13 in ai.service.ts
private readonly USE_DUMMY_DATA = !this.API_KEY || process.env.USE_DUMMY_DATA === 'true';

// In each method (generateCareerSuggestion, generateResumeAnalysis, etc.)
if (this.USE_DUMMY_DATA) {
  // Use ML datasets
  return this.getDummyCareerSuggestion(skills);
}

try {
  // Try Gemini API
  const res = await axios.post(...);
  return jsonString;
} catch (err) {
  // Fallback to ML datasets on error
  return this.getDummyCareerSuggestion(skills);
}
```

## Behavior Summary

| API Key    | USE_DUMMY_DATA | Behavior                                   |
| ---------- | -------------- | ------------------------------------------ |
| ✅ Set     | Not set        | Uses API → Falls back to datasets on error |
| ✅ Set     | `true`         | Uses datasets only (ignores API key)       |
| ❌ Not set | Not set        | Uses datasets only                         |
| ❌ Not set | `true`         | Uses datasets only                         |

## Features That Work With Both

### ✅ Career Suggestions

- **With API**: Real AI-generated career recommendations
- **With Datasets**: Smart matching from ML training data

### ✅ Resume Analysis

- **With API**: AI-powered resume analysis
- **With Datasets**: Pre-trained analysis patterns

### ✅ Chatbot Responses

- **With API**: Dynamic AI responses
- **With Datasets**: Pattern-matched intelligent responses

### ✅ Job Recommendations

- **With API**: AI-suggested job matches
- **With Datasets**: ML-based job matching

## Benefits

1. **Flexibility**: Works with or without API key
2. **Reliability**: Automatic fallback ensures service always works
3. **Cost Control**: Can use datasets to avoid API costs
4. **Showcase Ready**: Works offline for demonstrations
5. **Development Friendly**: Test with datasets, deploy with API

## Console Logs

The system logs which mode it's using:

- `"Using ML training dataset for career suggestion (dummy mode)"` - Using datasets
- `"Gemini AI Error: ..."` followed by `"Falling back to ML training dataset"` - API failed, using datasets
- No log = Using Gemini API successfully

## Best Practices

### For Development/Showcase:

```env
# No API key needed
# System uses datasets automatically
```

### For Production:

```env
GEMINI_API_KEY=your_api_key_here
# Uses API, falls back to datasets on error
```

### For Testing Datasets:

```env
GEMINI_API_KEY=your_api_key_here
USE_DUMMY_DATA=true
# Forces dataset usage
```

## Conclusion

✅ **Yes, it works with both!**

- With API key: Uses API first, falls back to datasets
- Without API key: Uses datasets directly
- Can force dataset mode with `USE_DUMMY_DATA=true`

The system is designed to be flexible and always work, whether you have an API key or not!
