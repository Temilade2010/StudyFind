const fs = require('fs');
const path = require('path');
const { DATA_FILE, UPLOADS_DIR } = require('../config');

// Ensure directories exist
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Global subjects taxonomy covering all disciplines taught worldwide
const WORLD_SUBJECT_CATEGORIES = [
  {
    category: 'Computer Science & Information Technology',
    icon: 'Terminal',
    subjects: [
      'Computer Science',
      'Artificial Intelligence & ML',
      'Data Science & Analytics',
      'Cybersecurity & Cryptography',
      'Software Engineering',
      'Web & Mobile Development',
      'Cloud Computing & DevOps',
      'Computer Systems & Networks',
      'Algorithms & Data Structures'
    ]
  },
  {
    category: 'Mathematics & Formal Sciences',
    icon: 'Sigma',
    subjects: [
      'Calculus & Mathematical Analysis',
      'Linear Algebra & Matrix Theory',
      'Probability & Mathematical Statistics',
      'Discrete Mathematics & Graph Theory',
      'Differential Equations',
      'Abstract Algebra & Number Theory',
      'Applied Mathematics & Optimization',
      'Mathematical Logic'
    ]
  },
  {
    category: 'Physical & Natural Sciences',
    icon: 'Atom',
    subjects: [
      'Physics',
      'Quantum Mechanics & Modern Physics',
      'Electromagnetism & Optics',
      'Thermodynamics & Statistical Physics',
      'Astrophysics & Cosmology',
      'Organic Chemistry',
      'Inorganic Chemistry',
      'Physical Chemistry',
      'Biochemistry'
    ]
  },
  {
    category: 'Biological & Life Sciences',
    icon: 'Dna',
    subjects: [
      'Biology',
      'Molecular & Cellular Biology',
      'Genetics & Genomics',
      'Neuroscience & Neurobiology',
      'Microbiology & Immunology',
      'Ecology & Evolutionary Biology',
      'Physiology & Anatomy',
      'Botany & Plant Science'
    ]
  },
  {
    category: 'Medicine & Health Sciences',
    icon: 'Activity',
    subjects: [
      'Medicine & Healthcare',
      'Human Anatomy & Histology',
      'Pharmacology & Therapeutics',
      'Pathology & Disease Mechanisms',
      'Public Health & Epidemiology',
      'Nursing & Clinical Practice',
      'Surgery & Emergency Care',
      'Nutrition & Dietetics'
    ]
  },
  {
    category: 'Engineering & Technology',
    icon: 'Cpu',
    subjects: [
      'Mechanical Engineering',
      'Electrical & Electronics Engineering',
      'Civil & Structural Engineering',
      'Chemical Engineering',
      'Aerospace Engineering',
      'Biomedical Engineering',
      'Robotics & Automation',
      'Materials Science'
    ]
  },
  {
    category: 'Business, Finance & Economics',
    icon: 'TrendingUp',
    subjects: [
      'Economics & Macroeconomics',
      'Microeconomics',
      'Corporate Finance & Investment',
      'Financial Accounting',
      'Management & Leadership',
      'Marketing & Consumer Behavior',
      'Entrepreneurship & Strategy',
      'Supply Chain & Logistics'
    ]
  },
  {
    category: 'Social Sciences & Psychology',
    icon: 'Brain',
    subjects: [
      'Psychology & Cognitive Science',
      'Sociology & Society',
      'Political Science & Governance',
      'International Relations',
      'Anthropology & Culture',
      'Criminology & Justice',
      'Human Geography'
    ]
  },
  {
    category: 'Humanities & Philosophy',
    icon: 'BookOpen',
    subjects: [
      'Philosophy & Epistemology',
      'Ethics & Morality',
      'World History',
      'Ancient History & Archaeology',
      'Literature & Literary Analysis',
      'Religious Studies & Theology',
      'Classics & Antiquity'
    ]
  },
  {
    category: 'Law & Legal Studies',
    icon: 'Scale',
    subjects: [
      'Constitutional Law',
      'Criminal Law',
      'International Law & Human Rights',
      'Corporate & Commercial Law',
      'Civil Law & Torts',
      'Intellectual Property'
    ]
  },
  {
    category: 'Arts, Architecture & Design',
    icon: 'Palette',
    subjects: [
      'Art History',
      'Fine Arts & Visual Design',
      'Music Theory & Composition',
      'Architecture & Urban Planning',
      'Film & Media Studies',
      'Graphic & UI/UX Design'
    ]
  },
  {
    category: 'Languages & World Cultures',
    icon: 'Globe',
    subjects: [
      'English Literature & Composition',
      'Spanish Language & Literature',
      'French Language & Studies',
      'German Language & Literature',
      'Mandarin Chinese',
      'Arabic Language & Culture',
      'Japanese Language & Linguistics',
      'Linguistics & Phonetics'
    ]
  },
  {
    category: 'Earth, Climate & Environmental Sciences',
    icon: 'Compass',
    subjects: [
      'Earth Science & Geology',
      'Meteorology & Climate Science',
      'Oceanography & Marine Science',
      'Environmental Conservation',
      'Ecology & Sustainability',
      'Agricultural & Soil Sciences'
    ]
  },
  {
    category: 'Education & Pedagogy',
    icon: 'GraduationCap',
    subjects: [
      'Educational Psychology',
      'Curriculum & Teaching Methods',
      'STEM Education',
      'Special Education',
      'Educational Technology'
    ]
  }
];

// Flat list of all subjects
const ALL_SUBJECTS = WORLD_SUBJECT_CATEGORIES.flatMap(c => c.subjects);

let db = {
  users: [],
  subjectCategories: WORLD_SUBJECT_CATEGORIES,
  subjects: ALL_SUBJECTS,
  resources: [],
  bookmarks: [],
  history: [],
  reviews: [],
  comments: []
};

function initializeCleanData() {
  db = {
    users: [],
    subjectCategories: WORLD_SUBJECT_CATEGORIES,
    subjects: ALL_SUBJECTS,
    resources: [],
    bookmarks: [],
    history: [],
    reviews: [],
    comments: []
  };
  saveDb();
}

function loadDb() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const loaded = JSON.parse(content);
      
      db = {
        users: Array.isArray(loaded.users) ? loaded.users : [],
        subjectCategories: WORLD_SUBJECT_CATEGORIES,
        subjects: ALL_SUBJECTS,
        resources: Array.isArray(loaded.resources) ? loaded.resources : [],
        bookmarks: Array.isArray(loaded.bookmarks) ? loaded.bookmarks : [],
        history: Array.isArray(loaded.history) ? loaded.history : [],
        reviews: Array.isArray(loaded.reviews) ? loaded.reviews : [],
        comments: Array.isArray(loaded.comments) ? loaded.comments : []
      };

      // Filter out any obsolete demo/seed users from previous test builds
      db.users = db.users.filter(u => !u.email.includes('@studyfind.edu'));
      saveDb();
    } catch (err) {
      console.error('Failed to parse database file, resetting to clean state:', err);
      initializeCleanData();
    }
  } else {
    initializeCleanData();
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting database:', err);
  }
}

// Initial load
loadDb();

module.exports = {
  getDb: () => db,
  saveDb,
  loadDb,
  resetDb: initializeCleanData,
  WORLD_SUBJECT_CATEGORIES,
  ALL_SUBJECTS
};
