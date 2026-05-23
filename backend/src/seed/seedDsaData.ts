import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { Topic } from '../models/Topic';
import { Problem } from '../models/Problem';
import { User } from '../models/User';

const TOPICS = [
  { title: 'Arrays & Hashing', slug: 'arrays', icon: '⬛', description: 'Foundation of DSA. Master arrays, hash maps, and their patterns.', order: 1 },
  { title: 'Strings', slug: 'strings', icon: '🔤', description: 'String manipulation, pattern matching, and sliding window techniques.', order: 2 },
  { title: 'Linked List', slug: 'linked-list', icon: '🔗', description: 'Pointer manipulation, fast & slow pointers, and list operations.', order: 3 },
  { title: 'Trees', slug: 'trees', icon: '🌳', description: 'Binary trees, BSTs, traversals, and tree dynamic programming.', order: 4 },
  { title: 'Graphs', slug: 'graphs', icon: '🕸️', description: 'BFS, DFS, topological sort, and shortest path algorithms.', order: 5 },
  { title: 'Dynamic Programming', slug: 'dp', icon: '💡', description: 'Memoization, tabulation, and recognising DP sub-problems.', order: 6 },
  { title: 'Sorting & Searching', slug: 'sorting', icon: '↕️', description: 'Binary search, sorting algorithms, and divide & conquer.', order: 7 },
  { title: 'Recursion & Backtracking', slug: 'recursion', icon: '🔄', description: 'Recursive thinking, backtracking, and pruning strategies.', order: 8 },
];

interface ProblemSeed {
  topicSlug: string;
  subtopic: string;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  resources: { youtubeUrl: string; leetcodeUrl: string; articleUrl: string; codeforcesUrl: string };
  tags: string[];
}

