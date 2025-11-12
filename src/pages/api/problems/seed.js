import dbConnect from '../../../lib/mongodb';
import Problem from '../../../models/Problem';

const sampleProblems = [
  {
    problemId: '1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'Easy',
    topics: ['Array', 'Hash Table'],
    subtopics: ['Two Pointers'],
    companies: ['Google', 'Amazon', 'Facebook'],
    likes: 1500,
    dislikes: 50,
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputConstraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
    },
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
    ],
    solutions: [
      {
        approach: 'Brute Force',
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(1)',
        description: 'Iterate through each element x and find if there is another value that equals to target - x.',
        code: {
          python: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        for i in range(len(nums)):\n            for j in range(i + 1, len(nums)):\n                if nums[j] == target - nums[i]:\n                    return [i, j]'
        },
      },
    ],
  },
  {
    problemId: '2',
    title: 'Add Two Numbers',
    description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
    difficulty: 'Medium',
    topics: ['Linked List', 'Math'],
    subtopics: ['Recursion'],
    companies: ['Microsoft', 'Apple', 'LinkedIn'],
    likes: 1200,
    dislikes: 40,
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputConstraints: ['The number of nodes in each linked list is in the range [1, 100].', '0 <= Node.val <= 9', 'It is guaranteed that the list represents a number that does not have leading zeros.'],
    },
    examples: [
      {
        input: 'l1 = [2,4,3], l2 = [5,6,4]',
        output: '[7,0,8]',
        explanation: '342 + 465 = 807.',
      },
    ],
    solutions: [
      {
        approach: 'Elementary Math',
        timeComplexity: 'O(max(m,n))',
        spaceComplexity: 'O(max(m,n))',
        description: 'Keep track of the carry and simulate the sum digit by digit from the head of the lists.',
        code: {
          python: 'class Solution:\n    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:\n        dummyHead = ListNode(0)\n        curr = dummyHead
        carry = 0
        while l1 != None or l2 != None or carry != 0:\n            l1Val = l1.val if l1 else 0
            l2Val = l2.val if l2 else 0
            columnSum = l1Val + l2Val + carry
            carry = columnSum // 10
            newNode = ListNode(columnSum % 10)
            curr.next = newNode
            curr = newNode
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None
        return dummyHead.next'
        },
      },
    ],
  },
];

export default async function handler(req, res) {
  await dbConnect();

  try {
    await Problem.deleteMany({});
    await Problem.insertMany(sampleProblems);
    res.status(200).json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
