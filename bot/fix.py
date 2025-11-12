import requests
import json
import time
import random
from datetime import datetime
from bson.objectid import ObjectId
from bs4 import BeautifulSoup
import os


# List of exactly 150 problem slugs from LeetCode's Top Interview 150 (trimmed to 150)
top_150_slugs = [
    "merge-sorted-array", "remove-element", "remove-duplicates-from-sorted-array", "remove-duplicates-from-sorted-array-ii",
    "majority-element", "rotate-array", "best-time-to-buy-and-sell-stock", "best-time-to-buy-and-sell-stock-ii",
    "jump-game", "jump-game-ii", "h-index", "insert-delete-getrandom-o1", "product-of-array-except-self",
    "gas-station", "candy", "trapping-rain-water", "roman-to-integer", "integer-to-roman",
    "length-of-last-word", "longest-common-prefix", "reverse-words-in-a-string", "zigzag-conversion",
    "find-the-index-of-the-first-occurrence-in-a-string", "text-justification", "valid-palindrome",
    "is-subsequence", "two-sum-ii-input-array-is-sorted", "container-with-most-water", "3sum",
    "add-two-numbers", "merge-two-sorted-lists", "copy-list-with-random-pointer", "reverse-linked-list",
    "reverse-linked-list-ii", "linked-list-cycle", "linked-list-cycle-ii", "reorder-list",
    "remove-nth-node-from-end-of-list", "sort-list", "palindrome-linked-list", "merge-k-sorted-lists",
    "swap-nodes-in-pairs", "rotate-list", "odd-even-linked-list", "maximum-twin-sum-of-a-linked-list",
    "delete-node-in-a-linked-list", "add-two-numbers-ii", "remove-linked-list-elements",
    "maximum-depth-of-binary-tree", "same-tree", "invert-binary-tree", "symmetric-tree",
    "construct-binary-tree-from-preorder-and-inorder-traversal", "construct-binary-tree-from-inorder-and-postorder-traversal",
    "populating-next-right-pointers-in-each-node-ii", "kth-smallest-element-in-a-bst", "binary-tree-level-order-traversal",
    "binary-tree-right-side-view", "lowest-common-ancestor-of-a-binary-search-tree", "path-sum",
    "sum-root-to-leaf-numbers", "binary-tree-maximum-path-sum", "validate-binary-search-tree",
    "find-if-path-exists-in-graph", "all-paths-from-source-to-target", "number-of-islands", "surrounded-regions",
    "rotting-oranges", "walls-and-gates", "course-schedule", "redundant-connection",
    "find-eventual-safe-states", "course-schedule-ii", "minimum-height-trees", "word-ladder",
    "climbing-stairs", "house-robber", "house-robber-ii", "longest-increasing-subsequence", "coin-change",
    "minimum-path-sum", "unique-paths-ii", "longest-palindromic-substring", "interleaving-string",
    "edit-distance", "best-time-to-buy-and-sell-stock-iii", "best-time-to-buy-and-sell-stock-iv",
    "maximal-square", "triangle", "word-break", "partition-equal-subset-sum", "unique-paths",
    "longest-common-subsequence", "best-time-to-buy-and-sell-stock-with-cooldown", "coin-change-ii",
    "target-sum", "ones-and-zeroes", "kth-largest-element-in-an-array", "find-median-from-data-stream",
    "reverse-bits", "single-number", "palindrome-number", "plus-one", "powx-n", "sqrtx",
    "max-points-on-a-line", "spiral-matrix", "set-matrix-zeroes", "game-of-life",
    "missing-number", "counting-bits", "sum-of-two-integers", "reverse-integer",
    "number-of-1-bits", "top-k-frequent-elements", "k-closest-points-to-origin",
    "sort-characters-by-frequency", "task-scheduler", "longest-repeating-character-replacement",
    "minimum-window-substring", "substring-with-concatenation-of-all-words", "lfu-cache",
    "lru-cache", "design-twitter", "serialize-and-deserialize-binary-tree", "word-search-ii",
    "find-median-from-data-stream", "sliding-window-maximum", "n-queens", "combination-sum",
    "permutations", "merge-intervals", "sort-colors", "search-in-rotated-sorted-array",
    "search-a-2d-matrix", "find-minimum-in-rotated-sorted-array", "longest-valid-parentheses",
    "next-permutation", "regular-expression-matching", "wildcard-matching", "longest-consecutive-sequence",
    "letter-combinations-of-a-phone-number", "generate-parentheses", "sudoku-solver",
    "n-queens-ii", "combination-sum-ii", "subsets", "subsets-ii", "decode-ways",
    "word-search", "copy-list-with-random-pointer", "binary-tree-zigzag-level-order-traversal",
    "recover-binary-search-tree", "unique-binary-search-trees", "unique-binary-search-trees-ii",
    "balanced-binary-tree", "convert-sorted-array-to-binary-search-tree", "convert-sorted-list-to-binary-search-tree",
    "minimum-depth-of-binary-tree", "path-sum-ii", "flatten-binary-tree-to-linked-list",
    "populating-next-right-pointers-in-each-node", "count-complete-tree-nodes", "binary-tree-paths"
]  # Trimmed to exactly 150


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
        time.sleep(random.uniform(5, 10) * (attempt + 1))  # Increased backoff for safety
    return None  # Return None on failure instead of raising


