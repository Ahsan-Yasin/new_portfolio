import type { Content } from './schema';
import { seedProjects } from './seed-projects';

const empty = { src: '', alt: '', kind: 'image' as const };

/**
 * The content a new deployment starts with, taken from Ahsan's CV.
 * Everything here can be changed from the admin.
 */
export const seedContent: Content = {
  isSample: false,
  site: {
    title: 'Ahsan Yasin, software engineer',
    description:
      'Ahsan Yasin is a software engineer behind LensBay, a live marketplace for used camera gear, and Highlight Cutter, which turns FloLabs’ meeting recordings into finished videos.',
    url: '',
    ogImage: empty,
    noindex: false,
  },
  profile: {
    name: 'Ahsan Yasin',
    shortName: 'Ahsan',
    role: 'Software engineer',
    location: 'Faisalabad, Pakistan',
    email: 'm.ahsan79009@gmail.com',
    phone: '',
    avatar: {
      src: '/profile/ahsan.webp',
      alt: 'Illustrated portrait of Ahsan Yasin, in glasses and a black leather jacket, arms crossed',
      kind: 'image',
      width: 791,
      height: 1280,
    },
    resumeFile: '',
    availabilityVisible: true,
    availabilityLabel: 'Currently at FloLabs',
    socials: [
      { id: 'github', label: 'GitHub', url: 'https://github.com/Ahsan-Yasin', icon: 'github' },
      { id: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/ahsan-yasin', icon: 'linkedin' },
      { id: 'mail', label: 'Email', url: 'mailto:m.ahsan79009@gmail.com', icon: 'mail' },
    ],
  },
  nav: [
    { id: 'work', label: 'Work', href: '/#work', visible: true },
    { id: 'about', label: 'About', href: '/about', visible: true },
    { id: 'resume', label: 'Resume', href: '/resume', visible: true },
  ],
  hero: {
    headline: 'Software\nEngineer',
    subheadline:
      'Final-year Software Engineering student behind LensBay, a live marketplace for used camera gear, and Highlight Cutter, which turns FloLabs’ meeting recordings into finished videos.',
    facts: [
      { id: 'hf1', label: 'Now', value: 'Intern & Co-Team Lead, FloLabs' },
      { id: 'hf2', label: 'Studying', value: 'BS Software Engineering, FAST-NUCES' },
      { id: 'hf3', label: 'Focus', value: 'Full-stack and applied AI' },
    ],
    showSocials: true,
    primaryLabel: 'More about me',
    primaryHref: '/about',
    secondaryLabel: '',
    secondaryHref: '',
  },
  sections: [
    { id: 'intro', visible: true, title: 'Hey, I’m Ahsan.', subtitle: '' },
    { id: 'gallery', visible: true, title: '', subtitle: '' },
    {
      id: 'work',
      visible: true,
      title: 'Selected work',
      subtitle: 'Things I’ve built and worked on, and what they do.',
    },
    {
      id: 'impact',
      visible: true,
      title: 'I read the research, make it better, *and ship working software.*',
      subtitle: '',
    },
    {
      id: 'skills',
      visible: true,
      title: 'What I work with',
      subtitle: 'From training models to deploying the app around them.',
    },
    { id: 'experience', visible: true, title: 'Experience and education', subtitle: '' },
    { id: 'testimonials', visible: false, title: 'From people I’ve worked with', subtitle: '' },
    { id: 'writing', visible: false, title: 'Writing', subtitle: '' },
    { id: 'contact', visible: true, title: '', subtitle: '' },
  ],
  gallery: [],
  projects: seedProjects,
  impact: [
    { id: 'i1', value: 'Live', label: 'LensBay, on AWS with a CI/CD pipeline' },
    { id: 'i2', value: 'In use', label: 'Highlight Cutter, deployed at FloLabs' },
    { id: 'i3', value: '+9.68', label: 'Accuracy points gained on a published ML paper' },
  ],
  skills: [
    {
      id: 'ai',
      title: 'AI and machine learning',
      description: 'Training, tuning, and reproducing research.',
      items: ['PyTorch', 'TensorFlow', 'Keras', 'Scikit-learn', 'XGBoost', 'Optuna', 'OpenCV', 'Hugging Face', '3D Gaussian Splatting'],
      featured: true,
    },
    {
      id: 'llm',
      title: 'LLMs and NLP',
      description: 'Fine-tuning models and connecting them to real data.',
      items: ['LLM fine-tuning (QLoRA, LoRA)', 'bitsandbytes', 'RAG pipelines', 'LangChain', 'ChromaDB', 'SMOTE', 'RFECV'],
      featured: false,
    },
    {
      id: 'languages',
      title: 'Languages',
      description: '',
      items: ['Python', 'JavaScript', 'Java', 'C / C++', 'C#', 'Dart', 'SQL', 'Bash', 'R'],
      featured: false,
    },
    {
      id: 'backend',
      title: 'Backend',
      description: '',
      items: ['Flask', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
      featured: false,
    },
    {
      id: 'frontend',
      title: 'Frontend and mobile',
      description: '',
      items: ['React', 'HTML5', 'CSS3', 'Flutter'],
      featured: false,
    },
    {
      id: 'devops',
      title: 'DevOps and cloud',
      description: '',
      items: ['GitHub Actions', 'CI/CD pipelines', 'Docker', 'AWS (basic)', 'Automated test suites', 'Domain deployment', 'Git'],
      featured: false,
    },
    {
      id: 'foundations',
      title: 'Foundations',
      description: '',
      items: ['Data structures and algorithms', 'OOP', 'Operating systems', 'Database systems', 'Software architecture', 'Data engineering', 'Data visualization'],
      featured: false,
    },
  ],
  experience: [
    {
      id: 'flolabs',
      company: 'FloLabs',
      role: 'Intern & Co-Team Lead',
      start: 'Aug 2026',
      end: 'Present',
      location: '',
      summary:
        'Built Highlight Cutter, a Python tool that edits Zoom meeting recordings into clean videos and shorts, now deployed and in use at FloLabs. I co-lead the team with another lead, coordinating tasks and tracking progress.',
      url: '',
    },
  ],
  testimonials: [],
  posts: [],
  about: {
    headline: 'I like turning research papers into *software people can use.*',
    intro:
      'I’m a final-year Software Engineering student at FAST-NUCES in Faisalabad, and an Intern and Co-Team Lead at FloLabs.',
    portrait: {
      src: '/profile/ahsan.webp',
      alt: 'Illustrated portrait of Ahsan Yasin, in glasses and a black leather jacket, arms crossed',
      kind: 'image',
      width: 791,
      height: 1280,
    },
    body: 'I work across the stack with Flask, Node.js, React, and Flutter. On the AI side, I build RAG pipelines, fine-tune LLMs with QLoRA, and process video in Python. I’m comfortable with Git, Docker, and GitHub Actions CI/CD, and I know the basics of AWS.\n\nI like starting from the source. I reproduced a published machine learning paper and raised its accuracy from 74.19% to 83.87%, and I built a full 3D Gaussian Splatting pipeline around the original research code. My final year project is LensBay, a marketplace for used camera gear in Pakistan.',
    principlesTitle: 'How I work',
    principles: [
      {
        id: 'pr1',
        title: 'Start from the paper',
        text: 'I reproduce the original work first, so every improvement is measured against something real.',
      },
      {
        id: 'pr2',
        title: 'Measure every change',
        text: 'A full ablation study shows what each step actually added, so nothing rests on assumption.',
      },
      {
        id: 'pr3',
        title: 'Ship it',
        text: 'A tool only counts once people rely on it. Highlight Cutter is deployed and in use at FloLabs.',
      },
    ],
    facts: [
      { id: 'f1', label: 'Based in', value: 'Faisalabad, Pakistan' },
      { id: 'f2', label: 'Graduating', value: '2027' },
      { id: 'f3', label: 'Interested in', value: 'AI, large language models, cybersecurity, mobile engineering, and system design' },
    ],
    awardsTitle: 'Recognition',
    awards: [],
    education: [
      {
        id: 'ed1',
        school: 'FAST-NUCES, Faisalabad',
        degree: 'BS, Software Engineering',
        year: '2023 – 2027',
        summary:
          'Coursework: data structures and algorithms, OOP, operating systems, database systems, artificial intelligence, and software construction and development.',
      },
      { id: 'ed2', school: 'Punjab College', degree: 'Intermediate, Pre-Engineering', year: '', summary: '' },
    ],
  },
  contact: {
    headline: 'Have something to build?',
    body: 'Tell me what you’re working on.',
    ctaLabel: 'Get in touch',
    copyLabel: 'Copy email',
  },
  footer: {
    note: 'Software engineer, building in Faisalabad.',
    copyright: 'Ahsan Yasin',
  },
  theme: {
    mode: 'light',
    surface: 'paper',
    accent: '#FF4D1F',
    font: 'archivo',
    corners: 'round',
    motion: 'full',
    showThemeToggle: true,
    showCommandMenu: true,
  },
};
