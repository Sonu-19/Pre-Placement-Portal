// Roadmap data for different technologies
const createStep = (id, title, duration, learn, tasks) => ({
  id, title, duration,
  whatYouWillLearn: learn,
  practiceTasks: tasks,
  resources: [
    { title: "Documentation (MDN)", link: "https://developer.mozilla.org/" }
  ]
});

export const roadmapData = {
  javascript: {
  title: "JavaScript",
  description: "Modern JavaScript programming language fundamentals and advanced concepts",
  totalSteps: 7,
  steps: [
    {
      id: 1,
      title: "JavaScript Basics",
      duration: "2 weeks",
      whatYouWillLearn: [
        "Variables and data types",
        "Operators and control flow",
        "Functions and scope"
      ],
      practiceTasks: [
        "Solve 30+ JavaScript challenges",
        "Build calculator app",
        "Create counter application"
      ],
      resources: [
        {
          type: "video",
          title: "JavaScript",
          src: "/videos/javascript.mp4"
        },
        {
          type: "youtube",
          title: "JavaScript Complete Course 2024",
          link: "https://www.youtube.com/watch?v=lkIFF4maKMU"
        }
      ]
    },

    {
      id: 2,
      title: "DOM Manipulation",
      duration: "2 weeks",
      whatYouWillLearn: [
        "DOM selection",
        "Event handling",
        "DOM modification"
      ],
      practiceTasks: [
        "Build interactive forms",
        "Create dynamic websites",
        "Handle user events"
      ],
      resources: [
        {
          type: "video",
          title: "DOM Manipulation",
          src: "/videos/dom.mp4"
        },
        {
          type: "youtube",
          title: "DOM Manipulation Tutorial",
          link: "https://youtu.be/5fb2aPlgoys?si=jK_EvoqrGUKfyhak"
        }
      ]
    },

    {
      id: 3,
      title: "Async Programming",
      duration: "2 weeks",
      whatYouWillLearn: [
        "Callbacks",
        "Promises",
        "Async/Await"
      ],
      practiceTasks: [
        "Work with APIs",
        "Handle errors",
        "Build async applications"
      ],
      resources: [
        {
          type: "video",
          title: "Async JavaScript",
          src: "/videos/async-js.mp4"
        },
        {
          type: "youtube",
          title: "Async JavaScript Explained",
          link: "https://youtu.be/e5LYnDE0yik?si=TjfwPP9po6AtZ5CI"
        }
      ]
    },

    {
      id: 4,
      title: "ES6+ Features",
      duration: "2 weeks",
      whatYouWillLearn: [
        "Arrow functions",
        "Destructuring",
        "Spread operator",
        "Classes"
      ],
      practiceTasks: [
        "Refactor code to ES6",
        "Use modern syntax",
        "Build class-based solutions"
      ],
      resources: [
        {
          type: "video",
          title: "ES6+ Features",
          src: "/videos/es6.mp4"
        },
        {
          type: "youtube",
          title: "ES6 Crash Course",
          link: "https://youtube.com/playlist?list=PLjVLYmrlmjGe3fUTOCarulICb3R8iAh4t&si=CIQLiIRWUH29pEz5c"
        }
      ]
    },

    {
      id: 5,
      title: "APIs and Fetch",
      duration: "2 weeks",
      whatYouWillLearn: [
        "Fetch API",
        "REST concepts",
        "JSON handling"
      ],
      practiceTasks: [
        "Build weather app",
        "Create API client",
        "Integrate real APIs"
      ],
      resources: [
        {
          type: "video",
          title: "Fetch API",
          src: "/videos/fetch-api.mp4"
        },
        {
          type: "youtube",
          title: "Fetch API Explained",
          link: "https://youtu.be/CyGodpqcid4?si=of0oMdeLhqsSpwn7"
        }
      ]
    },

    {
      id: 6,
      title: "Advanced JavaScript",
      duration: "3 weeks",
      whatYouWillLearn: [
        "Closures",
        "Prototypes",
        "Design patterns",
        "Performance optimization"
      ],
      practiceTasks: [
        "Optimize code",
        "Build reusable libraries",
        "Solve advanced problems"
      ],
      resources: [
        {
          type: "video",
          title: "Advanced JavaScript",
          src: "/videos/advanced-js.mp4"
        },
        {
          type: "youtube",
          title: "Advanced JavaScript Concepts",
          link: "https://youtube.com/playlist?list=PLfEr2kn3s-brmujLuaVPA_FTkflKbMc5x&si=Kgz_zucAKihuPyWy"
        }
      ]
    },

    {
      id: 7,
      title: "Certification — JavaScript",
      duration: "1 week",
      whatYouWillLearn: [
        "How to validate JavaScript skills",
        "Which certificates matter",
        "Preparing for certification exams"
      ],
      practiceTasks: [
        "Complete recommended courses",
        "Attempt practice exams",
        "Add certificate to LinkedIn"
      ],
      resources: [
        {
          type: "link",
          title: "freeCodeCamp JavaScript Certification",
          link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"
        },
        {
          type: "link",
          title: "MDN JavaScript Guide",
          link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
        },
        {
          type: "link",
          title: "Coursera JavaScript Courses",
          link: "https://www.coursera.org/search?query=javascript"
        }
      ]
    }
  ]
},
  mern: {
  title: "MERN Stack Mastery",
  description: "Complete Full-Stack Development with MongoDB, Express, React, and Node.js",
  totalSteps: 11,
  steps: [
    {
      id: 1,
      title: "HTML",
      duration: "1-2 weeks",
      whatYouWillLearn: [
        "HTML5 semantic elements and structure",
        "Forms, inputs, and validation",
        "SEO best practices",
        "Accessibility (a11y) fundamentals",
        "Meta tags and head elements"
      ],
      practiceTasks: [
        "Build a personal portfolio website (static)",
        "Create a responsive blog layout",
        "Build a contact form with proper structure",
        "Create a landing page mockup"
      ],
      resources: [
          {
          type: "video",
          title: "HTML Introduction ",
          src: "/videos/html-intro.mp4"
        },
        {
          type: "youtube",
          title: "HTML Full Course for Beginners",
          link: "https://youtu.be/BsDoLVMnmZs?si=j3Ek_YXx9q0G4a5f"
        }      
      ]
    },

    {
      id: 2,
      title: "CSS",
      duration: "2-3 weeks",
      whatYouWillLearn: [
        "CSS selectors and specificity",
        "Box model and layout (Flexbox, Grid)",
        "Responsive design and media queries",
        "CSS animations and transitions",
        "CSS preprocessors introduction"
      ],
      practiceTasks: [
        "Style your HTML portfolio with CSS",
        "Create a responsive navigation bar",
        "Build a card-based layout with Grid",
        "Create CSS animations and hover effects"
      ],
      resources: [
        {
          type: "video",
          title: "CSS Introduction ",
          src: "/videos/css-intro.mp4"
        },
        {
          type: "youtube",
          title: "CSS Complete Tutorial",
          link: "https://youtu.be/ESnrn1kAD4E?si=gFTqVUp-5q_Bicfc"
        }
      ]
    },

    {
      id: 3,
      title: "Bootstrap or Tailwind",
      duration: "1-2 weeks",
      whatYouWillLearn: [
        "Bootstrap grid system and components",
        "Tailwind CSS utility-first approach",
        "Pre-built components and customization",
        "Responsive design with frameworks",
        "Build faster with CSS frameworks"
      ],
      practiceTasks: [
        "Convert your portfolio to Bootstrap/Tailwind",
        "Build a multi-page website",
        "Create a landing page with components",
        "Customize framework components"
      ],
      resources: [
      
        {
          type: "youtube",
          title: "Bootstrap 5 Complete Course",
          link: "https://www.youtube.com/watch?v=4sosXZsdy-s"
        }
      ]
    },

    {
      id: 4,
      title: "JavaScript",
      duration: "3-4 weeks",
      whatYouWillLearn: [
        "ES6+ syntax and features",
        "DOM manipulation and events",
        "Async/await, Promises, callbacks",
        "Array and object methods",
        "Higher-order functions and closures",
        "APIs and fetch requests"
      ],
      practiceTasks: [
        "Build a to-do app with DOM manipulation",
        "Create a weather app using APIs",
        "Build a calculator with event listeners",
        "Implement a quiz application",
        "Create a notes app with localStorage"
      ],
      resources: [
        {
          type: "video",
          title: "JavaScript",
          src: "/videos/javascript.mp4"
        },
        {
          type: "youtube",
          title: "JavaScript Complete Course 2024",
          link: "https://www.youtube.com/watch?v=lkIFF4maKMU"
        }
      ]
    },

    {
      id: 5,
      title: "React.js",
      duration: "3-4 weeks",
      whatYouWillLearn: [
        "Components and JSX",
        "Props and State management",
        "Hooks (useState, useEffect, useContext)",
        "Component lifecycle",
        "React Router for navigation",
        "Conditional rendering and lists"
      ],
      practiceTasks: [
        "Build a movie search app",
        "Create a personal dashboard",
        "Build a multi-page blog",
        "Create a e-commerce product page",
        "Build a task management app"
      ],
      resources: [
        {
          type: "video",
          title: "React.js",
          src: "/videos/react.mp4"
        },
   {
          type: "youtube",
          title: "React Complete Course 2024",
          link: "https://www.youtube.com/watch?v=w7ejDZ8SWv8"
        }
      ]
    },

    {
      id: 6,
      title: "Node.js",
      duration: "2-3 weeks",
      whatYouWillLearn: [
        "Node.js fundamentals and modules",
        "File system and streams",
        "NPM and package management",
        "Creating servers and handling requests",
        "Environment variables and configuration",
        "Debugging and error handling"
      ],
      practiceTasks: [
        "Build a basic web server",
        "Create a CLI tool",
        "Build a file management system",
        "Create a simple API server",
        "Implement middleware and routing"
      ],
      resources: [
         {
          type: "video",
          title: "Node.js",
          src: "/videos/node.mp4"
        },
        {
          type: "youtube",
          title: "Node.js Complete Tutorial",
          link: "https://www.youtube.com/watch?v=TlB_eWDSMzU"
        }
      ]
    },

    {
      id: 7,
      title: "Express.js",
      duration: "2-3 weeks",
      whatYouWillLearn: [
        "Express fundamentals and routing",
        "Middleware and request/response handling",
        "REST API design principles",
        "Error handling and validation",
        "Authentication and authorization",
        "CORS and security best practices"
      ],
      practiceTasks: [
        "Build a RESTful API for a blog",
        "Create user authentication system",
        "Implement CRUD operations",
        "Build an e-commerce API",
        "Create a notes API with user auth"
      ],
      resources: [
        {
          type: "video",
          title: "Express.js",
          src: "/videos/express.mp4"
        },
        {
          type: "youtube",
          title: "Express.js Complete Course",
          link: "https://www.youtube.com/watch?v=L72fhGm1tfE"
        }
      ]
    },

    {
      id: 8,
      title: "MongoDB",
      duration: "2-3 weeks",
      whatYouWillLearn: [
        "MongoDB fundamentals and CRUD operations",
        "Mongoose ODM and schemas",
        "Indexing and query optimization",
        "Aggregation pipeline",
        "Data modeling best practices",
        "Database design patterns"
      ],
      practiceTasks: [
        "Design and create a database schema",
        "Implement CRUD with Mongoose",
        "Create relationships between collections",
        "Write aggregation queries",
        "Optimize database queries"
      ],
      resources: [
        {
          type: "video",
          title: "MongoDB",
          src: "/videos/mongodb.mp4"
        },
        {
          type: "youtube",
          title: "MongoDB Complete Tutorial",
          link: "https://www.youtube.com/watch?v=ofme2o29ngU"
        }
      ]
    },

    {
      id: 9,
      title: "MERN Full Stack Projects",
      duration: "4-6 weeks",
      whatYouWillLearn: [
        "Connecting React frontend with Express backend",
        "State management across full stack",
        "Authentication and JWT tokens",
        "Deployment and DevOps basics",
        "Testing and debugging full stack",
        "Performance optimization"
      ],
      practiceTasks: [
        "Build a complete blog application",
        "Create an e-commerce platform",
        "Build a social media app",
        "Create a task management system",
        "Build a real-time chat application"
      ],
      resources: [
        {
          type: "youtube",
          title: "MERN Stack Complete Project",
          link: "https://youtube.com/playlist?list=PLI0saxAvhd_OdRWyprSe3Mln37H0u4DAp&si=OWXQIKpI7E1YMBdV"
        }
      ]
    },

    {
      id: 10,
      title: "DSA (Data Structures & Algorithms)",
      duration: "6-8 weeks",
      whatYouWillLearn: [
        "Arrays, Linked Lists, Stacks, Queues",
        "Trees, Graphs, and Hash Tables",
        "Sorting and searching algorithms",
        "Dynamic programming",
        "Time and space complexity analysis",
        "Problem-solving techniques"
      ],
      practiceTasks: [
        "Solve 100+ LeetCode problems",
        "Implement common data structures",
        "Solve medium-hard difficulty problems",
        "Practice on HackerRank",
        "Mock interview practice"
      ],
      resources: [
        {
          type: "video",
          title: "DSA",
          src: "/videos/dsa.mp4"
        },
        {
          type: "youtube",
          title: "DSA Complete Course in JavaScript",
          link: "https://youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU&si=HgN1m_hbQWa4qh3h"
        }
      ]
    },

    {
      id: 11,
      title: "Certification — MERN Stack",
      duration: "1 week",
      whatYouWillLearn: [
        "Skill validation through recommended courses",
        "How to prepare for certification exams",
        "Resume and LinkedIn profile enhancement"
      ],
      practiceTasks: [
        "Complete recommended courses",
        "Pass assessments",
        "Download certificate from provider",
        "Add certificate to resume & LinkedIn"
      ],
      resources: [
        {
          type: "link",
          title: "W3Schools Certification Info",
          link: "https://www.w3schools.com/cert/"
        },
        {
          type: "link",
          title: "freeCodeCamp Certifications",
          link: "https://www.freecodecamp.org/certification"
        }
      ]
    }
  ]
},

  python: {
  title: "Python Django",
  description: "Web development with Python and Django framework",
  totalSteps: 9,
  steps: [
    {
      id: 1,
      title: "Python Basics",
      duration: "2-3 weeks",
      whatYouWillLearn: [
        "Python syntax and data types",
        "Variables, operators, and control flow",
        "Functions and modules",
        "Object-oriented programming basics",
        "File handling and exceptions"
      ],
      practiceTasks: [
        "Solve basic Python problems",
        "Create utility scripts",
        "Build a calculator program",
        "Implement OOP concepts",
        "Work with files and data"
      ],
      resources: [
        {
          type: "video",
          title: "Python Basics Introduction",
          src: "/videos/python.mp4"
        },
        {
          type: "youtube",
          title: "Python Full Course for Beginners",
          link: "https://www.youtube.com/watch?v=_uQrJ0TkSuc"
        }
      ]
    },

    {
      id: 2,
      title: "Advanced Python",
      duration: "2-3 weeks",
      whatYouWillLearn: [
        "Advanced OOP concepts",
        "Decorators and generators",
        "List comprehensions",
        "Lambda functions",
        "Working with libraries (NumPy, Pandas basics)"
      ],
      practiceTasks: [
        "Build advanced OOP projects",
        "Work with data using Pandas",
        "Create decorators",
        "Implement design patterns",
        "Data manipulation exercises"
      ],
      resources: [
        {
          type: "video",
          title: "Advanced Python",
          src: "/videos/python-advance.mp4"
        },
        {
          type: "youtube",
          title: "Advanced Python Concepts",
          link: "https://youtube.com/playlist?list=PLqnslRFeH2UqLwzS0AwKDKLrpYBKzLBy2&si=qqGEV8Up6C-BnUoz"
        }
      ]
    },

    {
      id: 3,
      title: "Django Fundamentals",
      duration: "2-3 weeks",
      whatYouWillLearn: [
        "Django project structure",
        "Models, Views, and Templates (MVT)",
        "URL routing and configuration",
        "Forms and validation",
        "Database basics with Django ORM"
      ],
      practiceTasks: [
        "Create a Django project from scratch",
        "Build models and migrations",
        "Create forms and views",
        "Implement URL routing",
        "Build a simple blog"
      ],
      resources: [
        {
          type: "video",
          title: "Django Fundamentals",
          src: "/videos/django-fundamental.mp4"
        },
        {
          type: "youtube",
          title: "Django Complete Tutorial",
          link: "https://youtu.be/rHux0gMZ3Eg?si=QjVbzgXPxKOk74-o"
        }
      ]
    },

    {
      id: 4,
      title: "Django Advanced Topics",
      duration: "2-3 weeks",
      whatYouWillLearn: [
        "User authentication and authorization",
        "Class-based views",
        "Signals and middlewares",
        "Testing in Django",
        "Performance optimization"
      ],
      practiceTasks: [
        "Implement user authentication",
        "Create class-based views",
        "Write unit tests",
        "Optimize database queries",
        "Implement caching"
      ],
      resources: [
        {
          type: "video",
          title: "Advanced Django",
          src: "/videos/django-advanced.mp4"
        },
        {
          type: "youtube",
          title: "Advanced Django Tutorial",
          link: "https://youtube.com/playlist?list=PLQ52otQ1tqfJHcEsq1TkEfzTqORsmNIJk&si=Tkr1HLslkpXR3HzI"
        }
      ]
    },

    {
      id: 5,
      title: "Database Design",
      duration: "2 weeks",
      whatYouWillLearn: [
        "Relational database concepts",
        "Django ORM relationships",
        "Query optimization",
        "Database indexing",
        "SQL basics"
      ],
      practiceTasks: [
        "Design database schemas",
        "Implement relationships",
        "Write optimized queries",
        "Create complex data models",
        "Work with transactions"
      ],
      resources: [
        {
          type: "video",
          title: "Database Design",
          src: "/videos/database-design.mp4"
        },
        {
          type: "youtube",
          title: "Database Design Fundamentals",
          link: "https://youtube.com/playlist?list=PLCC34OHNcOtoYVT2654KIzait8_eYO_j5&si=3QKJuTd_UtySPHng"
        }
      ]
    },

    {
      id: 6,
      title: "REST APIs with Django",
      duration: "2-3 weeks",
      whatYouWillLearn: [
        "Django REST Framework",
        "Serializers and ViewSets",
        "API authentication and permissions",
        "API versioning",
        "Documentation with DRF"
      ],
      practiceTasks: [
        "Build a complete REST API",
        "Implement authentication",
        "Create serializers",
        "Implement pagination and filtering",
        "Write API documentation"
      ],
      resources: [
        {
          type: "video",
          title: "Django REST Framework",
          src: "/videos/django-rest.mp4"
        },
        {
          type: "youtube",
          title: "DRF Complete Course",
          link: "https://youtu.be/DNFTUtZf1Zc?si=SZdflzY4ke6bf8eZ"
        }
      ]
    },

    {
      id: 7,
      title: "Deployment and DevOps",
      duration: "2 weeks",
      whatYouWillLearn: [
        "Deploying Django apps",
        "Using environment variables",
        "Server setup and configuration",
        "Using Docker with Django",
        "CI/CD basics"
      ],
      practiceTasks: [
        "Deploy to Heroku or AWS",
        "Setup production environment",
        "Configure Docker containers",
        "Setup CI/CD pipeline",
        "Monitor deployed applications"
      ],
      resources: [
        {
          type: "video",
          title: "Django Deployment",
          src: "/videos/django-deployment.mp4"
        },
        {
          type: "youtube",
          title: "Django Deployment Guide",
          link: "https://youtube.com/playlist?list=PLmEKHA8iFrmB2hTxR3xfQ_WqUjUFHp_8-&si=OHNY15IPNN9vTzbz"
        }
      ]
    },

    {
      id: 8,
      title: "Real-World Django Projects",
      duration: "4-6 weeks",
      whatYouWillLearn: [
        "Building complete applications",
        "Best practices and patterns",
        "Security considerations",
        "Performance tuning",
        "Maintenance and scaling"
      ],
      practiceTasks: [
        "Build a full e-commerce platform",
        "Create a social network app",
        "Implement a CMS",
        "Build a project management tool",
        "Create a real-time app"
      ],
      resources: [
        {
          type: "video",
          title: "Real-World Django Projects",
          src: "/videos/django-projects.mp4"
        },
        {
          type: "youtube",
          title: "Django Project Portfolio",
          link: "https://youtube.com/playlist?list=PLFNQLcwO1GaZg65xZ1PrlOY5mP4bnedaT&si=TMtmevLu-GkbPPx3"
        }
      ]
    },

    {
      id: 9,
      title: "Certification — Python / Django",
      duration: "1 week",
      whatYouWillLearn: [
        "Which certificates matter",
        "How to prepare for exams",
        "Using certificates in resume & LinkedIn"
      ],
      practiceTasks: [
        "Complete certification exam",
        "Download certificate",
        "Add certificate to resume & LinkedIn"
      ],
      resources: [
        {
          type: "link",
          title: "freeCodeCamp Python Certification",
          link: "https://www.freecodecamp.org/learn/scientific-computing-with-python/"
        },
        {
          type: "link",
          title: "Coursera Django Courses",
          link: "https://www.coursera.org/courses?query=django"
        }
      ]
    }
  ]
},
 
  /* ========================= WIPRO ========================= */
  wipro: {
    title: "Wipro Interview Preparation",
    description: "Wipro placement training including coding, aptitude, and communication skills",
    totalSteps: 6,
    steps: [
      {
        id: 1,
        title: "Quantitative Aptitude",
        duration: "2 weeks",
        whatYouWillLearn: ["Arithmetic", "Algebra", "Geometry", "Statistics"],
        practiceTasks: ["Practice daily", "Solve tests", "Learn formulas"],
        resources: [
          {
            type: "youtube",
            title: "Quantitative Aptitude Basics",
            link: "https://www.youtube.com/watch?v=8mAITcNt710"
          },
          {
            type: "mcq",
            title: "Wipro Quantitative Aptitude MCQ",
            duration: 20,
            questions: [
  {
    id: 1,
    question: "What is 25% of 200?",
    options: ["25", "50", "75", "100"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Average of 10, 20 and 30 is?",
    options: ["15", "20", "25", "30"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What is the LCM of 12 and 18?",
    options: ["24", "36", "48", "72"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "HCF of 24 and 36 is?",
    options: ["6", "12", "18", "24"],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "If the cost price is ₹100 and selling price is ₹120, what is the profit percentage?",
    options: ["10%", "15%", "20%", "25%"],
    correctAnswer: 2
  },
  {
    id: 6,
    question: "Simplify: 15 × 4 ÷ 5",
    options: ["10", "12", "15", "20"],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "What is the square root of 144?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2
  },
  {
    id: 8,
    question: "If x + x = 18, what is x?",
    options: ["7", "8", "9", "10"],
    correctAnswer: 2
  },
  {
    id: 9,
    question: "What is 40% of 250?",
    options: ["80", "90", "100", "120"],
    correctAnswer: 2
  },
  {
    id: 10,
    question: "The ratio of 2:3 is equal to?",
    options: ["0.5", "0.66", "0.75", "1.5"],
    correctAnswer: 1
  },
  {
    id: 11,
    question: "A train covers 120 km in 2 hours. What is its speed?",
    options: ["40 km/h", "50 km/h", "60 km/h", "70 km/h"],
    correctAnswer: 2
  },
  {
    id: 12,
    question: "What is the value of 3² + 4²?",
    options: ["25", "20", "15", "30"],
    correctAnswer: 0
  },
  {
    id: 13,
    question: "If the perimeter of a square is 40 cm, what is the length of one side?",
    options: ["5 cm", "8 cm", "10 cm", "12 cm"],
    correctAnswer: 2
  },
  {
    id: 14,
    question: "Which number is divisible by 9?",
    options: ["234", "345", "456", "567"],
    correctAnswer: 3
  },
  {
    id: 15,
    question: "What is the cube of 3?",
    options: ["6", "9", "18", "27"],
    correctAnswer: 3
  },
  {
    id: 16,
    question: "If A = 20 and B = 30, what is the average of A and B?",
    options: ["20", "25", "30", "35"],
    correctAnswer: 1
  },
  {
    id: 17,
    question: "What is the simple interest on ₹1000 at 10% per annum for 2 years?",
    options: ["₹100", "₹150", "₹200", "₹250"],
    correctAnswer: 2
  },
  {
    id: 18,
    question: "What is the value of 5³?",
    options: ["15", "25", "100", "125"],
    correctAnswer: 3
  },
  {
    id: 19,
    question: "If 3 pens cost ₹30, what is the cost of 10 pens?",
    options: ["₹90", "₹100", "₹120", "₹150"],
    correctAnswer: 1
  },
  {
    id: 20,
    question: "What is 1/4 expressed as a percentage?",
    options: ["20%", "25%", "30%", "40%"],
    correctAnswer: 1
  },
  {
    id: 21,
    question: "The sum of first 10 natural numbers is?",
    options: ["45", "50", "55", "60"],
    correctAnswer: 2
  },
  {
    id: 22,
    question: "If the diameter of a circle is 14 cm, what is the radius?",
    options: ["5 cm", "6 cm", "7 cm", "8 cm"],
    correctAnswer: 2
  },
  {
    id: 23,
    question: "What is the value of 2⁵?",
    options: ["16", "24", "32", "64"],
    correctAnswer: 2
  },
  {
    id: 24,
    question: "If a number is multiplied by 0, the result is?",
    options: ["0", "1", "Same number", "Undefined"],
    correctAnswer: 0
  },
  {
    id: 25,
    question: "What is the next number in the series: 2, 4, 6, 8, ?",
    options: ["9", "10", "11", "12"],
    correctAnswer: 1
  },
  {
    id: 26,
    question: "How many minutes are there in 2.5 hours?",
    options: ["120", "130", "140", "150"],
    correctAnswer: 3
  },
  {
    id: 27,
    question: "What is the area of a rectangle with length 10 cm and breadth 5 cm?",
    options: ["25 cm²", "40 cm²", "50 cm²", "60 cm²"],
    correctAnswer: 2
  },
  {
    id: 28,
    question: "Which of the following is a prime number?",
    options: ["4", "6", "9", "11"],
    correctAnswer: 3
  },
  {
    id: 29,
    question: "What is 75% of 80?",
    options: ["50", "55", "60", "65"],
    correctAnswer: 2
  },
  {
    id: 30,
    question: "If a = 5 and b = 3, what is a² + b²?",
    options: ["25", "34", "40", "50"],
    correctAnswer: 1
  }
]

          }
        ]
      },
      {
        id: 2,
        title: "Programming Foundations",
        duration: "2-3 weeks",
        whatYouWillLearn: ["Language fundamentals", "Control structures", "Functions"],
        practiceTasks: ["Code basics", "Build projects", "Practice problems"],
        resources: [
          { type: "video", title: "Programming Basics", src: "/videos/programming-basics.mp4" },
          { type: "youtube", title: "Programming Fundamentals", link: "https://www.youtube.com/watch?v=zOjov-2OZ0E" }
        ]
      },
      {
        id: 3,
        title: "Data Structures and Algorithms",
        duration: "3 weeks",
        whatYouWillLearn: ["Arrays", "Trees", "Sorting", "Searching"],
        practiceTasks: ["Implement DS", "Solve DSA problems"],
        resources: [
          { type: "youtube", title: "DSA for Placements", link: "https://www.youtube.com/watch?v=RBSGKlAvoiM" }
        ]
      },
      { id: 4, title: "Technical Concepts", duration: "2 weeks", whatYouWillLearn: ["OOPS","DBMS","Networking"], practiceTasks: ["Study concepts"], resources: [] },
      {
        id: 5,
        title: "Communication and Soft Skills",
        duration: "1-2 weeks",
        whatYouWillLearn: ["English fluency", "Presentation"],
        practiceTasks: ["Practice speaking"],
        resources: [
          { type: "youtube", title: "Interview Communication Skills", link: "https://www.youtube.com/watch?v=Z9y1q5uZJxY" }
        ]
      },
      { id: 6, title: "Mock Interviews and Final Prep", duration: "2 weeks", whatYouWillLearn: ["Mocks","Feedback"], practiceTasks: ["Take tests"], resources: [] }
    ]
  },

  /* ========================= CAPGEMINI ========================= */
  capgemini: {
    title: "Capgemini Interview Preparation",
    description: "Company-specific aptitude, coding, and HR preparation",
    totalSteps: 6,
    steps: [
      {
        id: 1,
        title: "Aptitude Fundamentals",
        duration: "2 weeks",
        whatYouWillLearn: ["Quantitative skills", "Logical reasoning", "Verbal ability"],
        practiceTasks: ["Practice quant", "Solve reasoning"],
        resources: [
          {
  type: "mcq",
  title: "Capgemini Aptitude MCQ",
  duration: 25,
  questions: [
    { id: 1, question: "What is 20% of 300?", options: ["40","50","60","70"], correctAnswer: 2 },
    { id: 2, question: "Average of 14, 16 and 20?", options: ["15","16","17","18"], correctAnswer: 2 },
    { id: 3, question: "LCM of 10 and 15?", options: ["30","15","45","60"], correctAnswer: 0 },
    { id: 4, question: "HCF of 18 and 24?", options: ["6","12","18","24"], correctAnswer: 0 },
    { id: 5, question: "If CP=200, SP=250, profit %?", options: ["20%","25%","30%","40%"], correctAnswer: 1 },
    { id: 6, question: "What is √196?", options: ["12","13","14","15"], correctAnswer: 2 },
    { id: 7, question: "2³ + 3² = ?", options: ["13","17","19","25"], correctAnswer: 1 },
    { id: 8, question: "Which is a prime number?", options: ["21","27","29","39"], correctAnswer: 2 },
    { id: 9, question: "What is 3/4 as %?", options: ["65%","70%","75%","80%"], correctAnswer: 2 },
    { id: 10, question: "Simplify: 18 ÷ 3 × 4", options: ["6","18","24","36"], correctAnswer: 2 },

    { id: 11, question: "If x + 9 = 15, x=?", options: ["3","4","5","6"], correctAnswer: 3 },
    { id: 12, question: "Area of square of side 8?", options: ["32","48","64","72"], correctAnswer: 2 },
    { id: 13, question: "Speed = 120 km in 2 hr?", options: ["40","50","60","70"], correctAnswer: 2 },
    { id: 14, question: "5² + 4² = ?", options: ["41","45","50","55"], correctAnswer: 0 },
    { id: 15, question: "Which number divisible by 9?", options: ["126","135","148","152"], correctAnswer: 1 },
    { id: 16, question: "1/5 as decimal?", options: ["0.1","0.2","0.25","0.5"], correctAnswer: 1 },
    { id: 17, question: "Cube of 4?", options: ["16","32","48","64"], correctAnswer: 3 },
    { id: 18, question: "Profit of ₹40 on CP ₹200 = ?", options: ["15%","20%","25%","30%"], correctAnswer: 1 },
    { id: 19, question: "Next: 3,6,9,?", options: ["10","11","12","13"], correctAnswer: 2 },
    { id: 20, question: "Ratio 4:5 equals?", options: ["0.6","0.75","0.8","1.25"], correctAnswer: 2 },

    { id: 21, question: "HCF of 12, 18?", options: ["2","3","6","9"], correctAnswer: 2 },
    { id: 22, question: "10% of 450?", options: ["40","45","50","55"], correctAnswer: 1 },
    { id: 23, question: "Perimeter of square side 6?", options: ["18","20","22","24"], correctAnswer: 3 },
    { id: 24, question: "Simple interest on 1000 @10% for 1 yr?", options: ["90","100","110","120"], correctAnswer: 1 },
    { id: 25, question: "Value of 2⁴?", options: ["8","12","16","32"], correctAnswer: 2 },
    { id: 26, question: "LCM of 4, 6?", options: ["12","18","24","36"], correctAnswer: 0 },
    { id: 27, question: "√225=?", options: ["13","14","15","16"], correctAnswer: 2 },
    { id: 28, question: "0.75 = ?", options: ["3/4","2/3","5/8","7/8"], correctAnswer: 0 },
    { id: 29, question: "Which is smallest?", options: ["0.3","0.03","0.003","3"], correctAnswer: 2 },
    { id: 30, question: "10 pens cost 50, cost of 1?", options: ["3","4","5","6"], correctAnswer: 2 }
  ]
}

        ]
      },
      {
        id: 2,
        title: "Coding Round Preparation",
        duration: "3 weeks",
        whatYouWillLearn: ["DSA", "Problem solving"],
        practiceTasks: ["Solve DSA problems"],
        resources: [
          { type: "youtube", title: "DSA for Coding Rounds", link: "https://www.youtube.com/watch?v=RBSGKlAvoiM" }
        ]
      },
      { id: 3, title: "Advanced Coding Problems", duration: "2 weeks", whatYouWillLearn: ["Medium problems"], practiceTasks: ["Practice speed"], resources: [] },
      {
        id: 4,
        title: "Technical Interview Prep",
        duration: "2 weeks",
        whatYouWillLearn: ["Core subjects"],
        practiceTasks: ["Mock interviews"],
        resources: [
          { type: "youtube", title: "Technical Interview Tips", link: "https://www.youtube.com/watch?v=HG68Ymazo18" }
        ]
      },
      {
        id: 5,
        title: "HR Interview Preparation",
        duration: "1 week",
        whatYouWillLearn: ["HR questions"],
        practiceTasks: ["Practice answers"],
        resources: [
          { type: "youtube", title: "HR Interview Q&A", link: "https://www.youtube.com/watch?v=Z9y1q5uZJxY" }
        ]
      },
      { id: 6, title: "Final Mock Tests", duration: "2 weeks", whatYouWillLearn: ["Full mocks"], practiceTasks: ["Analyze performance"], resources: [] }
    ]
  },

  /* ========================= QUANTITATIVE APTITUDE ========================= */
  quantitativeAptitude: {
    title: "Quantitative Aptitude",
    description: "Numerical and quantitative reasoning",
    totalSteps: 6,
    steps: [
      {
        id: 1,
        title: "Number Systems & Basics",
        duration: "1 week",
        whatYouWillLearn: ["LCM", "HCF", "Divisibility"],
        practiceTasks: ["Solve number problems"],
        resources: [
         {
  type: "mcq",
  title: "Number System MCQ",
  duration: 25,
  questions: [
    { id: 1, question: "LCM of 6 and 8?", options: ["12","24","48","6"], correctAnswer: 1 },
    { id: 2, question: "HCF of 20 and 30?", options: ["5","10","15","20"], correctAnswer: 1 },
    { id: 3, question: "Which is a prime?", options: ["21","29","39","49"], correctAnswer: 1 },
    { id: 4, question: "Even numbers between 10–20?", options: ["4","5","6","7"], correctAnswer: 2 },
    { id: 5, question: "Smallest prime?", options: ["0","1","2","3"], correctAnswer: 2 },
    { id: 6, question: "Which divisible by 5?", options: ["124","135","142","147"], correctAnswer: 1 },
    { id: 7, question: "Cube of 5?", options: ["75","100","125","150"], correctAnswer: 2 },
    { id: 8, question: "Square of 15?", options: ["200","215","225","235"], correctAnswer: 2 },
    { id: 9, question: "LCM of 9 and 12?", options: ["18","24","36","48"], correctAnswer: 2 },
    { id: 10, question: "HCF of 16 and 24?", options: ["4","6","8","12"], correctAnswer: 2 },

    { id: 11, question: "Prime between 40–50?", options: ["41","42","44","46"], correctAnswer: 0 },
    { id: 12, question: "Divisible by 3?", options: ["124","135","142","146"], correctAnswer: 1 },
    { id: 13, question: "Value of 10²?", options: ["10","100","1000","10000"], correctAnswer: 1 },
    { id: 14, question: "LCM of 3,5?", options: ["10","15","20","30"], correctAnswer: 1 },
    { id: 15, question: "HCF of 9,18?", options: ["3","6","9","18"], correctAnswer: 2 },
    { id: 16, question: "Which is composite?", options: ["7","11","13","15"], correctAnswer: 3 },
    { id: 17, question: "√64=?", options: ["6","7","8","9"], correctAnswer: 2 },
    { id: 18, question: "Cube root of 27?", options: ["2","3","4","5"], correctAnswer: 1 },
    { id: 19, question: "Which is odd?", options: ["12","14","16","17"], correctAnswer: 3 },
    { id: 20, question: "10th natural number?", options: ["9","10","11","12"], correctAnswer: 1 },

    { id: 21, question: "Prime factor of 28?", options: ["2","4","7","Both 2 & 7"], correctAnswer: 3 },
    { id: 22, question: "LCM of 2,4,8?", options: ["8","16","24","32"], correctAnswer: 0 },
    { id: 23, question: "HCF of 12,18,24?", options: ["2","3","6","12"], correctAnswer: 2 },
    { id: 24, question: "Smallest composite?", options: ["1","2","3","4"], correctAnswer: 3 },
    { id: 25, question: "Which divisible by 11?", options: ["121","123","125","129"], correctAnswer: 0 },
    { id: 26, question: "Value of 2⁵?", options: ["16","24","32","64"], correctAnswer: 2 },
    { id: 27, question: "Square root of 81?", options: ["7","8","9","10"], correctAnswer: 2 },
    { id: 28, question: "LCM of 5 and 7?", options: ["35","25","49","70"], correctAnswer: 0 },
    { id: 29, question: "Prime number?", options: ["51","57","59","63"], correctAnswer: 2 },
    { id: 30, question: "HCF of 14 and 21?", options: ["7","14","21","28"], correctAnswer: 0 }
  ]
},

          {
            type: "youtube",
            title: "Number System Basics",
            link: "https://www.youtube.com/watch?v=8mAITcNt710"
          }
        ]
      },
      {
        id: 2,
        title: "Algebra",
        duration: "1-2 weeks",
        whatYouWillLearn: ["Equations", "Quadratics"],
        practiceTasks: ["Solve algebra problems"],
        resources: [
          { type: "youtube", title: "Algebra for Placements", link: "https://www.youtube.com/watch?v=0p9qQzJ6vMY" }
        ]
      },
      {
        id: 3,
        title: "Mensuration & Geometry",
        duration: "1 week",
        whatYouWillLearn: ["Area", "Perimeter", "Volume"],
        practiceTasks: ["Solve geometry problems"],
        resources: [
          {
            type: "mcq",
            title: "Mensuration & Geometry MCQ",
            duration: 25,
            questions: [
              { id: 1, question: "Area of square side 6?", options: ["30","36","42","48"], correctAnswer: 1 },
              { id: 2, question: "Radius if diameter is 14?", options: ["5","6","7","8"], correctAnswer: 2 }
            ]
          }
        ]
      },
      { id: 4, title: "Probability", duration: "1 week", whatYouWillLearn: ["Probability basics"], practiceTasks: ["Solve problems"], resources: [{ type: "youtube", title: "Probability Explained", link: "https://www.youtube.com/watch?v=KzfWUEJjG18" }] },
      { id: 5, title: "Data Interpretation", duration: "1 week", whatYouWillLearn: ["Charts","Graphs"], practiceTasks: ["Solve DI sets"], resources: [{ type: "video", title: "DI Tricks", src: "/videos/data-interpretation.mp4" }] },
      { id: 6, title: "Mock Tests", duration: "2 weeks", whatYouWillLearn: ["Time management"], practiceTasks: ["Take mocks"], resources: [] }
    ]
  },

  /* ========================= REASONING ========================= */
  /* ========================= ACCENTURE ========================= */
  accenture: {
    title: "Accenture Interview Preparation",
    description: "Accenture-specific assessment, coding rounds, and HR interview guidance",
    totalSteps: 6,
    steps: [
      {
        id: 1,
        title: "Aptitude Fundamentals",
        duration: "1-2 weeks",
        whatYouWillLearn: ["Number systems", "Percentages", "Profit & Loss", "Time & Work"],
        practiceTasks: ["Daily problem sets", "Timed quizzes"],
        resources: [
          { type: "youtube", title: "Aptitude Basics", link: "https://www.youtube.com/watch?v=8mAITcNt710" }
        ]
      },
      {
        id: 2,
        title: "Technical Coding",
        duration: "2-3 weeks",
        whatYouWillLearn: ["DSA fundamentals", "Problem solving patterns", "Complexity analysis"],
        practiceTasks: ["Solve medium problems", "Participate in contests"],
        resources: [
          { type: "link", title: "Accenture Coding Prep", link: "https://www.accenture.com/" }
        ]
      },
      {
        id: 3,
        title: "System Design & Concepts",
        duration: "1-2 weeks",
        whatYouWillLearn: ["Design basics", "APIs", "Scalability"],
        practiceTasks: ["Design small systems"],
        resources: [
          { type: "youtube", title: "System Design Intro", link: "https://www.youtube.com/watch?v=UzLMhqg3_Wc" }
        ]
      },
      {
        id: 4,
        title: "Behavioral & HR",
        duration: "1 week",
        whatYouWillLearn: ["STAR technique", "Communication skills"],
        practiceTasks: ["Mock HR interviews"],
        resources: [
          { type: "youtube", title: "HR Interview Tips", link: "https://www.youtube.com/watch?v=Z9y1q5uZJxY" }
        ]
      },
      {
        id: 5,
        title: "Company Specific Prep",
        duration: "1 week",
        whatYouWillLearn: ["Accenture selection process", "Role expectations"],
        practiceTasks: ["Study previous papers", "Prepare projects demo"],
        resources: [
          { type: "link", title: "Accenture Careers", link: "https://www.accenture.com/us-en/careers" }
        ]
      },
      {
        id: 6,
        title: "Mock Tests & Final Prep",
        duration: "2 weeks",
        whatYouWillLearn: ["Time management", "Exam strategy"],
        practiceTasks: ["Take full mocks", "Review weak areas"],
        resources: []
      }
    ]
  },
  reasoning: {
    title: "Logical Reasoning",
    description: "Puzzles and analytical reasoning",
    totalSteps: 6,
    steps: [
      { id: 1, title: "Puzzle Fundamentals", duration: "2 weeks", whatYouWillLearn: ["Logic puzzles"], practiceTasks: ["Solve puzzles"], resources: [] },
      {
        id: 2,
        title: "Seating Arrangements",
        duration: "2 weeks",
        whatYouWillLearn: ["Linear", "Circular"],
        practiceTasks: ["Solve arrangements"],
        resources: [
          {
  type: "mcq",
  title: "Seating Arrangement MCQ",
  duration: 25,
  questions: [
    { id: 1, question: "If A sits left of B, who is on right?", options: ["A","B","C","Cannot say"], correctAnswer: 1 },
    { id: 2, question: "Circular arrangement means?", options: ["Line","Square","Circle","Row"], correctAnswer: 2 },
    { id: 3, question: "Facing north, left side is?", options: ["East","West","North","South"], correctAnswer: 1 },
    { id: 4, question: "Facing south, right side?", options: ["East","West","North","South"], correctAnswer: 0 },
    { id: 5, question: "Opposite in circle means?", options: ["Left","Right","Across","Near"], correctAnswer: 2 },
    { id: 6, question: "5 people circular seats?", options: ["4","5","6","Any"], correctAnswer: 3 },
    { id: 7, question: "A between B & C means?", options: ["B A C","A B C","B C A","None"], correctAnswer: 0 },
    { id: 8, question: "Immediate neighbor means?", options: ["Next","Far","Opposite","None"], correctAnswer: 0 },
    { id: 9, question: "Linear arrangement is?", options: ["Circle","Row","Square","Cube"], correctAnswer: 1 },
    { id: 10, question: "Facing center in circle?", options: ["Inward","Outward","Side","None"], correctAnswer: 0 },

    { id: 11, question: "Facing outside, left becomes?", options: ["Right","Left","Same","None"], correctAnswer: 0 },
    { id: 12, question: "If 8 persons, opposite count?", options: ["2","3","4","5"], correctAnswer: 2 },
    { id: 13, question: "Immediate right means?", options: ["Next","Opposite","Far","None"], correctAnswer: 0 },
    { id: 14, question: "Row seating means?", options: ["Circle","Line","Square","Box"], correctAnswer: 1 },
    { id: 15, question: "A is second from left, total 5, right of A?", options: ["2","3","4","1"], correctAnswer: 2 },
    { id: 16, question: "Facing north, back is?", options: ["East","West","South","North"], correctAnswer: 2 },
    { id: 17, question: "Circular seating reduces?", options: ["Clarity","Direction","Distance","Options"], correctAnswer: 1 },
    { id: 18, question: "Opposite in 6 circle?", options: ["2 seats away","3 seats away","4 seats","None"], correctAnswer: 1 },
    { id: 19, question: "Between two means?", options: ["Middle","Left","Right","Opposite"], correctAnswer: 0 },
    { id: 20, question: "Facing center, right side is?", options: ["Left","Right","Opposite","Same"], correctAnswer: 1 },

    { id: 21, question: "Facing outside reverses?", options: ["Left-Right","Order","Position","None"], correctAnswer: 0 },
    { id: 22, question: "Linear 10 people, ends?", options: ["1","2","3","4"], correctAnswer: 1 },
    { id: 23, question: "Circular arrangement has ends?", options: ["Yes","No","Sometimes","Rare"], correctAnswer: 1 },
    { id: 24, question: "Facing north, east is?", options: ["Left","Right","Back","Front"], correctAnswer: 1 },
    { id: 25, question: "Immediate neighbor count?", options: ["1","2","3","4"], correctAnswer: 1 },
    { id: 26, question: "Circular inward faces?", options: ["Center","Outside","None","Both"], correctAnswer: 0 },
    { id: 27, question: "Opposite exists in row?", options: ["Yes","No","Sometimes","Rare"], correctAnswer: 1 },
    { id: 28, question: "Clockwise means?", options: ["Right","Left","Random","Opposite"], correctAnswer: 0 },
    { id: 29, question: "Anticlockwise means?", options: ["Left","Right","Back","None"], correctAnswer: 0 },
    { id: 30, question: "Seating puzzles test?", options: ["Logic","Math","English","GK"], correctAnswer: 0 }
  ]
}

        ]
      },
      { id: 3, title: "Blood Relations", duration: "1-2 weeks", whatYouWillLearn: ["Family relations"], practiceTasks: ["Solve relations"], resources: [] },
      { id: 4, title: "Analytical Reasoning", duration: "2 weeks", whatYouWillLearn: ["Venn diagrams"], practiceTasks: ["Analyze"], resources: [] },
      { id: 5, title: "Coding-Decoding", duration: "1-2 weeks", whatYouWillLearn: ["Patterns"], practiceTasks: ["Decode"], resources: [] },
      { id: 6, title: "Mixed Practice", duration: "2 weeks", whatYouWillLearn: ["Full tests"], practiceTasks: ["Practice"], resources: [] }
    ]
  }
};



export default roadmapData;
