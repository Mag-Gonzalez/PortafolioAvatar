/**
 * Contenido centralizado y bilingüe (ES / EN) del portafolio de Miguel Ángel González Muñoz.
 */

export type Locale = "es" | "en";

export type ProjectCategory = "all" | "fullstack" | "creative" | "saas";

export interface Project {
  slug: string;
  category: ProjectCategory;
  name: string;
  shortDesc: { es: string; en: string };
  description: { es: string; en: string };
  highlights: { es: string[]; en: string[] };
  technologies: string[];
  image: string;
  href?: string;
  repository?: string;
}

export interface SkillItem {
  name: string;
  level: "Dominado" | "Avanzado" | "En aprendizaje";
  levelEn: "Mastered" | "Advanced" | "Learning";
  category: "frontend" | "backend" | "tools";
  description: { es: string; en: string };
  popular?: boolean;
}

export interface ExperienceItem {
  period: string;
  role: { es: string; en: string };
  institution: string;
  location: string;
  description: { es: string; en: string };
  skills: string[];
}

export interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  role: { es: string; en: string };
  location: { es: string; en: string };
  badge: { es: string; en: string };
  bio: { es: string; en: string };
  philosophy: { es: string; en: string };
}

export const profile: Profile = {
  name: "Miguel Ángel González Muñoz",
  firstName: "Miguel Ángel",
  lastName: "González Muñoz",
  role: {
    es: "Desarrollador de software en formación",
    en: "Software developer in training",
  },
  location: {
    es: "Colombia (UTC-5)",
    en: "Colombia (UTC-5)",
  },
  badge: {
    es: "Disponible para proyectos & prácticas",
    en: "Available for projects & internships",
  },
  bio: {
    es: "Estudiante de Análisis y Desarrollo de Software (ADSO) en el SENA.",
    en: "Software Analysis and Development (ADSO) student at SENA.",
  },
  philosophy: {
    es: "",
    en: "",
  },
};

export const skillsData: SkillItem[] = [
  // Frontend & Creative
  {
    name: "React 19 & Next.js 16",
    level: "Dominado",
    levelEn: "Mastered",
    category: "frontend",
    description: {
      es: "Arquitectura moderna con Server Components, App Router, SSR y rendimiento óptimo.",
      en: "Modern architecture with Server Components, App Router, SSR, and peak performance.",
    },
    popular: true,
  },
  {
    name: "TypeScript",
    level: "Avanzado",
    levelEn: "Advanced",
    category: "frontend",
    description: {
      es: "Tipado estricto, interfaces limpias y desarrollo mantenible a gran escala.",
      en: "Strict typing, clean interfaces, and scalable maintainable development.",
    },
    popular: true,
  },
  {
    name: "Three.js & React Three Fiber",
    level: "Avanzado",
    levelEn: "Advanced",
    category: "frontend",
    description: {
      es: "Modelado procedural 3D, iluminación PBR, cámaras cinemáticas e interacción con el cursor.",
      en: "Procedural 3D modeling, PBR lighting, cinematic cameras, and cursor interaction.",
    },
    popular: true,
  },
  {
    name: "Tailwind CSS v4",
    level: "Dominado",
    levelEn: "Mastered",
    category: "frontend",
    description: {
      es: "Sistemas de diseño atómicos, micro-animaciones fluidas y maquetación responsive precisa.",
      en: "Atomic design systems, fluid micro-animations, and pixel-perfect responsive layouts.",
    },
    popular: true,
  },
  {
    name: "GSAP & ScrollTrigger",
    level: "Avanzado",
    levelEn: "Advanced",
    category: "frontend",
    description: {
      es: "Líneas de tiempo cinemáticas, scrub interactivo y sincronización de estados con el scroll.",
      en: "Cinematic timelines, interactive scrub, and scroll-synchronized state rigs.",
    },
  },
  {
    name: "Lenis Smooth Scroll",
    level: "Avanzado",
    levelEn: "Advanced",
    category: "frontend",
    description: {
      es: "Scroll inercial de alta precisión y normalización de eventos para experiencias inmersivas.",
      en: "High-precision inertial scrolling and normalized events for immersive experiences.",
    },
  },

  // Backend & Cloud
  {
    name: "Node.js & Express",
    level: "Avanzado",
    levelEn: "Advanced",
    category: "backend",
    description: {
      es: "APIs RESTful seguras, middlewares, autenticación JWT y manejo robusto de peticiones.",
      en: "Secure RESTful APIs, custom middlewares, JWT authentication, and request handling.",
    },
    popular: true,
  },
  {
    name: "PostgreSQL & SQL",
    level: "Avanzado",
    levelEn: "Advanced",
    category: "backend",
    description: {
      es: "Diseño relacional de datos, normalización, consultas optimizadas e integridad referencial.",
      en: "Relational data modeling, normalization, optimized queries, and referential integrity.",
    },
    popular: true,
  },
  {
    name: "Prisma ORM",
    level: "Avanzado",
    levelEn: "Advanced",
    category: "backend",
    description: {
      es: "Mapeo objeto-relacional con esquemas tipados de extremo a extremo y migraciones automáticas.",
      en: "Type-safe end-to-end ORM schemas, relations, and automated database migrations.",
    },
  },
  {
    name: "REST APIs & WebSockets",
    level: "Avanzado",
    levelEn: "Advanced",
    category: "backend",
    description: {
      es: "Diseño de endpoints estandarizados y comunicación bidireccional en tiempo real.",
      en: "Standardized API endpoints design and real-time bi-directional communication.",
    },
  },

  // Herramientas & Workflow
  {
    name: "Git & GitHub",
    level: "Dominado",
    levelEn: "Mastered",
    category: "tools",
    description: {
      es: "Control de versiones profesional, flujo de ramas, pull requests y CI/CD.",
      en: "Professional version control, branching strategies, code reviews, and CI/CD.",
    },
    popular: true,
  },
  {
    name: "Figma & UI Prototyping",
    level: "Avanzado",
    levelEn: "Advanced",
    category: "tools",
    description: {
      es: "Wireframing, diseño de sistemas de tokens, componentes y prototipado interactivo.",
      en: "Wireframing, design system token architecture, and interactive UI prototyping.",
    },
  },
  {
    name: "Scrum & Metodologías Ágiles",
    level: "Avanzado",
    levelEn: "Advanced",
    category: "tools",
    description: {
      es: "Gestión de sprints, estimación de historias de usuario y trabajo colaborativo enfocado a entregas.",
      en: "Sprint management, user story estimation, and delivery-focused team collaboration.",
    },
  },
];

