import requests
import json
import time
import random
from datetime import datetime
from bson.objectid import ObjectId
from bs4 import BeautifulSoup
import os

# List of problem slugs to scrape (exactly the ones from your query)
slugs_to_scrape = [
    "merge-sorted-array",
    "remove-element",
    "remove-duplicates-from-sorted-array",
    "remove-duplicates-from-sorted-array-ii",
    "majority-element",
    "rotate-array",
    "best-time-to-buy-and-sell-stock",
    "best-time-to-buy-and-sell-stock-ii",
    "jump-game",
    "jump-game-ii",
    "h-index",
    "insert-delete-getrandom-o1",
    "product-of-array-except-self",
    "gas-station",
    "candy",
    "trapping-rain-water",
    "roman-to-integer",
    "integer-to-roman",
    "length-of-last-word",
    "longest-common-prefix",
    "reverse-words-in-a-string",
    "zigzag-conversion",
    "find-the-index-of-the-first-occurrence-in-a-string",
    "text-justification",
    "valid-palindrome",
    "is-subsequence",
    "two-sum-ii-input-array-is-sorted",
    "container-with-most-water",
    "3sum"
]  # 29 slugs

# JSON file path (update this to your actual file path if different)
json_file = 'leetcode_top150_data.json'

# Load existing data from JSON file
if os.path.exists(json_file):
    with open(json_file, 'r') as f:
        existing_data = json.load(f)
    print(f"Loaded {len(existing_data)} existing entries.")
else:
    existing_data = []
    print("No existing file found. Starting with empty list.")

user_agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
]

def get_with_retry(url, method='get', data=None, retries=3):
    for attempt in range(retries):
        try:
            headers = {'User-Agent': random.choice(user_agents)}
            if method == 'post':
                response = requests.post(url, json=data, headers=headers)
            else:
                response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response
            print(f"Retry {attempt+1}/{retries} for {url} - Status: {response.status_code}")
        except Exception as e:
            print(f"Error on attempt {attempt+1}: {e}")
        time.sleep(random.uniform(5, 10) * (attempt + 1))
    return None

current_date = datetime.now().isoformat()

# Create a dict for quick lookup of existing entries by problemId
existing_dict = {item['problemId']: (idx, item) for idx, item in enumerate(existing_data)}

for idx, slug in enumerate(slugs_to_scrape):
    print(f"Scraping {idx+1}/{len(slugs_to_scrape)}: {slug}")
    
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
                    isPaidOnly
                }
            }
        """
    }
    graphql_url = "https://leetcode.com/graphql"
    response = get_with_retry(graphql_url, method='post', data=graphql_query)
    if response is None:
        print(f"Failed to fetch data for {slug}. Skipping.")
        time.sleep(random.uniform(5, 10))
        continue
    
    q_data_raw = response.json()
    if 'data' not in q_data_raw or 'question' not in q_data_raw['data']:
        print(f"Invalid response for {slug}. Skipping.")
        time.sleep(random.uniform(5, 10))
        continue
    
    q_data = q_data_raw['data']['question']
    
    # Handle None content
    content = q_data.get('content') or ""
    description = content
    examples = []
    input_constraints = []
    
    try:
        soup = BeautifulSoup(content, 'html.parser')
        description = soup.get_text(separator='\n', strip=True)
        
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
                    explanation += ' ' + line.strip()
            if input_val and output_val:
                examples.append({
                    "input": input_val,
                    "output": output_val,
                    "explanation": explanation.strip()
                })
        
        constraint_tags = soup.find_all(['ul', 'p'])
        for tag in constraint_tags:
            if any(word in tag.text.lower() for word in ['constraint', '1 <=', '0 <=']):
                for li in tag.find_all('li') or [tag]:
                    input_constraints.append(li.text.strip())
    except Exception as e:
        print(f"Parsing error for {slug}: {e}. Using defaults.")
    
    related = []
    try:
        related = [sim['titleSlug'] for sim in json.loads(q_data.get('similarQuestions') or '[]')]
    except json.JSONDecodeError:
        pass
    
    # Create full problem data
    problem_data = {
        "_id": existing_dict.get(slug, (None, {}))[1].get('_id', str(ObjectId())),  # Preserve existing _id if present
        "problemId": slug,
        "title": q_data.get('title', ''),
        "description": description,
        "difficulty": q_data.get('difficulty', 'Unknown'),
        "topics": [tag['name'] for tag in q_data.get('topicTags', [])],
        "subtopics": [],
        "companies": [],
        "frequency": 0,
        "likes": q_data.get('likes', 0),
        "dislikes": q_data.get('dislikes', 0),
        "constraints": {
            "timeLimit": 0,
            "memoryLimit": 0,
            "inputConstraints": input_constraints
        },
        "examples": examples,
        "hints": q_data.get('hints', []),
        "solutions": [],
        "testCases": [{"input": ex["input"], "expectedOutput": ex["output"], "isHidden": False, "explanation": ex["explanation"]} for ex in examples],
        "editorialContent": {
            "intuition": "",
            "approach": "",
            "complexity": "",
            "followUp": []
        },
        "relatedProblems": related,
        "aiLearningContent": {
            "conceptsRequired": [],
            "commonMistakes": [],
            "teachingPoints": [],
            "analogies": []
        },
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
        },
        "isActive": True,
        "isPremium": q_data.get('isPaidOnly', False),
        "unlockCriteria": {
            "prerequisiteProblems": [],
            "minUserLevel": "",
            "creditsRequired": 0
        },
        "createdBy": str(ObjectId()),
        "createdAt": current_date,
        "updatedAt": current_date,
        "lastModified": current_date
    }
    
    # Update the existing list: Replace the matching entry
    if slug in existing_dict:
        entry_idx, _ = existing_dict[slug]
        existing_data[entry_idx] = problem_data
    else:
        # If not found, append (though unlikely based on your query)
        existing_data.append(problem_data)
    
    # Save the updated list back to the file immediately
    with open(json_file, 'w') as f:
        json.dump(existing_data, f, indent=4)
    print(f"Updated file with {slug}.")
    
    time.sleep(random.uniform(3, 7))  # Delay

print("Update complete. JSON file updated with details for the specified problems.")
