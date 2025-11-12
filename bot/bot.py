import cloudscraper
import json
import time
import random
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from bson.objectid import ObjectId  # For MongoDB-like _id; pip install pymongo

# Initialize Cloudflare bypassing scraper with browser-like settings
scraper = cloudscraper.create_scraper(
    browser={
        'browser': 'chrome',
        'platform': 'windows',
        'mobile': False
    }
)
# Rotate user-agents to mimic humans
user_agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36'
]

def get_with_retry(url, method='get', data=None, retries=3):
    for attempt in range(retries):
        try:
            headers = {'User-Agent': random.choice(user_agents)}
            if method == 'get':
                response = scraper.get(url, headers=headers)
            else:
                response = scraper.post(url, json=data, headers=headers)
            if response.status_code == 200:
                return response
            print(f"Retry {attempt+1}/{retries} for {url} - Status: {response.status_code}")
        except Exception as e:
            print(f"Error on attempt {attempt+1}: {e}")
        time.sleep(random.uniform(5, 10) * (attempt + 1))  # Exponential backoff
    raise Exception(f"Failed to fetch {url} after {retries} retries")

# Step 1: Fetch list of all problems (JSON API, often bypasses Cloudflare easily)
all_problems_url = "https://leetcode.com/api/problems/all/"
response = get_with_retry(all_problems_url)
all_problems = json.loads(response.text)['stat_status_pairs']

# Filter first 40 free problems
free_problems = [p for p in all_problems if not p['paid_only']][:40]
print(f"Found {len(free_problems)} free problems to scrape.")

# Step 2: For each problem, fetch details via GraphQL and parse
data_list = []
current_date = datetime.now()

for idx, problem in enumerate(free_problems):
    slug = problem['stat']['question__title_slug']
    print(f"Scraping {idx+1}/{len(free_problems)}: {slug}")
    
    # GraphQL query for core data
    graphql_query = {
        "operationName": "questionData",
        "variables": {"titleSlug": slug},
        "query": """
            query questionData($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    questionId
                    title
                    content
                    difficulty
                    likes
                    dislikes
                    topicTags { name }
                    hints
                    similarQuestions
                    codeSnippets { lang code }
                }
            }
        """
    }
    graphql_url = "https://leetcode.com/graphql"
    response = get_with_retry(graphql_url, method='post', data=graphql_query)
    q_data = response.json()['data']['question']
    
    # Parse HTML content for examples and constraints (creative parsing for edge cases)
    soup = BeautifulSoup(q_data['content'], 'html.parser')
    examples = []
    input_constraints = []
    pre_tags = soup.find_all('pre')  # Examples are in <pre>
    for pre in pre_tags:
        text = pre.text.strip()
        if 'Input:' in text and 'Output:' in text:
            parts = text.split('\n')
            input_val = parts[0].replace('Input:', '').strip() if parts else ''
            output_val = parts[1].replace('Output:', '').strip() if len(parts) > 1 else ''
            explanation = ' '.join(parts[2:]).replace('Explanation:', '').strip() if len(parts) > 2 else ''
            examples.append({
                "input": input_val,
                "output": output_val,
                "explanation": explanation
            })
    ul_tags = soup.find_all('ul')  # Constraints often in <ul>
    for ul in ul_tags:
        for li in ul.find_all('li'):
            input_constraints.append(li.text.strip())
    
    # Map to exact schema (defaults for unavailable fields)
    problem_data = {
        "_id": str(ObjectId()),  # Generate MongoDB-like ID
        "problemId": slug,
        "title": q_data['title'],
        "description": q_data['content'],  # Full HTML statement
        "difficulty": q_data['difficulty'],
        "topics": [tag['name'] for tag in q_data['topicTags']],
        "subtopics": [],  # Not available in public API
        "companies": [],  # Not available without premium/login; edge case: empty
        "frequency": 0,  # Not available publicly
        "likes": q_data['likes'],
        "dislikes": q_data['dislikes'],
        "constraints": {
            "timeLimit": 0,  # Not in public API; default
            "memoryLimit": 0,  # Not in public API; default
            "inputConstraints": input_constraints  # Parsed
        },
        "examples": examples,  # Parsed (handles missing/no examples)
        "hints": q_data['hints'],
        "solutions": [],  # Limitation: Full solutions require premium; can't scrape without login
        "testCases": [{"input": ex["input"], "expectedOutput": ex["output"], "isHidden": False, "explanation": ex["explanation"]} for ex in examples],  # Derived from examples; no hidden cases publicly
        "editorialContent": {
            "intuition": "",
            "approach": "",
            "complexity": "",
            "followUp": []
        },  # Limitation: Premium only
        "relatedProblems": [sim['titleSlug'] for sim in json.loads(q_data['similarQuestions'] or '[]')],  # Parsed from similarQuestions
        "aiLearningContent": {
            "conceptsRequired": [],
            "commonMistakes": [],
            "teachingPoints": [],
            "analogies": []
        },  # Not available
        "statistics": {
            "totalAttempts": 0,
            "totalSolutions": 0,
            "accuracyRate": 0,
            "averageTimeToSolve": 0,
            "languageDistribution": {
                "cpp": 0,
                "java": 0,
                "python": 0,
                "javascript": 0
            }
        },  # Limitation: Not public
        "isActive": True,
        "isPremium": problem['paid_only'],
        "unlockCriteria": {
            "prerequisiteProblems": [],
            "minUserLevel": "",
            "creditsRequired": 0
        },  # Defaults; not available
        "createdBy": str(ObjectId()),  # Placeholder
        "createdAt": current_date,
        "updatedAt": current_date,
        "lastModified": current_date
    }
    data_list.append(problem_data)
    
    time.sleep(random.uniform(5, 10))  # Delay to avoid detection

# Step 3: Save to JSON (or insert to MongoDB if you add code)
with open('leetcode_data.json', 'w') as f:
    json.dump(data_list, f, indent=4, default=str)  # Handle dates/ObjectId
print("Scraping complete. Data saved to leetcode_data.json.")