const PROBLEMS: ProblemSeed[] = [
  // ─── Arrays & Hashing ───────────────────────────────────────────────────────
  { topicSlug: 'arrays', subtopic: 'Basics', title: 'Two Sum', slug: 'two-sum', difficulty: 'easy', order: 1, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=KLlXCFG5TnA', leetcodeUrl: 'https://leetcode.com/problems/two-sum/', articleUrl: 'https://www.geeksforgeeks.org/given-an-array-a-and-a-number-x-check-for-pair-in-a-with-sum-as-x/', codeforcesUrl: '' }, tags: ['hash-map', 'array'] },
  { topicSlug: 'arrays', subtopic: 'Basics', title: 'Best Time to Buy and Sell Stock', slug: 'best-time-stock', difficulty: 'easy', order: 2, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=1pkOgXD63yU', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', articleUrl: 'https://www.geeksforgeeks.org/best-time-to-buy-and-sell-stock/', codeforcesUrl: '' }, tags: ['array', 'greedy'] },
  { topicSlug: 'arrays', subtopic: 'Basics', title: 'Contains Duplicate', slug: 'contains-duplicate', difficulty: 'easy', order: 3, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=3OamzN90kPg', leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/', articleUrl: 'https://www.geeksforgeeks.org/check-if-a-given-array-contains-duplicate-elements-within-k-distance-from-each-other/', codeforcesUrl: '' }, tags: ['hash-set', 'array'] },
  { topicSlug: 'arrays', subtopic: 'Basics', title: 'Product of Array Except Self', slug: 'product-array-except-self', difficulty: 'medium', order: 4, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=bNvIQI2wAjk', leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/', articleUrl: 'https://www.geeksforgeeks.org/a-product-array-puzzle/', codeforcesUrl: '' }, tags: ['array', 'prefix-sum'] },
  { topicSlug: 'arrays', subtopic: 'Sliding Window', title: "Maximum Subarray (Kadane's)", slug: 'maximum-subarray', difficulty: 'medium', order: 5, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=5WZl3MMT0Eg', leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/', articleUrl: 'https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/', codeforcesUrl: '' }, tags: ['array', 'dynamic-programming'] },
  { topicSlug: 'arrays', subtopic: 'Sliding Window', title: 'Longest Subarray with Sum K', slug: 'longest-subarray-sum-k', difficulty: 'medium', order: 6, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=frf7qxiN2qU', leetcodeUrl: '', articleUrl: 'https://www.geeksforgeeks.org/longest-sub-array-sum-k/', codeforcesUrl: '' }, tags: ['array', 'hash-map', 'prefix-sum'] },
  { topicSlug: 'arrays', subtopic: 'Sliding Window', title: 'Minimum Window Substring', slug: 'min-window-substring', difficulty: 'hard', order: 7, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=jSto0O4AJbM', leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/', articleUrl: 'https://www.geeksforgeeks.org/find-the-smallest-window-in-a-string-containing-all-characters-of-another-string/', codeforcesUrl: '' }, tags: ['sliding-window', 'hash-map'] },

  // ─── Strings ─────────────────────────────────────────────────────────────────
  { topicSlug: 'strings', subtopic: 'Fundamentals', title: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'easy', order: 1, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=9UtInBqnCgA', leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/', articleUrl: 'https://www.geeksforgeeks.org/check-whether-two-strings-are-anagram-of-each-other/', codeforcesUrl: '' }, tags: ['hash-map', 'string'] },
  { topicSlug: 'strings', subtopic: 'Fundamentals', title: 'Valid Palindrome', slug: 'valid-palindrome', difficulty: 'easy', order: 2, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=jJXJ16kPFWg', leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/', articleUrl: 'https://www.geeksforgeeks.org/check-if-a-string-is-palindrome/', codeforcesUrl: '' }, tags: ['two-pointer', 'string'] },
  { topicSlug: 'strings', subtopic: 'Fundamentals', title: 'Longest Palindromic Substring', slug: 'longest-palindromic-substring', difficulty: 'medium', order: 3, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=XYQecbcd6_c', leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/', articleUrl: 'https://www.geeksforgeeks.org/longest-palindrome-substring-set-1/', codeforcesUrl: '' }, tags: ['dynamic-programming', 'string'] },
  { topicSlug: 'strings', subtopic: 'Fundamentals', title: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'medium', order: 4, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=vzdNOK2oB2E', leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/', articleUrl: 'https://www.geeksforgeeks.org/given-a-sequence-of-words-print-all-anagrams-together/', codeforcesUrl: '' }, tags: ['hash-map', 'string', 'sorting'] },
  { topicSlug: 'strings', subtopic: 'Fundamentals', title: 'Longest Substring Without Repeating Chars', slug: 'longest-substring-no-repeat', difficulty: 'medium', order: 5, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=wiGpQwVHdE0', leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', articleUrl: 'https://www.geeksforgeeks.org/length-of-the-longest-substring-without-repeating-characters/', codeforcesUrl: '' }, tags: ['sliding-window', 'hash-set'] },
  { topicSlug: 'strings', subtopic: 'Fundamentals', title: 'Minimum Window Substring', slug: 'min-window-string', difficulty: 'hard', order: 6, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=jSto0O4AJbM', leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/', articleUrl: 'https://www.geeksforgeeks.org/find-the-smallest-window-in-a-string-containing-all-characters-of-another-string/', codeforcesUrl: '' }, tags: ['sliding-window', 'hash-map'] },

  // ─── Linked List ─────────────────────────────────────────────────────────────
  { topicSlug: 'linked-list', subtopic: 'Core Operations', title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'easy', order: 1, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=G0_I-ZF0S38', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/', articleUrl: 'https://www.geeksforgeeks.org/reverse-a-linked-list/', codeforcesUrl: '' }, tags: ['linked-list'] },
  { topicSlug: 'linked-list', subtopic: 'Core Operations', title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'easy', order: 2, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=XIdigk956u0', leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', articleUrl: 'https://www.geeksforgeeks.org/merge-two-sorted-linked-lists/', codeforcesUrl: '' }, tags: ['linked-list', 'two-pointer'] },
  { topicSlug: 'linked-list', subtopic: 'Core Operations', title: 'Linked List Cycle', slug: 'linked-list-cycle', difficulty: 'easy', order: 3, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=gBTe7lFR3vc', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/', articleUrl: 'https://www.geeksforgeeks.org/detect-loop-in-a-linked-list/', codeforcesUrl: '' }, tags: ['linked-list', 'slow-fast-pointer'] },
  { topicSlug: 'linked-list', subtopic: 'Core Operations', title: 'Remove N-th Node From End', slug: 'remove-nth-node', difficulty: 'medium', order: 4, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=XVuQxVej6y8', leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', articleUrl: 'https://www.geeksforgeeks.org/remove-nth-node-from-end-of-the-linked-list/', codeforcesUrl: '' }, tags: ['linked-list', 'two-pointer'] },
  { topicSlug: 'linked-list', subtopic: 'Advanced', title: 'Reorder List', slug: 'reorder-list', difficulty: 'medium', order: 5, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=S5bfdUTrKLM', leetcodeUrl: 'https://leetcode.com/problems/reorder-list/', articleUrl: 'https://www.geeksforgeeks.org/rearrange-a-given-linked-list-in-place/', codeforcesUrl: '' }, tags: ['linked-list', 'slow-fast-pointer'] },
  { topicSlug: 'linked-list', subtopic: 'Advanced', title: 'LRU Cache', slug: 'lru-cache', difficulty: 'medium', order: 6, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=7ABFKPK2hD4', leetcodeUrl: 'https://leetcode.com/problems/lru-cache/', articleUrl: 'https://www.geeksforgeeks.org/lru-cache-implementation/', codeforcesUrl: '' }, tags: ['hash-map', 'doubly-linked-list', 'design'] },
  { topicSlug: 'linked-list', subtopic: 'Advanced', title: 'Merge K Sorted Lists', slug: 'merge-k-sorted-lists', difficulty: 'hard', order: 7, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=q5a5OiGbT6Q', leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', articleUrl: 'https://www.geeksforgeeks.org/merge-k-sorted-linked-lists-set-2-using-min-heap/', codeforcesUrl: '' }, tags: ['linked-list', 'heap', 'divide-and-conquer'] },
  { topicSlug: 'linked-list', subtopic: 'Advanced', title: 'Reverse Nodes in K-Group', slug: 'reverse-nodes-k-group', difficulty: 'hard', order: 8, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=Of0HPkk3JgI', leetcodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', articleUrl: 'https://www.geeksforgeeks.org/reverse-a-list-in-groups-of-given-size/', codeforcesUrl: '' }, tags: ['linked-list', 'recursion'] },

  // ─── Trees ───────────────────────────────────────────────────────────────────
  { topicSlug: 'trees', subtopic: 'Binary Trees', title: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'easy', order: 1, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=OnSn2XEQ4MY', leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/', articleUrl: 'https://www.geeksforgeeks.org/write-an-efficient-c-function-to-convert-a-tree-into-its-mirror-tree/', codeforcesUrl: '' }, tags: ['tree', 'recursion', 'bfs'] },
  { topicSlug: 'trees', subtopic: 'Binary Trees', title: 'Maximum Depth of Binary Tree', slug: 'max-depth-binary-tree', difficulty: 'easy', order: 2, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=hTM3phVI6YQ', leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', articleUrl: 'https://www.geeksforgeeks.org/write-a-c-program-to-find-the-maximum-depth-or-height-of-a-tree/', codeforcesUrl: '' }, tags: ['tree', 'recursion', 'dfs'] },
  { topicSlug: 'trees', subtopic: 'Binary Trees', title: 'Same Tree', slug: 'same-tree', difficulty: 'easy', order: 3, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=vRbbcKXCxOw', leetcodeUrl: 'https://leetcode.com/problems/same-tree/', articleUrl: 'https://www.geeksforgeeks.org/write-c-code-to-determine-if-two-trees-are-identical/', codeforcesUrl: '' }, tags: ['tree', 'recursion'] },
  { topicSlug: 'trees', subtopic: 'Binary Trees', title: 'Level Order Traversal', slug: 'level-order-traversal', difficulty: 'medium', order: 4, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=6ZnyEApgFYg', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', articleUrl: 'https://www.geeksforgeeks.org/level-order-tree-traversal/', codeforcesUrl: '' }, tags: ['tree', 'bfs', 'queue'] },
  { topicSlug: 'trees', subtopic: 'Binary Trees', title: 'Binary Tree Right Side View', slug: 'binary-tree-right-side-view', difficulty: 'medium', order: 5, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=d4zLyf32e3I', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/', articleUrl: 'https://www.geeksforgeeks.org/print-right-view-binary-tree-2/', codeforcesUrl: '' }, tags: ['tree', 'bfs', 'dfs'] },
  { topicSlug: 'trees', subtopic: 'BST', title: 'Validate BST', slug: 'validate-bst', difficulty: 'medium', order: 6, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=s6ATEkipzow', leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/', articleUrl: 'https://www.geeksforgeeks.org/a-program-to-check-if-a-binary-tree-is-bst-or-not/', codeforcesUrl: '' }, tags: ['bst', 'dfs', 'recursion'] },
  { topicSlug: 'trees', subtopic: 'BST', title: 'Kth Smallest Element in BST', slug: 'kth-smallest-bst', difficulty: 'medium', order: 7, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=9TJYWh0adfk', leetcodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', articleUrl: 'https://www.geeksforgeeks.org/find-k-th-smallest-element-in-bst-order-statistics-in-bst/', codeforcesUrl: '' }, tags: ['bst', 'inorder', 'dfs'] },
  { topicSlug: 'trees', subtopic: 'BST', title: 'Serialize and Deserialize Binary Tree', slug: 'serialize-deserialize-tree', difficulty: 'hard', order: 8, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=u4JAi2JJhI8', leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', articleUrl: 'https://www.geeksforgeeks.org/serialize-deserialize-binary-tree/', codeforcesUrl: '' }, tags: ['tree', 'bfs', 'dfs', 'design'] },

  // ─── Graphs ──────────────────────────────────────────────────────────────────
  { topicSlug: 'graphs', subtopic: 'BFS / DFS', title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'medium', order: 1, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=pV2kpPD66nE', leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/', articleUrl: 'https://www.geeksforgeeks.org/find-number-of-islands/', codeforcesUrl: '' }, tags: ['graph', 'bfs', 'dfs', 'union-find'] },
  { topicSlug: 'graphs', subtopic: 'BFS / DFS', title: 'Clone Graph', slug: 'clone-graph', difficulty: 'medium', order: 2, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=mQeF6bN8hMk', leetcodeUrl: 'https://leetcode.com/problems/clone-graph/', articleUrl: 'https://www.geeksforgeeks.org/clone-an-undirected-graph/', codeforcesUrl: '' }, tags: ['graph', 'bfs', 'dfs', 'hash-map'] },
  { topicSlug: 'graphs', subtopic: 'BFS / DFS', title: 'Max Area of Island', slug: 'max-area-island', difficulty: 'medium', order: 3, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=iJGr1OtmH0c', leetcodeUrl: 'https://leetcode.com/problems/max-area-of-island/', articleUrl: 'https://www.geeksforgeeks.org/find-the-largest-area-rectangular-sub-matrix-with-equal-number-of-1s-and-0s/', codeforcesUrl: '' }, tags: ['graph', 'dfs'] },
  { topicSlug: 'graphs', subtopic: 'BFS / DFS', title: 'Pacific Atlantic Water Flow', slug: 'pacific-atlantic-water-flow', difficulty: 'medium', order: 4, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=s-VkcjyLDIE', leetcodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', articleUrl: 'https://www.geeksforgeeks.org/water-flow-problem/', codeforcesUrl: '' }, tags: ['graph', 'dfs', 'bfs'] },
  { topicSlug: 'graphs', subtopic: 'Advanced Graphs', title: 'Course Schedule (Topological Sort)', slug: 'course-schedule', difficulty: 'medium', order: 5, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=EgI5nU9etnU', leetcodeUrl: 'https://leetcode.com/problems/course-schedule/', articleUrl: 'https://www.geeksforgeeks.org/topological-sorting/', codeforcesUrl: '' }, tags: ['graph', 'topological-sort', 'cycle-detection'] },
  { topicSlug: 'graphs', subtopic: 'Advanced Graphs', title: "Dijkstra's Shortest Path", slug: 'dijkstra-shortest-path', difficulty: 'hard', order: 6, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=_lHSawdgXpI', leetcodeUrl: 'https://leetcode.com/problems/network-delay-time/', articleUrl: 'https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/', codeforcesUrl: '' }, tags: ['graph', 'shortest-path', 'heap'] },
  { topicSlug: 'graphs', subtopic: 'Advanced Graphs', title: 'Word Ladder', slug: 'word-ladder', difficulty: 'hard', order: 7, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=M9cVl4d0v3s', leetcodeUrl: 'https://leetcode.com/problems/word-ladder/', articleUrl: 'https://www.geeksforgeeks.org/word-ladder-length-of-shortest-chain-to-reach-a-target-word/', codeforcesUrl: '' }, tags: ['graph', 'bfs'] },

  // ─── Dynamic Programming ─────────────────────────────────────────────────────
  { topicSlug: 'dp', subtopic: '1D DP', title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'easy', order: 1, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=Y0lT9Fck7qI', leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/', articleUrl: 'https://www.geeksforgeeks.org/count-ways-reach-nth-stair/', codeforcesUrl: '' }, tags: ['dynamic-programming', 'fibonacci'] },
  { topicSlug: 'dp', subtopic: '1D DP', title: 'House Robber', slug: 'house-robber', difficulty: 'medium', order: 2, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=73r3KWiEvyk', leetcodeUrl: 'https://leetcode.com/problems/house-robber/', articleUrl: 'https://www.geeksforgeeks.org/find-maximum-possible-stolen-value-houses/', codeforcesUrl: '' }, tags: ['dynamic-programming'] },
  { topicSlug: 'dp', subtopic: '1D DP', title: 'Coin Change', slug: 'coin-change', difficulty: 'medium', order: 3, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=H9bfqozjoqs', leetcodeUrl: 'https://leetcode.com/problems/coin-change/', articleUrl: 'https://www.geeksforgeeks.org/coin-change-dp-7/', codeforcesUrl: '' }, tags: ['dynamic-programming', 'unbounded-knapsack'] },
  { topicSlug: 'dp', subtopic: '1D DP', title: 'Longest Increasing Subsequence', slug: 'lis', difficulty: 'medium', order: 4, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=cjWnW0hdF1Y', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/', articleUrl: 'https://www.geeksforgeeks.org/longest-increasing-subsequence-dp-3/', codeforcesUrl: '' }, tags: ['dynamic-programming', 'binary-search'] },
  { topicSlug: 'dp', subtopic: '2D DP', title: 'Unique Paths', slug: 'unique-paths', difficulty: 'medium', order: 5, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=IlEsdxuD4lY', leetcodeUrl: 'https://leetcode.com/problems/unique-paths/', articleUrl: 'https://www.geeksforgeeks.org/count-possible-paths-top-left-bottom-right-nxm-matrix/', codeforcesUrl: '' }, tags: ['dynamic-programming', 'combinatorics'] },
  { topicSlug: 'dp', subtopic: '2D DP', title: 'Longest Common Subsequence', slug: 'lcs', difficulty: 'medium', order: 6, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=Ua0GhsJSlWM', leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/', articleUrl: 'https://www.geeksforgeeks.org/longest-common-subsequence-dp-4/', codeforcesUrl: '' }, tags: ['dynamic-programming', 'string'] },
  { topicSlug: 'dp', subtopic: '2D DP', title: 'Edit Distance', slug: 'edit-distance', difficulty: 'hard', order: 7, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=XYi2-LPrwm4', leetcodeUrl: 'https://leetcode.com/problems/edit-distance/', articleUrl: 'https://www.geeksforgeeks.org/edit-distance-dp-5/', codeforcesUrl: '' }, tags: ['dynamic-programming', 'string'] },
  { topicSlug: 'dp', subtopic: '2D DP', title: '0/1 Knapsack', slug: '01-knapsack', difficulty: 'hard', order: 8, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=8LusJS5-AGo', leetcodeUrl: '', articleUrl: 'https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/', codeforcesUrl: '' }, tags: ['dynamic-programming', 'knapsack'] },

  // ─── Sorting & Searching ─────────────────────────────────────────────────────
  { topicSlug: 'sorting', subtopic: 'Binary Search', title: 'Binary Search', slug: 'binary-search', difficulty: 'easy', order: 1, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=s4DPM8ct1pI', leetcodeUrl: 'https://leetcode.com/problems/binary-search/', articleUrl: 'https://www.geeksforgeeks.org/binary-search/', codeforcesUrl: '' }, tags: ['binary-search', 'array'] },
  { topicSlug: 'sorting', subtopic: 'Binary Search', title: 'Search in Rotated Sorted Array', slug: 'search-rotated-sorted', difficulty: 'medium', order: 2, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=U8XENwh8Oy8', leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', articleUrl: 'https://www.geeksforgeeks.org/search-an-element-in-a-sorted-and-pivoted-array/', codeforcesUrl: '' }, tags: ['binary-search', 'array'] },
  { topicSlug: 'sorting', subtopic: 'Binary Search', title: 'Find Minimum in Rotated Sorted Array', slug: 'find-min-rotated', difficulty: 'medium', order: 3, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=nIVW4P8b1VA', leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', articleUrl: 'https://www.geeksforgeeks.org/find-minimum-element-in-a-sorted-and-rotated-array/', codeforcesUrl: '' }, tags: ['binary-search', 'array'] },
  { topicSlug: 'sorting', subtopic: 'Binary Search', title: 'Median of Two Sorted Arrays', slug: 'median-two-sorted', difficulty: 'hard', order: 4, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=q6IEA26hvXc', leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', articleUrl: 'https://www.geeksforgeeks.org/median-of-two-sorted-arrays/', codeforcesUrl: '' }, tags: ['binary-search', 'divide-and-conquer'] },
  { topicSlug: 'sorting', subtopic: 'Sorting Algorithms', title: 'Merge Sort Implementation', slug: 'merge-sort', difficulty: 'medium', order: 5, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=4VqmGXwpLqc', leetcodeUrl: 'https://leetcode.com/problems/sort-an-array/', articleUrl: 'https://www.geeksforgeeks.org/merge-sort/', codeforcesUrl: '' }, tags: ['sorting', 'divide-and-conquer', 'recursion'] },
  { topicSlug: 'sorting', subtopic: 'Sorting Algorithms', title: 'Quick Sort Implementation', slug: 'quick-sort', difficulty: 'medium', order: 6, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=7h1s2SojIRw', leetcodeUrl: 'https://leetcode.com/problems/sort-an-array/', articleUrl: 'https://www.geeksforgeeks.org/quick-sort/', codeforcesUrl: '' }, tags: ['sorting', 'divide-and-conquer', 'partitioning'] },
  { topicSlug: 'sorting', subtopic: 'Sorting Algorithms', title: 'Sort Colors (Dutch Flag)', slug: 'sort-colors', difficulty: 'medium', order: 7, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=oaVa-9wmpns', leetcodeUrl: 'https://leetcode.com/problems/sort-colors/', articleUrl: 'https://www.geeksforgeeks.org/sort-an-array-of-0s-1s-and-2s/', codeforcesUrl: '' }, tags: ['array', 'two-pointer', 'sorting'] },

  // ─── Recursion & Backtracking ─────────────────────────────────────────────────
  { topicSlug: 'recursion', subtopic: 'Backtracking', title: 'Subsets', slug: 'subsets', difficulty: 'medium', order: 1, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=REOH22Xwdkk', leetcodeUrl: 'https://leetcode.com/problems/subsets/', articleUrl: 'https://www.geeksforgeeks.org/power-set/', codeforcesUrl: '' }, tags: ['backtracking', 'recursion'] },
  { topicSlug: 'recursion', subtopic: 'Backtracking', title: 'Permutations', slug: 'permutations', difficulty: 'medium', order: 2, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=s7AvT7cGdSo', leetcodeUrl: 'https://leetcode.com/problems/permutations/', articleUrl: 'https://www.geeksforgeeks.org/write-a-c-program-to-print-all-permutations-of-a-given-string/', codeforcesUrl: '' }, tags: ['backtracking', 'recursion'] },
  { topicSlug: 'recursion', subtopic: 'Backtracking', title: 'Combination Sum', slug: 'combination-sum', difficulty: 'medium', order: 3, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=GBKI9VSKdGg', leetcodeUrl: 'https://leetcode.com/problems/combination-sum/', articleUrl: 'https://www.geeksforgeeks.org/combinational-sum/', codeforcesUrl: '' }, tags: ['backtracking', 'recursion'] },
  { topicSlug: 'recursion', subtopic: 'Backtracking', title: 'Word Search', slug: 'word-search', difficulty: 'medium', order: 4, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=pfiQ_PS1g8E', leetcodeUrl: 'https://leetcode.com/problems/word-search/', articleUrl: 'https://www.geeksforgeeks.org/search-a-word-in-a-2d-grid-of-characters/', codeforcesUrl: '' }, tags: ['backtracking', 'dfs', 'matrix'] },
  { topicSlug: 'recursion', subtopic: 'Backtracking', title: 'N-Queens', slug: 'n-queens', difficulty: 'hard', order: 5, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=Ph95IHmRp5M', leetcodeUrl: 'https://leetcode.com/problems/n-queens/', articleUrl: 'https://www.geeksforgeeks.org/n-queen-problem-backtracking-3/', codeforcesUrl: '' }, tags: ['backtracking', 'recursion'] },
  { topicSlug: 'recursion', subtopic: 'Backtracking', title: 'Sudoku Solver', slug: 'sudoku-solver', difficulty: 'hard', order: 6, resources: { youtubeUrl: 'https://www.youtube.com/watch?v=G_UYXzGuqvM', leetcodeUrl: 'https://leetcode.com/problems/sudoku-solver/', articleUrl: 'https://www.geeksforgeeks.org/sudoku-backtracking-7/', codeforcesUrl: '' }, tags: ['backtracking', 'recursion', 'constraint-propagation'] },
];

async function seed(): Promise<void> {
  console.log('🌱 Connecting to database...');
  await mongoose.connect(env.MONGODB_URI);

  console.log('🗑️  Clearing existing data...');
  await Promise.all([Topic.deleteMany({}), Problem.deleteMany({})]);

  console.log('📚 Inserting topics...');
  const topics = await Topic.insertMany(TOPICS);
  const topicMap = new Map(topics.map((t) => [t.slug, t._id]));

  console.log('📝 Inserting problems...');
  const problems = PROBLEMS.map((p) => ({
    ...p,
    topicId: topicMap.get(p.topicSlug),
  }));
  await Problem.insertMany(problems);

  console.log('📊 Updating problem counts...');
  for (const topic of topics) {
    const count = await Problem.countDocuments({ topicId: topic._id });
    await Topic.findByIdAndUpdate(topic._id, { problemCount: count });
  }

  console.log('👤 Creating seed users...');
  const demoHash = await bcrypt.hash('Demo@1234', 12);
  const adminHash = await bcrypt.hash('Admin@1234', 12);

  await User.findOneAndUpdate(
    { email: 'demo@codepath.com' },
    { name: 'Demo User', email: 'demo@codepath.com', passwordHash: demoHash, role: 'student' },
    { upsert: true }
  );

  await User.findOneAndUpdate(
    { email: 'admin@codepath.com' },
    { name: 'Admin User', email: 'admin@codepath.com', passwordHash: adminHash, role: 'admin' },
    { upsert: true }
  );

  console.log(`✅ Seed complete! ${topics.length} topics, ${problems.length} problems.`);
  console.log('   Demo  → demo@codepath.com / Demo@1234');
  console.log('   Admin → admin@codepath.com / Admin@1234');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
