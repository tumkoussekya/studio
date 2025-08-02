
export interface JobOpening {
    id: string;
    title: string;
    location: string;
    department: string;
    description: string;
    responsibilities: string[];
    qualifications: string[];
}

const jobOpenings: JobOpening[] = [
    {
        id: 'senior-frontend-engineer',
        title: 'Senior Frontend Engineer',
        location: 'Remote',
        department: 'Engineering',
        description: 'We are looking for a seasoned Senior Frontend Engineer to lead the development of our user-facing features. You will be responsible for building beautiful, performant, and accessible user interfaces using Next.js and React. You will work closely with our design and backend teams to bring our virtual collaboration platform to life.',
        responsibilities: [
            'Architect and build modern, responsive, and reusable components in React and TypeScript.',
            'Lead technical discussions and contribute to architectural decisions.',
            'Mentor junior engineers and advocate for best practices.',
            'Collaborate with designers to implement pixel-perfect user interfaces.',
            'Optimize application performance for a seamless user experience.',
        ],
        qualifications: [
            '5+ years of experience in frontend development with React.',
            'Deep understanding of Next.js, TypeScript, and Tailwind CSS.',
            'Proven experience building and shipping complex, scalable web applications.',
            'Strong knowledge of modern web technologies and best practices.',
            'Excellent communication and collaboration skills.',
        ],
    },
    {
        id: 'product-designer',
        title: 'Product Designer',
        location: 'Remote',
        department: 'Design',
        description: 'As a Product Designer at SyncroSpace, you will shape the user experience of our platform. You will be involved in every aspect of the product development process, from brainstorming the next great feature to tweaking pixels right before launch. You will create intuitive, engaging, and beautiful designs that solve real problems for our users.',
        responsibilities: [
            'Conduct user research to understand user needs and pain points.',
            'Create wireframes, mockups, and prototypes for new features.',
            'Develop and maintain our design system and component library.',
            'Collaborate with engineers to ensure high-quality implementation of your designs.',
            'Analyze user feedback and iterate on designs to improve the user experience.',
        ],
        qualifications: [
            '3+ years of experience in product design (UX/UI).',
            'A strong portfolio showcasing your design process and shipped work.',
            'Proficiency in design tools like Figma, Sketch, or Adobe XD.',
            'Experience with designing for complex web applications.',
            'A user-centric mindset and a passion for creating intuitive products.',
        ],
    },
    {
        id: 'backend-engineer-ai-ml',
        title: 'Backend Engineer (AI/ML)',
        location: 'Remote',
        department: 'Engineering',
        description: 'We are seeking a talented Backend Engineer with a passion for AI and Machine Learning to join our team. You will be responsible for building and maintaining the backend services that power our AI assistant, Alex, and other intelligent features within SyncroSpace. You will work with large language models, data pipelines, and cloud infrastructure to deliver cutting-edge collaborative experiences.',
        responsibilities: [
            'Design, build, and maintain scalable backend services and APIs.',
            'Integrate and fine-tune large language models (LLMs) for specific tasks.',
            'Develop data processing pipelines for training and evaluating AI models.',
            'Work with our frontend team to integrate AI features into the user interface.',
            'Monitor and optimize the performance and cost of our AI infrastructure.',
        ],
        qualifications: [
            '3+ years of experience in backend development (e.g., Node.js, Python, Go).',
            'Experience working with cloud platforms (e.g., Google Cloud, AWS).',
            'Familiarity with AI/ML concepts and experience with LLM APIs (e.g., Genkit, LangChain).',
            'Strong understanding of API design and microservices architecture.',
            'A desire to work at the intersection of collaboration software and artificial intelligence.',
        ],
    },
];

export function getAllJobs() {
    return jobOpenings;
}

export function getJobById(id: string) {
    return jobOpenings.find(job => job.id === id);
}
