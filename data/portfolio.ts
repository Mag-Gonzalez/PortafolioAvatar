/**
 * Contenido centralizado y bilingüe (ES / EN) del portafolio de Miguel Angel Gonzalez Muñoz.
 * Inspirado en la estructura y excelencia técnica de david-hckh.com.
 */

export type Locale = "es" | "en";

export type ProjectCategory = "all" | "fullstack" | "creative" | "saas";
export type ProjectStatus = "disponible" | "en-progreso" | "completado";

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
  status: ProjectStatus;
  year: string;
  metrics?: string;
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
  email: string;
  socials: Array<{
    label: string;
    href: string;
    icon: "mail" | "github" | "linkedin";
  }>;
  stats: Array<{
    value: string;
    label: { es: string; en: string };
  }>;
}

export const profile: Profile = {
  name: "Miguel Angel Gonzalez Muñoz",
  firstName: "Miguel Angel",
  lastName: "Gonzalez Muñoz",
  role: {
    es: "Desarrollador Full Stack & Creative Web",
    en: "Full Stack & Creative Web Developer",
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
    es: "Estudiante de Análisis y Desarrollo de Software (ADSO) en el SENA. Apasionado por la intersección entre ingeniería de software robusta y experiencias web interactivas en 3D con Three.js, React y Next.js.",
    en: "Software Analysis and Development (ADSO) student at SENA. Passionate about bridging robust software engineering with immersive 3D interactive web experiences using Three.js, React, and Next.js.",
  },
  philosophy: {
    es: "Creo en escribir código limpio, interfaces intuitivas con atención microscópica al detalle y construir productos que no solo funcionen a la perfección, sino que se sientan vivos e interactivos.",
    en: "I believe in clean maintainable code, intuitive interfaces with microscopic attention to detail, and building digital products that not only work seamlessly but feel alive and responsive.",
  },
  email: "miguel.gonzalez.dev@gmail.com",
  socials: [
    { label: "Email", href: "mailto:miguel.gonzalez.dev@gmail.com", icon: "mail" },
    { label: "GitHub", href: "https://github.com", icon: "github" },
    { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  ],
  stats: [
    { value: "+2", label: { es: "Años de formación técnica", en: "Years technical study" } },
    { value: "4+", label: { es: "Proyectos integrales creados", en: "Full-scale projects built" } },
    { value: "100%", label: { es: "Compromiso y detalle visual", en: "Commitment & visual polish" } },
  ],
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
    year: "2025",
    shortDesc: {
      es: "Sistema web de gestión de mesas y reservas en tiempo real para restaurantes.",
      en: "Real-time table reservation and restaurant management web system.",
    },
    description: {
      es: "Plataforma integral diseñada para optimizar la operativa gastronómica. Permite a los clientes reservar mesas con visualización de aforo en vivo, mientras los administradores gestionan turnos, cancelaciones y cartas digitales con sincronización instantánea.",
      en: "Comprehensive platform engineered to streamline restaurant operations. Allows customers to book tables with live occupancy previews while managers control shifts, cancellations, and digital menus with instant sync.",
    },
    highlights: {
      es: [
        "Selector interactivo de mesas en tiempo real con estados de ocupación",
        "Panel administrativo con métricas de aforo y cancelaciones",
        "Diseño responsive adaptado a tablets para meseros y smartphones para clientes",
        "Autenticación segura y panel de control por roles",
      ],
      en: [
        "Interactive real-time table selector with live occupancy states",
        "Admin dashboard featuring capacity metrics and booking analytics",
        "Responsive layout optimized for waiter tablets and customer smartphones",
        "Role-based access control and secure authentication",
      ],
    },
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    image: "/assets/projects/reserva.svg",
    href: "https://github.com",
    repository: "https://github.com",
    status: "disponible",
    metrics: "Optimizado para +100 mesas simultáneas",
  },
  {
    slug: "devspace-3d",
    category: "creative",
    name: "DevSpace 3D Portfolio",
    year: "2025",
    shortDesc: {
      es: "Experiencia de portafolio inmersiva inspirada en WebGL y arquitectura cinemática.",
      en: "Immersive portfolio experience inspired by WebGL and cinematic architecture.",
    },
    description: {
      es: "Sitio web de portafolio que traslada la visión interactiva de david-hckh.com al ecosistema Next.js. Incluye un avatar 3D fiel modelado proceduralmente, renderizado R3F, control de cámara por scroll y paneles HUD holográficos.",
      en: "Portfolio platform translating david-hckh.com's interactive vision into Next.js. Features a procedural 3D avatar modeled accurately after the developer, R3F rendering, scroll camera rig, and floating HUD panels.",
    },
    highlights: {
      es: [
        "Avatar 3D procedural con seguimiento de cursor y rasgos faciales exactos",
        "Sincronización cinemática con Lenis y GSAP ScrollTrigger",
        "Sintetizador de sonido interactivo con Web Audio API",
        "Soporte bilingüe instantáneo (ES / EN) y modo de accesibilidad",
      ],
      en: [
        "Procedural 3D avatar with cursor tracking and accurate facial features",
        "Cinematic scroll orchestration with Lenis and GSAP ScrollTrigger",
        "Interactive sound synthesizer powered by the Web Audio API",
        "Instant bilingual support (ES / EN) and reduced motion accessibility",
      ],
    },
    technologies: ["Three.js", "React Three Fiber", "GSAP", "Lenis", "TypeScript"],
    image: "/assets/projects/devspace-3d.svg",
    href: "#top",
    repository: "https://github.com",
    status: "disponible",
    metrics: "60 FPS estables con bajo consumo de memoria",
  },
  {
    slug: "adso-inventory",
    category: "fullstack",
    name: "ADSO Inventory Cloud",
    year: "2024",
    shortDesc: {
      es: "Sistema empresarial de control de inventario y trazabilidad de activos.",
      en: "Enterprise inventory control and asset traceability cloud system.",
    },
    description: {
      es: "Aplicación desarrollada en el marco del programa ADSO SENA para la gestión de suministros en almacenes. Incorpora control de entradas y salidas por código, alertas de stock mínimo, generación de reportes PDF y auditoría de movimientos.",
      en: "Application developed within SENA ADSO for warehouse supply and asset tracking. Features stock in/out logging, barcode support, minimum stock alerts, PDF reporting, and audit logs.",
    },
    highlights: {
      es: [
        "Control granular de stock con historial inmutable de movimientos",
        "Generación automática de reportes de rotación y valoración de activos",
        "Validación de esquemas con TypeScript y Zod",
        "Base de datos relacional con claves foráneas e integridad estricta",
      ],
      en: [
        "Granular inventory tracking with immutable movement logs",
        "Automated PDF export for inventory turnover and asset valuation",
        "Schema validation using TypeScript and Zod",
        "Relational database design with strict foreign key constraints",
      ],
    },
    technologies: ["TypeScript", "Node.js", "Express", "PostgreSQL", "Tailwind CSS"],
    image: "/assets/projects/adso-inventory.svg",
    href: "https://github.com",
    repository: "https://github.com",
    status: "completado",
    metrics: "Trazabilidad de +5,000 referencias",
  },
  {
    slug: "soundwave-studio",
    category: "creative",
    name: "SoundWave Web Audio",
    year: "2024",
    shortDesc: {
      es: "Visualizador tridimensional interactivo reactivo a frecuencias sonoras.",
      en: "Interactive 3D sound visualizer reacting to audio frequencies.",
    },
    description: {
      es: "Laboratorio creativo que fusiona Web Audio API con Three.js. Analiza el espectro de frecuencias de audio en tiempo real para deformar mallas tridimensionales con shaders GLSL y crear una experiencia inmersiva reactiva.",
      en: "Creative playground merging Web Audio API with Three.js. Analyzes real-time frequency data through FFT nodes to displace 3D meshes with GLSL shaders in an immersive audio visualizer.",
    },
    highlights: {
      es: [
        "Análisis FFT en tiempo real con Web Audio API",
        "Shaders GLSL procedurales con deformación por ruido Perlin",
        "Controles de iluminación reactiva y paletas de color dinámicas",
        "Modo interactivo con micrófono en vivo o pistas de audio",
      ],
      en: [
        "Real-time FFT audio frequency analysis with Web Audio API",
        "Procedural GLSL vertex shaders with Perlin noise displacement",
        "Reactive lighting controls and dynamic color gradient palettes",
        "Interactive microphone mode and audio track playback",
      ],
    },
    technologies: ["Web Audio API", "Three.js", "GLSL", "React", "Canvas API"],
    image: "/assets/projects/soundwave.svg",
    href: "https://github.com",
    repository: "https://github.com",
    status: "disponible",
    metrics: "Latencia de análisis < 16ms",
  },
];

export const site = {
  title: "Miguel Angel Gonzalez Muñoz — Desarrollador Full Stack & Creative Web",
  titleEn: "Miguel Angel Gonzalez Muñoz — Full Stack & Creative Web Developer",
  description:
    "Portafolio interactivo de Miguel Angel Gonzalez Muñoz, estudiante ADSO SENA. Desarrollo web moderno, experiencias 3D con Three.js, React y Next.js.",
  descriptionEn:
    "Interactive portfolio of Miguel Angel Gonzalez Muñoz, SENA ADSO student. Modern web engineering, immersive 3D experiences with Three.js, React, and Next.js.",
  copyright: `© ${new Date().getFullYear()} Miguel Angel Gonzalez Muñoz. Inspirado en david-hckh.com`,
  musicCredit: "Web Audio Synthesizer Engine",
};