export const experienceData: ExperienceItem[] = [
  {
    period: "2024 — Presente",
    role: {
      es: "Tecnólogo en Análisis y Desarrollo de Software (ADSO)",
      en: "Software Analysis and Development Technologist",
    },
    institution: "SENA — Servicio Nacional de Aprendizaje",
    location: "Colombia",
    description: {
      es: "Formación integral en desarrollo de aplicaciones empresariales, ingeniería de requerimientos, diseño de bases de datos relacionales, POO, buenas prácticas de desarrollo y control de calidad de software.",
      en: "Comprehensive training in enterprise application engineering, requirements elicitation, relational database architecture, OOP principles, clean code practices, and software QA.",
    },
    skills: ["Análisis de Requisitos", "UML", "Bases de Datos", "Full Stack", "Scrum"],
  },
  {
    period: "2023 — Presente",
    role: {
      es: "Desarrollador Web Independiente & Creative Coder",
      en: "Independent Web Developer & Creative Coder",
    },
    institution: "Freelance & Proyectos Personales",
    location: "Remoto / Colombia",
    description: {
      es: "Construcción de aplicaciones web interactivas para clientes y proyectos propios de alto impacto visual. Especialización en Three.js, React, animaciones cinemáticas y optimización de rendimiento.",
      en: "Crafting interactive web applications for clients and personal high-impact creative projects. Specializing in Three.js, React, cinematic animations, and performance profiling.",
    },
    skills: ["React", "Next.js", "Three.js", "TypeScript", "Tailwind CSS"],
  },
];

export const projects: Project[] = [
  {
    slug: "reserva",
    category: "saas",
    name: "ReserVa",
    shortDesc: { es: "Desarrollo web", en: "Web development" },
    description: { es: "Proyecto de desarrollo web.", en: "Web development project." },
    highlights: { es: [], en: [] },
    technologies: [],
    image: "",
  },
  {
    slug: "zarfa",
    category: "creative",
    name: "ZARFA",
    shortDesc: { es: "Proyecto musical", en: "Music project" },
    description: { es: "Proyecto musical.", en: "Music project." },
    highlights: { es: [], en: [] },
    technologies: [],
    image: "",
  },
];

export const site = {
  title: "Miguel Ángel González Muñoz — Desarrollador de software en formación",
  titleEn: "Miguel Ángel González Muñoz — Software Developer in Training",
  description:
    "Portafolio de Miguel Ángel González Muñoz, estudiante ADSO del SENA. Desarrollo web, interfaces y proyectos como ReserVa.",
  descriptionEn:
    "Portfolio of Miguel Ángel González Muñoz, SENA ADSO student. Web development, interfaces, and projects such as ReserVa.",
  copyright: `© ${new Date().getFullYear()} Miguel Ángel González Muñoz`,
  musicCredit: "",
};
