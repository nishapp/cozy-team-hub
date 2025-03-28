
import { Post } from "@/types/post";

// Sample posts for demo
export const samplePosts: Post[] = [
  {
    id: "1",
    title: "Learning TypeScript",
    content: "<p>TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It adds additional syntax to JavaScript to support a tighter integration with your editor. This results in a more robust codebase and helps catch errors early.</p><p>Some key features of TypeScript include:</p><ul><li>Static typing</li><li>Type inference</li><li>Interfaces</li><li>Generics</li><li>Decorators</li></ul>",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["typescript", "javascript", "programming"],
    category: "coding",
    image_url: "https://miro.medium.com/v2/resize:fit:1400/1*mn6bOs7s6Qbao15PMNRyOA.png"
  },
  {
    id: "2",
    title: "React Hooks Deep Dive",
    content: "<p>React Hooks are functions that let you 'hook into' React state and lifecycle features from function components.</p><p>Common hooks include:</p><ul><li><strong>useState</strong>: Adds state to functional components</li><li><strong>useEffect</strong>: Handles side effects in functional components</li><li><strong>useContext</strong>: Subscribes to React context</li><li><strong>useRef</strong>: Creates a mutable reference</li><li><strong>useMemo &amp; useCallback</strong>: Optimize performance by memoizing values and functions</li></ul>",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["react", "hooks", "javascript"],
    category: "coding"
  }
];
