/**
 * seed/data.js
 * Curated, realistic demo data for SkillSwap.
 * Kept separate from the seeding logic so it's easy to tweak the cast of
 * characters without touching the script that wires everything together.
 *
 * Avatars: users have no stored photo, so the frontend renders a unique,
 * open-license DiceBear avatar from each name (safe to show publicly). Real
 * users can upload their own. Ratings are intentionally varied (including some
 * low and some brand-new zero-rating accounts) so the community reads as real.
 */

/**
 * The shared password for every seeded account, so stakeholders can log in
 * as anyone during a demo. Override with SEED_PASSWORD in the environment.
 */
const DEMO_PASSWORD = process.env.SEED_PASSWORD || 'demo@1234';

/* A believable, diverse cast. Skills are chosen so the matching algorithm
 * produces real overlaps (people offer what others want). */
const users = [
  {
    name: 'Demo User', email: 'demo@gmail.com', location: 'San Francisco, USA',
    bio: 'The main demo account — log in here to explore SkillSwap. Offers web-dev skills and wants to pick up guitar and Spanish.',
    skillsOffered: [
      { name: 'React', level: 'expert', verified: true, verificationMethod: 'github' },
      { name: 'TypeScript', level: 'advanced', verified: true, verificationMethod: 'portfolio' },
      { name: 'UI Design', level: 'intermediate' },
    ],
    skillsWanted: [{ name: 'Guitar', level: 'beginner' }, { name: 'Spanish', level: 'beginner' }, { name: 'Python', level: 'beginner' }],
    rating: 4.8, ratingCount: 22, swapsCompleted: 14, sessionsCompleted: 9, isVerified: true,
  },
  {
    name: 'Ava Thompson', email: 'ava@skillswap.app', location: 'San Francisco, USA',
    bio: 'Senior frontend engineer who loves teaching React. Trying to finally learn the guitar this year.',
    skillsOffered: [
      { name: 'React', level: 'expert', verified: true, verificationMethod: 'github' },
      { name: 'TypeScript', level: 'advanced', verified: true, verificationMethod: 'portfolio' },
      { name: 'UI Design', level: 'intermediate' },
    ],
    skillsWanted: [{ name: 'Guitar', level: 'beginner' }, { name: 'Spanish', level: 'beginner' }],
    rating: 4.8, ratingCount: 27, swapsCompleted: 19, sessionsCompleted: 11, isVerified: true,
  },
  {
    name: 'Marcus Chen', email: 'marcus@skillswap.app', location: 'Toronto, Canada',
    bio: 'Backend developer and part-time jazz guitarist. Happy to trade music lessons for code reviews.',
    skillsOffered: [
      { name: 'Guitar', level: 'expert', verified: true, verificationMethod: 'portfolio' },
      { name: 'Node.js', level: 'advanced', verified: true, verificationMethod: 'github' },
      { name: 'Music Theory', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'React', level: 'intermediate' }, { name: 'UI Design', level: 'beginner' }],
    rating: 4.9, ratingCount: 34, swapsCompleted: 23, sessionsCompleted: 8, isVerified: true,
  },
  {
    name: 'Sofia Garcia', email: 'sofia@skillswap.app', location: 'Madrid, Spain',
    bio: 'Native Spanish speaker and language tutor. Learning to code to build my own tutoring platform.',
    skillsOffered: [
      { name: 'Spanish', level: 'expert', verified: true, verificationMethod: 'quiz' },
      { name: 'Public Speaking', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Python', level: 'beginner' }, { name: 'React', level: 'beginner' }],
    rating: 4.7, ratingCount: 41, swapsCompleted: 30, sessionsCompleted: 22, isVerified: true,
  },
  {
    name: 'Liam Patel', email: 'liam@skillswap.app', location: 'London, UK',
    bio: 'Data scientist. I teach Python and ML fundamentals; looking to sharpen my public speaking.',
    skillsOffered: [
      { name: 'Python', level: 'expert', verified: true, verificationMethod: 'github' },
      { name: 'Machine Learning', level: 'advanced', verified: true, verificationMethod: 'portfolio' },
      { name: 'Data Analysis', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Public Speaking', level: 'intermediate' }, { name: 'Spanish', level: 'beginner' }],
    rating: 4.6, ratingCount: 18, swapsCompleted: 12, sessionsCompleted: 15, isVerified: true,
  },
  {
    name: 'Nina Müller', email: 'nina@skillswap.app', location: 'Berlin, Germany',
    bio: 'Product designer turned design mentor. I trade UI/UX critiques for anything music-related.',
    skillsOffered: [
      { name: 'UI Design', level: 'expert', verified: true, verificationMethod: 'portfolio' },
      { name: 'Figma', level: 'expert', verified: true, verificationMethod: 'portfolio' },
      { name: 'UX Research', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Piano', level: 'beginner' }, { name: 'Photography', level: 'beginner' }],
    rating: 4.9, ratingCount: 52, swapsCompleted: 38, sessionsCompleted: 19, isVerified: true,
  },
  {
    name: 'Diego Rossi', email: 'diego@skillswap.app', location: 'Milan, Italy',
    bio: 'Wedding + portrait photographer for 8 years. Can teach you everything about light. Trying to learn Figma so I can finally redo my own website.',
    skillsOffered: [
      { name: 'Photography', level: 'expert', verified: true, verificationMethod: 'portfolio' },
      { name: 'Photo Editing', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Figma', level: 'beginner' }, { name: 'UI Design', level: 'beginner' }],
    rating: 3.9, ratingCount: 14, swapsCompleted: 9, sessionsCompleted: 6,
  },
  {
    name: 'Priya Sharma', email: 'priya@skillswap.app', location: 'Bangalore, India',
    bio: 'Full-stack engineer and piano hobbyist. Always trading code mentorship for new hobbies.',
    skillsOffered: [
      { name: 'Piano', level: 'advanced', verified: true, verificationMethod: 'portfolio' },
      { name: 'Node.js', level: 'expert', verified: true, verificationMethod: 'github' },
      { name: 'MongoDB', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Machine Learning', level: 'intermediate' }, { name: 'Photography', level: 'beginner' }],
    rating: 4.8, ratingCount: 29, swapsCompleted: 21, sessionsCompleted: 13, isVerified: true,
  },
  {
    name: 'James Okafor', email: 'james@skillswap.app', location: 'Lagos, Nigeria',
    bio: 'self-taught dev, building a payments side project. still rough around the edges as a teacher but i try my best. want to break into data science.',
    skillsOffered: [
      { name: 'JavaScript', level: 'advanced', verified: true, verificationMethod: 'github' },
      { name: 'React', level: 'intermediate' },
    ],
    skillsWanted: [{ name: 'Data Analysis', level: 'intermediate' }, { name: 'Python', level: 'intermediate' }],
    rating: 3.7, ratingCount: 11, swapsCompleted: 7, sessionsCompleted: 4,
  },
  {
    name: 'Emma Wilson', email: 'emma@skillswap.app', location: 'Sydney, Australia',
    bio: 'Marketing lead who codes on weekends. I teach copywriting and SEO, want to learn Python.',
    skillsOffered: [
      { name: 'Copywriting', level: 'expert', verified: true, verificationMethod: 'portfolio' },
      { name: 'SEO', level: 'advanced' },
      { name: 'Public Speaking', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Python', level: 'beginner' }, { name: 'Data Analysis', level: 'beginner' }],
    rating: 4.7, ratingCount: 23, swapsCompleted: 16, sessionsCompleted: 9, isVerified: true,
  },
  {
    name: 'Yuki Tanaka', email: 'yuki@skillswap.app', location: 'Tokyo, Japan',
    bio: 'Mobile developer and amateur illustrator. Trading Swift knowledge for drawing lessons.',
    skillsOffered: [
      { name: 'Swift', level: 'expert', verified: true, verificationMethod: 'github' },
      { name: 'iOS Development', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Illustration', level: 'beginner' }, { name: 'UI Design', level: 'intermediate' }],
    rating: 4.6, ratingCount: 17, swapsCompleted: 11, sessionsCompleted: 7,
  },
  {
    name: 'Olivia Brown', email: 'olivia@skillswap.app', location: 'Austin, USA',
    bio: 'Illustrator and digital artist. Happy to teach drawing in exchange for mobile dev tips.',
    skillsOffered: [
      { name: 'Illustration', level: 'expert', verified: true, verificationMethod: 'portfolio' },
      { name: 'Digital Art', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Swift', level: 'beginner' }, { name: 'Figma', level: 'intermediate' }],
    rating: 4.8, ratingCount: 26, swapsCompleted: 18, sessionsCompleted: 12, isVerified: true,
  },
  {
    name: 'Carlos Mendoza', email: 'carlos@skillswap.app', location: 'Mexico City, Mexico',
    bio: 'DevOps engineer. I teach Docker and cloud basics; learning UX research for a career pivot.',
    skillsOffered: [
      { name: 'Docker', level: 'expert', verified: true, verificationMethod: 'github' },
      { name: 'AWS', level: 'advanced', verified: true, verificationMethod: 'portfolio' },
      { name: 'CI/CD', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'UX Research', level: 'beginner' }, { name: 'Public Speaking', level: 'intermediate' }],
    rating: 4.1, ratingCount: 13, swapsCompleted: 8, sessionsCompleted: 5,
  },
  {
    name: 'Hannah Kim', email: 'hannah@skillswap.app', location: 'Seoul, South Korea',
    bio: 'UX researcher who loves a good user interview. Want to get comfortable with cloud infra.',
    skillsOffered: [
      { name: 'UX Research', level: 'expert', verified: true, verificationMethod: 'portfolio' },
      { name: 'User Interviews', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'AWS', level: 'beginner' }, { name: 'Docker', level: 'beginner' }],
    rating: 4.9, ratingCount: 31, swapsCompleted: 24, sessionsCompleted: 16, isVerified: true,
  },
  {
    name: 'Tom Anderson', email: 'tom@skillswap.app', location: 'Dublin, Ireland',
    bio: 'New to the platform — eager to learn web development and meet other builders.',
    skillsOffered: [{ name: 'Excel', level: 'advanced' }, { name: 'Financial Modeling', level: 'intermediate' }],
    skillsWanted: [{ name: 'JavaScript', level: 'beginner' }, { name: 'React', level: 'beginner' }],
    rating: 0, ratingCount: 0, swapsCompleted: 0, sessionsCompleted: 0,
  },
  {
    name: 'Fatima Al-Sayed', email: 'fatima@skillswap.app', location: 'Dubai, UAE',
    bio: 'Arabic teacher and translator. Trading language lessons for design and coding skills.',
    skillsOffered: [
      { name: 'Arabic', level: 'expert', verified: true, verificationMethod: 'quiz' },
      { name: 'Translation', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Figma', level: 'beginner' }, { name: 'JavaScript', level: 'beginner' }],
    rating: 4.7, ratingCount: 20, swapsCompleted: 14, sessionsCompleted: 10, isVerified: true,
  },
  {
    name: 'Lucas Silva', email: 'lucas@skillswap.app', location: 'São Paulo, Brazil',
    bio: 'Game developer in Unity. Love teaching game design and learning music production.',
    skillsOffered: [
      { name: 'Unity', level: 'expert', verified: true, verificationMethod: 'github' },
      { name: 'Game Design', level: 'advanced' },
      { name: 'C#', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Music Theory', level: 'beginner' }, { name: 'Guitar', level: 'beginner' }],
    rating: 4.6, ratingCount: 15, swapsCompleted: 10, sessionsCompleted: 6,
  },
  {
    name: 'Grace Lee', email: 'grace@skillswap.app', location: 'Vancouver, Canada',
    bio: 'Content creator and video editor. Teaching editing while learning to code my own site.',
    skillsOffered: [
      { name: 'Video Editing', level: 'expert', verified: true, verificationMethod: 'portfolio' },
      { name: 'Motion Graphics', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'JavaScript', level: 'beginner' }, { name: 'React', level: 'beginner' }],
    rating: 4.8, ratingCount: 22, swapsCompleted: 15, sessionsCompleted: 11, isVerified: true,
  },
  {
    name: 'Daniel Novak', email: 'daniel@skillswap.app', location: 'Prague, Czechia',
    bio: '15 years in databases. I can make Postgres do almost anything. Honestly a bit of an introvert so sessions are short and to the point — but you\'ll learn a lot.',
    skillsOffered: [
      { name: 'SQL', level: 'expert', verified: true, verificationMethod: 'github' },
      { name: 'PostgreSQL', level: 'advanced' },
      { name: 'Data Analysis', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'React', level: 'beginner' }, { name: 'TypeScript', level: 'beginner' }],
    rating: 3.8, ratingCount: 12, swapsCompleted: 8, sessionsCompleted: 5,
  },
  {
    name: 'Aisha Bello', email: 'aisha@skillswap.app', location: 'Nairobi, Kenya',
    bio: 'Project manager and Agile coach. Sharing PM skills, picking up data analysis.',
    skillsOffered: [
      { name: 'Project Management', level: 'expert', verified: true, verificationMethod: 'portfolio' },
      { name: 'Agile', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Data Analysis', level: 'beginner' }, { name: 'SQL', level: 'beginner' }],
    rating: 4.7, ratingCount: 19, swapsCompleted: 13, sessionsCompleted: 8, isVerified: true,
  },
  {
    name: 'Noah Schmidt', email: 'noah@skillswap.app', location: 'Zurich, Switzerland',
    bio: 'Security engineer. Teaching the fundamentals of web security and ethical hacking basics.',
    skillsOffered: [
      { name: 'Cybersecurity', level: 'expert', verified: true, verificationMethod: 'github' },
      { name: 'Penetration Testing', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Machine Learning', level: 'beginner' }, { name: 'Python', level: 'intermediate' }],
    rating: 4.9, ratingCount: 28, swapsCompleted: 20, sessionsCompleted: 14, isVerified: true,
  },
  {
    name: 'Mia Rossi', email: 'mia@skillswap.app', location: 'Lisbon, Portugal',
    bio: 'Yoga instructor exploring a tech career. Trading wellness sessions for coding lessons.',
    skillsOffered: [
      { name: 'Yoga', level: 'expert', verified: true, verificationMethod: 'portfolio' },
      { name: 'Meditation', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'JavaScript', level: 'beginner' }, { name: 'Python', level: 'beginner' }],
    rating: 4.8, ratingCount: 24, swapsCompleted: 17, sessionsCompleted: 21, isVerified: true,
  },
  {
    name: 'Ethan Wright', email: 'ethan@skillswap.app', location: 'Chicago, USA',
    bio: 'Just signed up! Backend curious, currently strong in spreadsheets and finance.',
    skillsOffered: [{ name: 'Excel', level: 'expert' }, { name: 'Accounting', level: 'advanced' }],
    skillsWanted: [{ name: 'Python', level: 'beginner' }, { name: 'SQL', level: 'beginner' }],
    rating: 0, ratingCount: 0, swapsCompleted: 0, sessionsCompleted: 0,
  },
  {
    name: 'Zara Ahmed', email: 'zara@skillswap.app', location: 'Karachi, Pakistan',
    bio: 'Frontend developer and accessibility advocate. Teaching a11y, learning motion graphics.',
    skillsOffered: [
      { name: 'Accessibility', level: 'expert', verified: true, verificationMethod: 'portfolio' },
      { name: 'CSS', level: 'advanced', verified: true, verificationMethod: 'github' },
      { name: 'React', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'Motion Graphics', level: 'beginner' }, { name: 'Video Editing', level: 'beginner' }],
    rating: 4.7, ratingCount: 21, swapsCompleted: 15, sessionsCompleted: 9, isVerified: true,
  },
  {
    name: 'Leo Martin', email: 'leo@skillswap.app', location: 'Paris, France',
    bio: 'French tutor and writer. Always trading language practice for new technical skills.',
    skillsOffered: [
      { name: 'French', level: 'expert', verified: true, verificationMethod: 'quiz' },
      { name: 'Creative Writing', level: 'advanced' },
    ],
    skillsWanted: [{ name: 'TypeScript', level: 'beginner' }, { name: 'Node.js', level: 'beginner' }],
    rating: 4.6, ratingCount: 16, swapsCompleted: 11, sessionsCompleted: 13,
  },
];

/* Learning-circle topics. host/members are filled in by the seed script. */
const circleTemplates = [
  {
    title: 'Intro to Machine Learning', skill: 'Machine Learning',
    description: 'A beginner-friendly walkthrough of core ML concepts with hands-on examples in Python.',
    tags: ['Python', 'ML', 'Beginner'], maxMembers: 12, creditCostPerMember: 10, status: 'open',
    hostEmail: 'liam@skillswap.app', daysFromNow: 4,
  },
  {
    title: 'React Patterns That Scale', skill: 'React',
    description: 'Hooks, context, and component architecture for production apps. Bring your questions!',
    tags: ['React', 'Frontend', 'Intermediate'], maxMembers: 10, creditCostPerMember: 12, status: 'open',
    hostEmail: 'ava@skillswap.app', daysFromNow: 6,
  },
  {
    title: 'Design Critique Circle', skill: 'UI Design',
    description: 'Bring a screen, get honest, constructive feedback from designers and engineers.',
    tags: ['Design', 'Figma', 'Feedback'], maxMembers: 8, creditCostPerMember: 8, status: 'active',
    hostEmail: 'nina@skillswap.app', daysFromNow: -1,
  },
  {
    title: 'Conversational Spanish Hour', skill: 'Spanish',
    description: 'Low-pressure speaking practice for beginners. We keep it fun and supportive.',
    tags: ['Spanish', 'Language', 'Beginner'], maxMembers: 15, creditCostPerMember: 6, status: 'open',
    hostEmail: 'sofia@skillswap.app', daysFromNow: 2,
  },
  {
    title: 'Web Security Fundamentals', skill: 'Cybersecurity',
    description: 'OWASP Top 10 explained simply, with live examples of common vulnerabilities.',
    tags: ['Security', 'Web', 'Intermediate'], maxMembers: 10, creditCostPerMember: 15, status: 'open',
    hostEmail: 'noah@skillswap.app', daysFromNow: 9,
  },
];

module.exports = { DEMO_PASSWORD, users, circleTemplates };
