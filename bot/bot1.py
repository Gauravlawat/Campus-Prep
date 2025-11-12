import cloudscraper
import json
import time
import random
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from bson.objectid import ObjectId  # pip install pymongo

# Initialize Cloudflare bypassing scraper
scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'windows', 'mobile': False})

# User agents for rotation
user_agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
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
        time.sleep(random.uniform(3, 7) * (attempt + 1))  # Backoff
    raise Exception(f"Failed to fetch {url} after {retries} retries")

# Fetch list of all free problems
all_problems_url = "https://leetcode.com/api/problems/all/"
response = get_with_retry(all_problems_url)
all_problems = json.loads(response.text)['stat_status_pairs']
free_problems = [p for p in all_problems if not p['paid_only']][:40]
print(f"Found {len(free_problems)} free problems to scrape.")

# Scrape details for each
data_list = []
current_date = datetime.now()

for idx, problem in enumerate(free_problems):
    slug = problem['stat']['question__title_slug']
    print(f"Scraping {idx+1}/{len(free_problems)}: {slug}")
    
    # GraphQL for core data
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
                }
            }
        """
    }
    graphql_url = "https://leetcode.com/graphql"
    response = get_with_retry(graphql_url, method='post', data=graphql_query)
    q_data = response.json()['data']['question']
    
    # Parse HTML for precise examples and constraints
    soup = BeautifulSoup(q_data['content'], 'html.parser')
    examples = []
    input_constraints = []
    pre_tags = soup.find_all('pre')
    for pre in pre_tags:
        text = pre.text.strip()
        lines = text.split('\n')
        input_val = ''
        output_val = ''
        explanation = ''
        for line in lines:
            if line.startswith('Input:'):
                input_val = line.replace('Input:', '').strip()
            elif line.startswith('Output:'):
                output_val = line.replace('Output:', '').strip()
            elif line.startswith('Explanation:'):
                explanation = line.replace('Explanation:', '').strip()
            else:
                explanation += ' ' + line.strip()  # Multi-line explanations
        if input_val and output_val:
            examples.append({
                "input": input_val,
                "output": output_val,
                "explanation": explanation.strip()
            })
    constraint_tags = soup.find_all(['ul', 'p'])  # Flexible for varied formats
    for tag in constraint_tags:
        if any(word in tag.text.lower() for word in ['constraint', '1 <=', '0 <=']):
            for li in tag.find_all('li') or [tag]:
                input_constraints.append(li.text.strip())
    
    # Parse related problems from similarQuestions JSON
    related = [sim['titleSlug'] for sim in json.loads(q_data['similarQuestions'] or '[]')]
    
    # Map to exact schema with precise defaults
    problem_data = {
        "_id": str(ObjectId()),
        "problemId": slug,
        "title": q_data['title'],
        "description": soup.get_text(separator='\n', strip=True),  # Cleaned text version
        "difficulty": q_data['difficulty'],
        "topics": [tag['name'] for tag in q_data['topicTags']],
        "subtopics": [],  # Not explicitly available; empty
        "companies": [],  # Not public
        "frequency": 0,  # Not public
        "likes": q_data['likes'],
        "dislikes": q_data['dislikes'],
        "constraints": {
            "timeLimit": 0,  # Not public
            "memoryLimit": 0,  # Not public
            "inputConstraints": input_constraints
        },
        "examples": examples,
        "hints": q_data['hints'],
        "solutions": [],  # Premium only
        "testCases": [{"input": ex["input"], "expectedOutput": ex["output"], "isHidden": False, "explanation": ex["explanation"]} for ex in examples],
        "editorialContent": {
            "intuition": "",
            "approach": "",
            "complexity": "",
            "followUp": []
        },  # Premium only
        "relatedProblems": related,  # As slugs (not ObjectIds; adjust if inserting to DB)
        "aiLearningContent": {
            "conceptsRequired": [],
            "commonMistakes": [],
            "teachingPoints": [],
            "analogies": []
        },  # Not public
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
        },  # Premium only
        "isActive": True,
        "isPremium": problem['paid_only'],
        "unlockCriteria": {
            "prerequisiteProblems": [],
            "minUserLevel": "",
            "creditsRequired": 0
        },  # Not public
        "createdBy": str(ObjectId()),  # Placeholder
        "createdAt": current_date.isoformat(),
        "updatedAt": current_date.isoformat(),
        "lastModified": current_date.isoformat()
    }
    data_list.append(problem_data)
    
    time.sleep(random.uniform(3, 7))  # Delay for safety

# Save to JSON
with open('leetcode_data.json', 'w') as f:
    json.dump(data_list, f, indent=4)

print("Scraping complete. Data saved to leetcode_data.json.")
