{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "defaults": {
    "questionsPerFile": 20,
    "temperature": 0.2,
    "overwrite": false,
    "maxRetries": 2
  },
  "output": {
    "enDir": "src/content/question-bank/en",
    "deDir": "src/content/question-bank/de"
  },
  "topics": [
    {
      "slug": "api-http",
      "title": "API and HTTP",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "http methods",
        "request and response",
        "status codes",
        "headers",
        "rest basics"
      ]
    },
    {
      "slug": "auth-security",
      "title": "Authentication and Security",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "authentication vs authorization",
        "password hashing",
        "sessions",
        "jwt basics",
        "basic web security"
      ]
    },
    {
      "slug": "databases-basics",
      "title": "Databases Basics",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "tables and rows",
        "primary keys",
        "relations",
        "sql basics",
        "data storage concepts"
      ]
    },
    {
      "slug": "docker-basics",
      "title": "Docker Basics",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "containers",
        "images",
        "dockerfile basics",
        "docker compose",
        "local development usage"
      ]
    },
    {
      "slug": "git-deployment",
      "title": "Git and Deployment",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "git commits",
        "branches",
        "merge basics",
        "deployment basics",
        "environment variables"
      ]
    },
    {
      "slug": "html-css",
      "title": "HTML and CSS",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "html structure",
        "semantic tags",
        "css selectors",
        "box model",
        "responsive basics"
      ]
    },
    {
      "slug": "javascript",
      "title": "JavaScript",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "variables",
        "scope",
        "functions",
        "arrays and objects",
        "promises"
      ]
    },
    {
      "slug": "nextjs-basics",
      "title": "Next.js Basics",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "app router basics",
        "server and client components",
        "routing",
        "data fetching basics",
        "api routes"
      ]
    },
    {
      "slug": "node-express",
      "title": "Node and Express",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "node runtime",
        "express basics",
        "middleware",
        "routing",
        "request handling"
      ]
    },
    {
      "slug": "orm-basics",
      "title": "ORM Basics",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "what orm is",
        "models",
        "queries",
        "migrations",
        "database abstraction"
      ]
    },
    {
      "slug": "react-basics",
      "title": "React Basics",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "components",
        "props",
        "state",
        "jsx",
        "event handling"
      ]
    },
    {
      "slug": "react-state-lifecycle",
      "title": "React State and Lifecycle",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "state updates",
        "useEffect basics",
        "render cycle basics",
        "controlled inputs",
        "component re-rendering"
      ]
    },
    {
      "slug": "testing-debugging",
      "title": "Testing and Debugging",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "unit testing basics",
        "manual debugging",
        "reading error messages",
        "console debugging",
        "test purpose"
      ]
    },
    {
      "slug": "typescript",
      "title": "TypeScript",
      "roleSlug": "junior-fullstack",
      "focusAreas": [
        "basic types",
        "interfaces",
        "function typing",
        "type safety",
        "typescript vs javascript"
      ]
    }
  ]
}