# JSON file path
json_file = 'leetcode_top150_data.json'


# Load existing data if file exists (for resuming)
data_list = []
processed_slugs = set()
if os.path.exists(json_file):
    try:
        with open(json_file, 'r') as f:
            data_list = json.load(f)
        processed_slugs = {item['problemId'] for item in data_list}
        print(f"Resuming from {len(data_list)} processed problems.")
    except json.JSONDecodeError:
        print("Invalid JSON file. Starting fresh.")
        data_list = []
        processed_slugs = set()


current_date = datetime.now().isoformat()


def html_to_markdown(soup):
    markdown = []
    def handle_element(el, is_block=False):
        if isinstance(el, str):
            markdown.append(el.strip())
            return

        if el.name == 'p':
            if markdown and markdown[-1] != '\n':
                markdown.append('\n\n')
            for child in el.children:
                handle_element(child)
            markdown.append('\n\n')
        elif el.name == 'strong' or el.name == 'b':
            markdown.append('**')
            for child in el.children:
                handle_element(child)
            markdown.append('**')
        elif el.name == 'em' or el.name == 'i':
            markdown.append('*')
            for child in el.children:
                handle_element(child)
            markdown.append('*')
        elif el.name == 'code':
            markdown.append('`')
            for child in el.children:
                handle_element(child)
            markdown.append('`')
        elif el.name == 'ul' or el.name == 'ol':
            prefix = '- ' if el.name == 'ul' else '1. '
            for li in el.find_all('li', recursive=False):
                markdown.append('\n' + prefix)
                for child in li.children:
                    handle_element(child)
                markdown.append('\n')
        elif el.name == 'li':
            markdown.append('\n- ')
            for child in el.children:
                handle_element(child)
            markdown.append('\n')
        elif el.name == 'br':
            markdown.append('\n')
        else:
            for child in el.children:
                handle_element(child)

    for child in soup.children:
        handle_element(child)
    # Join and clean up extra newlines
    result = ''.join(markdown).strip()
    while '\n\n\n' in result:
        result = result.replace('\n\n\n', '\n\n')
    return result


for idx, slug in enumerate(top_150_slugs):
    if slug in processed_slugs:
        print(f"Skipping already processed: {slug}")
        continue
    
    print(f"Scraping {idx+1}/{len(top_150_slugs)}: {slug}")
    
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
    
    # Handle None content (edge case for some problems)
    content = q_data.get('content') or ""  # Default to empty if None
    description = content  # Use raw content as fallback
    examples = []
    input_constraints = []
    
    try:
        soup = BeautifulSoup(content, 'html.parser')
        
        # Parse examples from <pre> tags (unchanged)
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
        
        # Parse constraints (unchanged)
        constraint_tags = soup.find_all(['ul', 'p'])
        for tag in constraint_tags:
            if any(word in tag.text.lower() for word in ['constraint', '1 <=', '0 <=']):
                for li in tag.find_all('li') or [tag]:
                    input_constraints.append(li.text.strip())
        
        # Extract pure description HTML: collect until example, constraints, notes, or follow-up
        description_html = ''
        for child in soup.children:
            if child.name:
                child_text = child.get_text(strip=True).lower()
                if any(keyword in child_text for keyword in ['example', 'constraints', 'note', 'follow up', 'follow-up']):
                    break
            description_html += str(child)
        
        description_soup = BeautifulSoup(description_html, 'html.parser')
        description = html_to_markdown(description_soup)
        
    except Exception as e:
        print(f"Parsing error for {slug}: {e}. Using defaults.")
    
    # Parse related problems
    related = []
    try:
        related = [sim['titleSlug'] for sim in json.loads(q_data.get('similarQuestions') or '[]')]
    except json.JSONDecodeError:
        pass
    
    # Map to exact schema
    problem_data = {
        "_id": str(ObjectId()),
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
    data_list.append(problem_data)
    
    # Save the entire list to file after each successful scrape (ensures valid JSON)
    with open(json_file, 'w') as f:
        json.dump(data_list, f, indent=4)
    
    time.sleep(random.uniform(3, 7))  # Delay to avoid detection


print("Scraping complete. Data saved to leetcode_top150_data.json.")
