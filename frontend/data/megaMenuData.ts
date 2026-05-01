export type MegaMenuIcon =
  | "GraduationCap"
  | "Stethoscope"
  | "Scale"
  | "Briefcase"
  | "Building2"
  | "BookOpen";

export type MegaMenuLink = {
  label: string;
  href: string;
  isNew?: boolean;
};

export type MegaMenuSection = {
  label: string;
  isNew?: boolean;
  links: MegaMenuLink[];
};

export type MegaMenuCategory = {
  key: string;
  label: string;
  icon: MegaMenuIcon;
  sections: MegaMenuSection[];
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createLink = (category: string, label: string, isNew = false): MegaMenuLink => ({
  label,
  href: `/${slugify(category)}/${slugify(label)}`,
  ...(isNew ? { isNew: true } : {}),
});

const createSection = (
  category: string,
  label: string,
  links: Array<string | { label: string; isNew?: boolean }>,
  isNew = false,
): MegaMenuSection => ({
  label,
  ...(isNew ? { isNew: true } : {}),
  links: links.map((link) =>
    typeof link === "string"
      ? createLink(category, link)
      : createLink(category, link.label, link.isNew ?? false),
  ),
});

export const megaMenuCategories: MegaMenuCategory[] = [
  {
    key: "engineering",
    label: "Engineering",
    icon: "GraduationCap",
    sections: [
      createSection("engineering", "College Admissions", [
        "College Accepting B.Tech Applications",
        "JEE Main Cutoff 2024",
        "B.Tech Admission 2024",
        "Top Engineering Colleges in India",
        "Engineering Colleges Accepting JEE Main",
        "B.Tech Fees Structure",
      ]),
      createSection("engineering", "Exams", [
        "JEE Main 2025",
        "JEE Advanced 2025",
        "BITSAT 2025",
        "VITEEE 2025",
        "MHT CET 2025",
        "AP EAMCET 2025",
        "KCET 2025",
        "View All Engineering Exams",
      ]),
      createSection("engineering", "Colleges", [
        "Top Engineering Colleges in India",
        "Engineering Colleges in India",
        "Engineering Colleges in Tamilnadu",
        "Engineering Colleges Accepting JEE Main",
        "Top IITs in India",
        "Top NITs in India",
        "Top IIITs in India",
      ]),
      createSection("engineering", "Predictors", [
        "JEE Main College Predictor",
        { label: "JEE Main Rank Predictor", isNew: true },
        "MHT CET College Predictor",
        "AP EAMCET College Predictor",
        "GATE College Predictor",
        "KCET College Predictor",
        "JEE Advanced College Predictor",
        "View All College Predictors",
      ]),
      createSection("engineering", "Resources", [
        "JEE Main Previous Year Papers",
        "JEE Main Syllabus",
        "JEE Main Cut Off",
        "JEE Main Answer Key",
        "Engineering Entrance Exams",
      ]),
      createSection("engineering", "Careers", [
        "Career as Engineer",
        "Top Engineering Branches",
        "Highest Paying Engineering Jobs",
        "Engineering Salary in India",
      ]),
      createSection(
        "engineering",
        "Foreign Universities in India",
        [
          { label: "Foreign Universities in India", isNew: true },
          "International Colleges in India",
          "Study Abroad Programs",
        ],
        true,
      ),
    ],
  },
  {
    key: "medicine",
    label: "Medicine",
    icon: "Stethoscope",
    sections: [
      createSection("medicine", "College Admissions", [
        "MBBS Colleges in India",
        "BDS Colleges in India",
        "Colleges Accepting NEET Score",
        "MBBS Fees in India",
        "Top Medical Colleges in India",
      ]),
      createSection("medicine", "Exams", [
        "NEET UG 2025",
        "NEET PG 2025",
        "AIIMS 2025",
        "JIPMER 2025",
        "View All Medical Exams",
      ]),
      createSection("medicine", "Colleges", [
        "Government Medical Colleges",
        "Private Medical Colleges",
        "Deemed Medical Universities",
        "Top MBBS Colleges in India",
        "Top BDS Colleges in India",
      ]),
      createSection("medicine", "Predictors", [
        "NEET College Predictor",
        "NEET UG State Wise Predictor",
        "MBBS College Predictor",
      ]),
      createSection("medicine", "Resources", [
        "NEET Syllabus 2025",
        "NEET Previous Year Papers",
        "NEET Cut Off",
        "NEET Answer Key",
      ]),
    ],
  },
  {
    key: "law",
    label: "Law",
    icon: "Scale",
    sections: [
      createSection("law", "College Admissions", [
        "Top Law Colleges in India",
        "BA LLB Colleges",
        "LLB Colleges in India",
        "Law Colleges Accepting CLAT",
      ]),
      createSection("law", "Exams", [
        "CLAT 2025",
        "AILET 2025",
        "LSAT India 2025",
        "MH CET Law 2025",
        "View All Law Exams",
      ]),
      createSection("law", "Colleges", [
        "National Law Universities (NLUs)",
        "Top Private Law Colleges",
        "Law Colleges in Delhi",
        "Law Colleges in Mumbai",
      ]),
      createSection("law", "Predictors", [
        "CLAT College Predictor",
        "AILET College Predictor",
      ]),
    ],
  },
  {
    key: "management",
    label: "Management and Business Administration",
    icon: "Briefcase",
    sections: [
      createSection("management", "College Admissions", [
        "Top MBA Colleges in India",
        "PGDM Colleges in India",
        "MBA Colleges Accepting CAT",
        "MBA Fees in India",
      ]),
      createSection("management", "Exams", [
        "CAT 2025",
        "XAT 2025",
        "SNAP 2025",
        "MAT 2025",
        "CMAT 2025",
        "GMAT 2025",
        "View All MBA Exams",
      ]),
      createSection("management", "Colleges", [
        "IIMs in India",
        "Top MBA Colleges in India",
        "Online MBA Colleges",
        "MBA Colleges in Mumbai",
        "MBA Colleges in Bangalore",
      ]),
      createSection("management", "Predictors", [
        "CAT College Predictor",
        "MBA College Predictor",
        "XAT College Predictor",
      ]),
      createSection("management", "Resources", [
        "CAT Syllabus",
        "CAT Previous Year Papers",
        "MBA Salary in India",
      ]),
    ],
  },
  {
    key: "university",
    label: "University",
    icon: "Building2",
    sections: [
      createSection("university", "Central Universities", [
        "Delhi University (DU)",
        "Banaras Hindu University (BHU)",
        "Jawaharlal Nehru University (JNU)",
        "University of Hyderabad",
        "Aligarh Muslim University",
      ]),
      createSection("university", "State Universities", [
        "Mumbai University",
        "Pune University",
        "Osmania University",
        "Anna University",
      ]),
      createSection("university", "Deemed Universities", [
        "VIT University",
        "Manipal University",
        "Amity University",
        "SRM University",
      ]),
      createSection("university", "Online Universities", [
        "IGNOU",
        "Online Degree Programs",
        "Distance Learning Colleges",
      ]),
    ],
  },
  {
    key: "school",
    label: "School",
    icon: "BookOpen",
    sections: [
      createSection("school", "Board Exams", [
        "Karnataka PUC 2nd Result Link",
        "CBSE 10th Exam",
        "ICSE 10th",
        "Maharashtra SSC",
        "UP Board 10th",
        "RBSE 10th",
        "Bihar Board 10th",
        "CBSE 12th",
        "ISC 12th",
        "Maharashtra HSC",
        "UP Board 12th",
        "RBSE 12th",
        "Bihar Board 12th",
        "View All",
      ]),
      createSection("school", "Top Schools", []),
      createSection("school", "NCERT", []),
      createSection("school", "Scholarships & Olympiad", []),
    ],
  },
];
