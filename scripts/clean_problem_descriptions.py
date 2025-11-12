import re
import json
import os

def clean_description(raw_description):
    """
    Cleans the raw LeetCode description so only the main statement remains.
    Removes all 'Example', 'Constraints', 'Follow up', and extra line breaks.
    """
    # Replace all '\n' with real newlines for parsing
    desc_text = raw_description.replace('\n', '\n').replace('\r', '')

    # Remove everything after 'Example', 'Examples', 'Constraints', or 'Follow up'
    # Supports both upper/lower case and variations
    cut_keywords = ['Example', 'Examples', 'Constraints', 'Follow up', 'Note']
    cut_pattern = re.compile('|'.join([re.escape(k) for k in cut_keywords]), re.IGNORECASE)
    match = cut_pattern.search(desc_text)
    if match:
        desc_text = desc_text[:match.start()]

    # Remove excessive blank lines, single-word lines or forced wrap between every word
    desc_lines = desc_text.split('\n')
    clean_lines = []
    for line in desc_lines:
        stripped = line.strip()
        # Ignore meaningless lines
        if stripped and not re.match(r'^[,.]*$', stripped):
            clean_lines.append(stripped)

    # Join with clean paragraph breaks
    clean_desc = '\n'.join(clean_lines)

    # Heuristic for highlighting: if a line is surrounded by newlines and is not empty, highlight it.
    # This is a simplification and might need refinement based on actual data patterns.
    highlighted_lines = []
    lines = clean_desc.split('\n')
    for i, line in enumerate(lines):
        stripped_line = line.strip()
        if stripped_line:
            # Check if it's a standalone line that might need highlighting
            # This is a heuristic, adjust as needed
            if i > 0 and i < len(lines) - 1 and not lines[i-1].strip() and not lines[i+1].strip():
                highlighted_lines.append(f'<span class="highlight">{stripped_line}</span>')
            else:
                highlighted_lines.append(stripped_line)
        else:
            highlighted_lines.append(stripped_line)
    clean_desc = '\n'.join(highlighted_lines)

    # Replace newlines with <br /> for HTML rendering
    clean_desc = clean_desc.replace('\n', '<br />')
    return clean_desc


def main():
    input_file = 'leetcode_top150_data.json'
    output_file = 'leetcode_top150_data_cleaned.json'

    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found.")
        return

    with open(input_file, 'r', encoding='utf-8') as f:
        problems = json.load(f)

    cleaned_problems = []
    for problem in problems:
        if 'description' in problem:
            problem['description'] = clean_description(problem['description'])
        cleaned_problems.append(problem)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cleaned_problems, f, indent=4, ensure_ascii=False)

    print(f"Cleaned descriptions saved to '{output_file}'")

if __name__ == '__main__':
    main()