import { ResumeData, SectionType } from './types';

export const INITIAL_DATA: ResumeData = {
    profile: {
        fullName: "John Smith",
        phone: "+1 (555) 123-4567",
        email: "john.smith@example.com",
        location: "San Francisco, CA",
        website: "https://johnsmith.dev"
    },
    sections: [
        {
            id: 'summary',
            type: SectionType.SUMMARY,
            title: "PROFESSIONAL SUMMARY",
            items: [
                {
                    id: 'sum-1',
                    description: "Experienced software engineer with 8+ years of expertise in building scalable distributed systems, cloud infrastructure, and full-stack applications. Proven track record of delivering high-impact products at leading technology companies. Strong background in backend services, frontend development, and cloud engineering with a focus on performance optimization and system reliability."
                }
            ]
        },
        {
            id: 'skills',
            type: SectionType.SKILLS,
            title: "SKILLS",
            items: [
                { id: 'sk-1', title: "Front-end", description: "React.js, Next.js, Redux, TypeScript, JavaScript, HTML5, CSS3" },
                { id: 'sk-2', title: "Back-end", description: "Java, Python, Go, Node.js, Spring Boot, RESTful APIs, GraphQL" },
                { id: 'sk-3', title: "Cloud services", description: "AWS (EC2, S3, Lambda, DynamoDB), Google Cloud Platform, Azure" },
                { id: 'sk-4', title: "Data", description: "PostgreSQL, MySQL, MongoDB, Redis, BigQuery" },
                { id: 'sk-5', title: "API", description: "RESTful API, GraphQL, gRPC, OpenAPI, Swagger" },
                { id: 'sk-6', title: "CI/CD", description: "Jenkins, GitHub Actions, Kubernetes, Docker, Terraform" },
                { id: 'sk-7', title: "AI/ML", description: "TensorFlow, PyTorch, Machine Learning pipelines, LLM integration" },
                { id: 'sk-8', title: "Infrastructure as Code (IaC)", description: "Terraform, Helm Charts, Ansible, Kubernetes YAML" },
                { id: 'sk-9', title: "Methodologies and tools", description: "Agile/Scrum, Git, Jira, Confluence, Visual Studio Code, IntelliJ IDEA" },
            ]
        },
        {
            id: 'exp',
            type: SectionType.EXPERIENCE,
            title: "PROFESSIONAL EXPERIENCE",
            items: [
                {
                    id: 'exp-1',
                    title: "Senior Software Engineer",
                    subtitle: "Google",
                    date: "Jan 2023 - Present",
                    location: "Mountain View, CA",
                    description: "• Designed and implemented scalable microservices architecture for Google Cloud Platform, serving millions of users daily.\n• Optimized critical backend services, reducing latency by 40% and improving system throughput by 60%.\n• Led cross-functional team of 5 engineers to deliver major features for cloud infrastructure products.\n• Built and maintained high-performance APIs handling 10M+ requests per day with 99.9% uptime.\n• Mentored junior engineers and contributed to technical design reviews and architecture decisions."
                },
                {
                    id: 'exp-2',
                    title: "Software Engineer",
                    subtitle: "Meta",
                    date: "Jun 2020 - Dec 2022",
                    location: "Menlo Park, CA",
                    description: "• Developed and maintained core features for social media platform, impacting 2B+ users globally.\n• Built real-time notification systems using distributed messaging infrastructure, reducing delivery time by 50%.\n• Implemented machine learning pipelines for content recommendation, improving user engagement by 25%.\n• Collaborated with product and design teams to ship user-facing features with A/B testing frameworks.\n• Contributed to open-source projects and internal tooling to improve developer productivity."
                },
                {
                    id: 'exp-3',
                    title: "Software Development Engineer",
                    subtitle: "Amazon",
                    date: "Jul 2018 - May 2020",
                    location: "Seattle, WA",
                    description: "• Developed full-stack features for e-commerce platform, handling millions of transactions daily.\n• Built scalable backend services using AWS infrastructure, reducing operational costs by 30%.\n• Implemented automated testing frameworks, increasing test coverage from 60% to 90%.\n• Participated in on-call rotation and incident response, maintaining 99.95% service availability.\n• Worked on payment processing systems with focus on security and compliance requirements."
                }
            ]
        },
        {
            id: 'edu',
            type: SectionType.EDUCATION,
            title: "EDUCATION",
            items: [
                {
                    id: 'edu-1',
                    title: "Master of Science in Computer Science",
                    subtitle: "Stanford University",
                    date: "Sep 2016 - Jun 2018",
                    description: "Courses: Distributed Systems, Machine Learning, Database Systems, Algorithms and Data Structures"
                },
                {
                    id: 'edu-2',
                    title: "Bachelor of Science in Computer Science",
                    subtitle: "University of California, Berkeley",
                    date: "Sep 2012 – Jun 2016",
                    description: "Courses: Software Engineering, Operating Systems, Computer Networks, Data Structures"
                }
            ]
        },
        {
            id: 'cert',
            type: SectionType.CUSTOM,
            title: "CERTIFICATION",
            items: [
                {
                    id: 'cert-1',
                    title: "AWS Certified Solutions Architect - Professional",
                    date: "Mar 2023"
                },
                {
                    id: 'cert-2',
                    title: "Google Cloud Professional Cloud Architect",
                    date: "Nov 2022"
                }
            ]
        }
    ]
};