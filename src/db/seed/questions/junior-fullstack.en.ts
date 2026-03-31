export const juniorFullstackEnQuestions = [
  {
    roleSlug: "junior-fullstack",
    topicSlug: "javascript",
    language: "en",
    difficulty: "EASY",
    questionText: "What is a variable in JavaScript?",
    referenceAnswer:
      "A variable in JavaScript is a named container used to store a value. We can use variables to keep data and reuse it later in the program. In modern JavaScript, we usually use let and const to declare variables.",
    keyPoints: [
      "stores a value",
      "named container",
      "used to reuse data later",
      "let and const are common declarations",
    ],
    tags: ["javascript", "variables", "basics"],
  },
  {
    roleSlug: "junior-fullstack",
    topicSlug: "javascript",
    language: "en",
    difficulty: "EASY",
    questionText: "What is the difference between let and const in JavaScript?",
    referenceAnswer:
      "Both let and const are used to declare variables in JavaScript. The difference is that a let variable can be reassigned, while a const variable cannot be reassigned after declaration. However, if const stores an object or array, the contents can still be changed.",
    keyPoints: [
      "both declare variables",
      "let can be reassigned",
      "const cannot be reassigned",
      "objects and arrays in const can still be mutated",
    ],
    tags: ["javascript", "let", "const", "basics"],
  },
  {
    roleSlug: "junior-fullstack",
    topicSlug: "html",
    language: "en",
    difficulty: "EASY",
    questionText: "What is HTML used for?",
    referenceAnswer:
      "HTML is used to define the structure and content of a web page. It organizes elements such as headings, paragraphs, images, links, forms, and sections so that the browser can display them properly.",
    keyPoints: [
      "defines page structure",
      "defines content",
      "browser displays elements based on HTML",
      "examples like headings paragraphs links forms",
    ],
    tags: ["html", "basics", "web"],
  },
] as const;