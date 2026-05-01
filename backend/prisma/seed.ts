import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "../src/generated/prisma";
import { colleges, reviewBodies, reviewRatings, reviewUsers } from "../src/data/seedData";

dotenv.config();

const prisma = new PrismaClient();

type DiscussionSeed = {
  title: string;
  body?: string;
  category: "engineering" | "medicine" | "law" | "management" | "university" | "design";
  tags: string[];
  authorIndex: number;
  isPinned?: boolean;
  isSolved?: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  answers: Array<{
    body: string;
    authorIndex: number;
    upvotes: number;
    isAccepted?: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
};

const discussions: DiscussionSeed[] = [
  {
    title: "What is the expected JEE Main 2025 cutoff for NIT Trichy CSE branch?",
    body:
      "I am targeting NIT Trichy CSE through JEE Main 2025. My percentile in mocks is around 99.3 and I belong to the general category. Looking for realistic closing rank expectations and whether home state advantage matters here.",
    category: "engineering",
    tags: ["JEE Main", "NIT", "CSE", "Cutoff"],
    authorIndex: 0,
    isSolved: true,
    views: 142,
    createdAt: "2026-04-29T08:15:00.000Z",
    updatedAt: "2026-04-30T11:40:00.000Z",
    answers: [
      {
        body:
          "For open category outside Tamil Nadu, CSE at NIT Trichy usually closes in a very tight range. A percentile around 99.6 plus is generally safer, but the exact rank depends on paper difficulty and seat matrix. Your current mock score is strong, though you should still keep NIT Surathkal and Warangal as parallel targets.",
        authorIndex: 1,
        upvotes: 18,
        isAccepted: true,
        createdAt: "2026-04-29T10:00:00.000Z",
        updatedAt: "2026-04-30T11:40:00.000Z",
      },
      {
        body:
          "Home state does not help for NIT Trichy unless you fall into that quota, so focus on all-India closing ranks. If you are around 5k rank or better, you remain in the conversation for CSE or ECE depending on the year.",
        authorIndex: 2,
        upvotes: 11,
        createdAt: "2026-04-29T12:30:00.000Z",
        updatedAt: "2026-04-29T12:30:00.000Z",
      },
      {
        body:
          "Use previous JoSAA round 6 data instead of just round 1. A lot of students overestimate their branch jump chances from round 1 cutoffs, but the final closing rank tells a more realistic story.",
        authorIndex: 3,
        upvotes: 8,
        createdAt: "2026-04-30T07:10:00.000Z",
        updatedAt: "2026-04-30T07:10:00.000Z",
      },
    ],
  },
  {
    title: "Which is better for MBA — IIM Ahmedabad or IIM Bangalore?",
    body:
      "I want to specialise in consulting or finance after MBA. I know both IIM Ahmedabad and IIM Bangalore are top tier, but I would like to understand how they differ in placements, peer group, alumni network, city exposure, and long-term brand value.",
    category: "management",
    tags: ["MBA", "IIM", "CAT"],
    authorIndex: 1,
    isPinned: true,
    views: 286,
    createdAt: "2026-04-26T09:00:00.000Z",
    updatedAt: "2026-04-30T16:00:00.000Z",
    answers: [
      {
        body:
          "If your target is consulting, both are elite and recruiters treat them similarly at the top end. Ahmedabad often gets praised for case culture and finance pedigree, while Bangalore benefits from location, startup exposure, and a strong mix of consulting plus product opportunities.",
        authorIndex: 0,
        upvotes: 27,
        createdAt: "2026-04-26T10:00:00.000Z",
        updatedAt: "2026-04-26T10:00:00.000Z",
      },
      {
        body:
          "For finance specifically, IIM Ahmedabad has a slightly stronger traditional reputation, especially for front-end roles and alumni perception. That said, your final result will still depend much more on profile, summer internship conversion, and how you rank within the batch.",
        authorIndex: 3,
        upvotes: 22,
        createdAt: "2026-04-26T11:20:00.000Z",
        updatedAt: "2026-04-26T11:20:00.000Z",
      },
      {
        body:
          "Bangalore feels more connected to product, tech, and startup conversations because of the city ecosystem. If you think there is a chance you may pivot into PM or tech strategy, IIMB gives a very practical edge outside the classroom.",
        authorIndex: 4,
        upvotes: 16,
        createdAt: "2026-04-27T08:40:00.000Z",
        updatedAt: "2026-04-27T08:40:00.000Z",
      },
      {
        body:
          "Visit both campuses if you can. Cultural fit matters a lot more than applicants expect, especially in a two-year residential MBA where peer learning is the real differentiator.",
        authorIndex: 2,
        upvotes: 10,
        createdAt: "2026-04-29T07:15:00.000Z",
        updatedAt: "2026-04-29T07:15:00.000Z",
      },
      {
        body:
          "In placements, the difference is rarely large enough to make or break a career. Choose based on learning environment, city preference, and whether you want a more traditional general management image or a more tech-connected ecosystem.",
        authorIndex: 1,
        upvotes: 9,
        createdAt: "2026-04-30T16:00:00.000Z",
        updatedAt: "2026-04-30T16:00:00.000Z",
      },
    ],
  },
  {
    title: "NEET 2025 — Can I get government MBBS college with 550 score?",
    body:
      "I am from Rajasthan and my expected NEET score is around 550. I am trying to understand whether government MBBS is realistic in 2025 or if I should prepare mentally for semi-government and private options too.",
    category: "medicine",
    tags: ["NEET", "MBBS", "Government College"],
    authorIndex: 2,
    isSolved: true,
    views: 198,
    createdAt: "2026-04-27T06:50:00.000Z",
    updatedAt: "2026-04-30T09:15:00.000Z",
    answers: [
      {
        body:
          "At 550, government MBBS may still be possible in some states or through later counselling rounds, but for a general category seat in high-demand states it is usually tight. Keep BDS, deemed, and state quota options ready so you are not forced into rushed decisions later.",
        authorIndex: 0,
        upvotes: 20,
        isAccepted: true,
        createdAt: "2026-04-27T08:20:00.000Z",
        updatedAt: "2026-04-30T09:15:00.000Z",
      },
      {
        body:
          "Please compare your target with last year's state counselling closing scores, not just all-India quota. The answer changes a lot depending on domicile, reservation, and whether you are willing to consider peripheral colleges.",
        authorIndex: 1,
        upvotes: 13,
        createdAt: "2026-04-27T11:00:00.000Z",
        updatedAt: "2026-04-27T11:00:00.000Z",
      },
      {
        body:
          "Rajasthan usually stays competitive, so a backup strategy matters. Make a realistic list with 3 layers: dream government options, reasonable state/private options, and safe colleges where counselling chances remain alive.",
        authorIndex: 4,
        upvotes: 12,
        createdAt: "2026-04-28T14:30:00.000Z",
        updatedAt: "2026-04-28T14:30:00.000Z",
      },
      {
        body:
          "If you are very close to 550 in mocks, focus on avoiding careless mistakes right now rather than trying to jump content suddenly. Even 15 to 20 extra marks can completely change the counselling picture.",
        authorIndex: 3,
        upvotes: 7,
        createdAt: "2026-04-29T18:40:00.000Z",
        updatedAt: "2026-04-29T18:40:00.000Z",
      },
    ],
  },
  {
    title: "What documents are needed for DU admission 2025?",
    body:
      "I am planning to apply to Delhi University for undergraduate admission and I do not want last-minute problems during verification. Can someone share a complete checklist of documents and which ones usually need self-attestation?",
    category: "university",
    tags: ["DU", "Delhi University", "Admission"],
    authorIndex: 3,
    views: 94,
    createdAt: "2026-04-28T05:30:00.000Z",
    updatedAt: "2026-04-29T15:20:00.000Z",
    answers: [
      {
        body:
          "Keep Class 10 and 12 marksheets, passing certificates, CUET scorecard, category certificate if applicable, domicile if asked for any quota, Aadhaar, passport-size photos, and scanned signatures ready. Also maintain both PDF scans and physical photocopies because portal uploads and college verification often require both.",
        authorIndex: 0,
        upvotes: 15,
        createdAt: "2026-04-28T08:00:00.000Z",
        updatedAt: "2026-04-28T08:00:00.000Z",
      },
      {
        body:
          "Self-attest every photocopy before carrying it for offline verification. Students often forget migration certificate or transfer certificate, so check the exact college instructions after seat allotment because those steps can vary a bit.",
        authorIndex: 1,
        upvotes: 9,
        createdAt: "2026-04-29T15:20:00.000Z",
        updatedAt: "2026-04-29T15:20:00.000Z",
      },
    ],
  },
  {
    title: "CLAT 2025 preparation strategy for a working professional?",
    body:
      "I work full time and can spare around 2.5 to 3 hours on weekdays, plus more on weekends. I am targeting CLAT PG/LLB-style law entrance preparation and need a structured plan that balances mocks, reading comprehension, and legal reasoning.",
    category: "law",
    tags: ["CLAT", "Preparation", "Strategy"],
    authorIndex: 4,
    views: 121,
    createdAt: "2026-04-25T13:20:00.000Z",
    updatedAt: "2026-04-30T06:30:00.000Z",
    answers: [
      {
        body:
          "Treat weekdays as maintenance and weekends as growth. On weekdays, do one focused reading set plus one sectional drill and current affairs review. Use weekends for a full mock, analysis, and revision of legal plus logical errors. Consistency matters more than perfect hours.",
        authorIndex: 2,
        upvotes: 14,
        createdAt: "2026-04-25T16:10:00.000Z",
        updatedAt: "2026-04-25T16:10:00.000Z",
      },
      {
        body:
          "Do not chase too many resources. One reading source, one CA compilation, one mock series, and one error notebook are enough if you genuinely review them. Working professionals lose time mostly through scattered preparation.",
        authorIndex: 0,
        upvotes: 13,
        createdAt: "2026-04-26T09:45:00.000Z",
        updatedAt: "2026-04-26T09:45:00.000Z",
      },
      {
        body:
          "If your weekday energy drops after work, shift heavy reasoning to mornings or weekends and keep evenings for reading-heavy sections. A sustainable schedule beats a heroic schedule that collapses in two weeks.",
        authorIndex: 1,
        upvotes: 6,
        createdAt: "2026-04-30T06:30:00.000Z",
        updatedAt: "2026-04-30T06:30:00.000Z",
      },
    ],
  },
  {
    title: "Should I choose IIIT Hyderabad ECE or NIT Trichy CSE?",
    body:
      "I am confused between branch and brand. I like coding and may want software roles, but IIIT Hyderabad's peer group and research exposure look very strong even for ECE. How should I compare these two options?",
    category: "engineering",
    tags: ["IIIT Hyderabad", "NIT Trichy", "ECE", "CSE"],
    authorIndex: 1,
    views: 176,
    createdAt: "2026-04-24T09:10:00.000Z",
    updatedAt: "2026-04-30T12:00:00.000Z",
    answers: [
      {
        body:
          "If you are very sure about software and want the least academic friction, NIT Trichy CSE is the simpler path. If you are excited by deep tech, research culture, and can handle a rigorous environment, IIIT Hyderabad ECE can still open excellent software outcomes.",
        authorIndex: 3,
        upvotes: 19,
        createdAt: "2026-04-24T12:00:00.000Z",
        updatedAt: "2026-04-24T12:00:00.000Z",
      },
      {
        body:
          "Check curriculum carefully. IIITH ECE is not a light branch, so only choose it if you are comfortable with electronics coursework while building coding depth alongside it.",
        authorIndex: 4,
        upvotes: 12,
        createdAt: "2026-04-25T10:30:00.000Z",
        updatedAt: "2026-04-25T10:30:00.000Z",
      },
      {
        body:
          "Peer group intensity at IIITH is real, but that also means expectations are high. If you prefer a broader campus life and more classic college balance, NIT Trichy may feel healthier for four years.",
        authorIndex: 0,
        upvotes: 9,
        createdAt: "2026-04-30T12:00:00.000Z",
        updatedAt: "2026-04-30T12:00:00.000Z",
      },
    ],
  },
  {
    title: "Best CAT mock strategy in the last 60 days before exam?",
    body:
      "I have finished most of the syllabus and now I want a solid final-phase CAT strategy. My current mocks range between 85 and 92 percentile. Should I focus on more mocks, more sectionals, or only revision and analysis?",
    category: "management",
    tags: ["CAT", "Mocks", "MBA", "Preparation"],
    authorIndex: 0,
    views: 158,
    createdAt: "2026-04-23T11:45:00.000Z",
    updatedAt: "2026-04-29T19:25:00.000Z",
    answers: [
      {
        body:
          "In the last 60 days, analysis quality matters more than raw mock count. One or two full mocks per week with deep post-mock review plus targeted sectionals for your weakest area usually gives better gains than blindly taking four mocks.",
        authorIndex: 2,
        upvotes: 21,
        createdAt: "2026-04-23T13:00:00.000Z",
        updatedAt: "2026-04-23T13:00:00.000Z",
      },
      {
        body:
          "Create a pattern log: time lost, wrong attempts, panic decisions, and skipped easy questions. CAT improvements often come from process control rather than learning brand-new content at the end.",
        authorIndex: 1,
        upvotes: 14,
        createdAt: "2026-04-24T09:50:00.000Z",
        updatedAt: "2026-04-24T09:50:00.000Z",
      },
      {
        body:
          "Keep one weekly slot only for LRDI set selection practice. Students around 90 percentile often know enough but still lose momentum by choosing poor sets too early.",
        authorIndex: 4,
        upvotes: 8,
        createdAt: "2026-04-29T19:25:00.000Z",
        updatedAt: "2026-04-29T19:25:00.000Z",
      },
    ],
  },
  {
    title: "Can I get AIIMS Delhi with 690+ in NEET if paper difficulty increases?",
    body:
      "I know AIIMS Delhi is one of the toughest seats, but I want to understand how much variation paper difficulty can create. If the exam is tougher overall, could 690+ still remain competitive for general category?",
    category: "medicine",
    tags: ["NEET", "AIIMS", "Cutoff", "MBBS"],
    authorIndex: 4,
    views: 167,
    createdAt: "2026-04-22T07:40:00.000Z",
    updatedAt: "2026-04-28T18:15:00.000Z",
    answers: [
      {
        body:
          "AIIMS Delhi usually stays in an ultra-high range, so 690 plus is certainly competitive but never guaranteed. When difficulty rises, the score may shift slightly, but rank is what really decides the seat. Track expected rank conversion rather than score alone.",
        authorIndex: 1,
        upvotes: 17,
        createdAt: "2026-04-22T09:00:00.000Z",
        updatedAt: "2026-04-22T09:00:00.000Z",
      },
      {
        body:
          "Aim beyond the cutoff mindset. For such colleges, every avoidable negative mark matters. If you are already scoring that high, your revision should revolve around retention and accuracy, not experimental study plans.",
        authorIndex: 3,
        upvotes: 10,
        createdAt: "2026-04-28T18:15:00.000Z",
        updatedAt: "2026-04-28T18:15:00.000Z",
      },
    ],
  },
  {
    title: "How should I compare hostel and campus life before finalising a college?",
    body:
      "I am choosing between a few similar private universities and placement numbers are close. I will live on campus, so hostel rules, student clubs, mentorship culture, and day-to-day life matter a lot. What should I actually evaluate?",
    category: "university",
    tags: ["Hostel", "Campus Life", "Admission"],
    authorIndex: 2,
    views: 88,
    createdAt: "2026-04-24T17:15:00.000Z",
    updatedAt: "2026-04-26T14:45:00.000Z",
    answers: [
      {
        body:
          "Look beyond brochures. Ask current students about internet quality, hostel in-time rules, medical support, club freedom, and whether internships are supported during semester. These practical factors shape your daily experience more than generic campus photos.",
        authorIndex: 0,
        upvotes: 12,
        createdAt: "2026-04-24T19:00:00.000Z",
        updatedAt: "2026-04-24T19:00:00.000Z",
      },
      {
        body:
          "Also evaluate commute between hostel and academic blocks, food consistency, and whether seniors are accessible. A campus with slightly lower hype but stronger support systems often feels much better over three or four years.",
        authorIndex: 4,
        upvotes: 7,
        createdAt: "2026-04-26T14:45:00.000Z",
        updatedAt: "2026-04-26T14:45:00.000Z",
      },
    ],
  },
  {
    title: "Portfolio tips for NID and UID design admissions in 2025?",
    body:
      "I want to apply for design programs and I am confused about how polished the portfolio needs to be. Should it be heavily digital, or do hand sketches, observations, and process work matter more?",
    category: "design",
    tags: ["Design", "Portfolio", "NID", "UID"],
    authorIndex: 3,
    views: 103,
    createdAt: "2026-04-21T10:05:00.000Z",
    updatedAt: "2026-04-27T09:20:00.000Z",
    answers: [
      {
        body:
          "Most good design portfolios are not about polish first. They are about thinking. Show how you observe, iterate, and solve problems. Include rough process work, moodboards, user thinking, and why each project matters instead of only final pretty visuals.",
        authorIndex: 2,
        upvotes: 16,
        createdAt: "2026-04-21T12:10:00.000Z",
        updatedAt: "2026-04-21T12:10:00.000Z",
      },
      {
        body:
          "A balanced portfolio helps. Add sketches, real-world observation, one or two structured projects, and at least one piece that shows originality. Admissions panels usually spot copied online aesthetics very quickly.",
        authorIndex: 1,
        upvotes: 11,
        createdAt: "2026-04-23T08:25:00.000Z",
        updatedAt: "2026-04-23T08:25:00.000Z",
      },
      {
        body:
          "Do not overfill it. Six thoughtful projects are better than fifteen weak ones. Keep captions concise and explain your decisions in plain language.",
        authorIndex: 4,
        upvotes: 5,
        createdAt: "2026-04-27T09:20:00.000Z",
        updatedAt: "2026-04-27T09:20:00.000Z",
      },
    ],
  },
  {
    title: "Is taking a drop year for JEE worth it if I already have VIT and SRM options?",
    body:
      "I may get decent private engineering colleges this year, but not the NIT or IIT result I originally wanted. I am unsure whether a full drop is worth the pressure when I already have workable college options.",
    category: "engineering",
    tags: ["JEE", "Drop Year", "Engineering"],
    authorIndex: 1,
    views: 132,
    createdAt: "2026-04-20T14:00:00.000Z",
    updatedAt: "2026-04-28T12:30:00.000Z",
    answers: [
      {
        body:
          "A drop year makes sense only if you can clearly identify what limited you this time and you still have motivation for another long cycle. If you already have strong private options and are unsure about repeating the grind, joining college and building skills early may be the better path.",
        authorIndex: 0,
        upvotes: 18,
        createdAt: "2026-04-20T15:30:00.000Z",
        updatedAt: "2026-04-20T15:30:00.000Z",
      },
      {
        body:
          "Think in terms of upside versus certainty. A drop can improve outcomes a lot for some students, but it can also create emotional fatigue. Be brutally honest about discipline, support system, and whether you are still excited by the exam itself.",
        authorIndex: 4,
        upvotes: 10,
        createdAt: "2026-04-24T06:40:00.000Z",
        updatedAt: "2026-04-24T06:40:00.000Z",
      },
      {
        body:
          "If you choose college now, you are not closing growth. Strong coding, internships, and project work can still produce excellent outcomes from VIT, SRM, Manipal, and similar campuses.",
        authorIndex: 3,
        upvotes: 9,
        createdAt: "2026-04-28T12:30:00.000Z",
        updatedAt: "2026-04-28T12:30:00.000Z",
      },
    ],
  },
  {
    title: "How many colleges should I put in my JoSAA choice filling list realistically?",
    body:
      "I do not want to make the list too short and regret it, but I also do not want to create a random list without strategy. What is a practical number of JoSAA choices for someone targeting NITs and IIITs?",
    category: "engineering",
    tags: ["JoSAA", "Counselling", "Engineering"],
    authorIndex: 0,
    views: 76,
    createdAt: "2026-04-28T09:25:00.000Z",
    updatedAt: "2026-04-30T08:10:00.000Z",
    answers: [
      {
        body:
          "Most students benefit from a layered list rather than a fixed magic number. Include dream options, realistic options, and safe options. For NIT plus IIIT targeting, many serious applicants end up with 40 or more combinations once branches are included, but every choice should still be something you are willing to join.",
        authorIndex: 2,
        upvotes: 9,
        createdAt: "2026-04-28T11:10:00.000Z",
        updatedAt: "2026-04-28T11:10:00.000Z",
      },
      {
        body:
          "Never fill a branch-college pair just because someone says you need a big list. If you know you would regret joining that combination, leave it out and spend time ranking your acceptable options more thoughtfully.",
        authorIndex: 1,
        upvotes: 6,
        createdAt: "2026-04-30T08:10:00.000Z",
        updatedAt: "2026-04-30T08:10:00.000Z",
      },
    ],
  },
  {
    title: "Should I prioritise scholarship offers when comparing private universities?",
    body:
      "A couple of universities have offered decent scholarships, but another college has slightly better placements and location. How much weight should scholarships really get in the final decision?",
    category: "university",
    tags: ["Scholarship", "Fees", "Admission"],
    authorIndex: 4,
    views: 67,
    createdAt: "2026-04-27T12:00:00.000Z",
    updatedAt: "2026-04-27T18:40:00.000Z",
    answers: [
      {
        body:
          "Scholarships matter a lot if they significantly change family financial pressure. Compare the final four-year cost, hostel, travel, and hidden academic expenses, then weigh that against placement quality and the specific course ecosystem. A slightly stronger brand is not always worth a huge cost jump.",
        authorIndex: 0,
        upvotes: 10,
        createdAt: "2026-04-27T14:00:00.000Z",
        updatedAt: "2026-04-27T14:00:00.000Z",
      },
      {
        body:
          "Read the scholarship continuation rules carefully. Some offers depend on maintaining a high CGPA or specific attendance thresholds, and students often ignore that until it is too late.",
        authorIndex: 3,
        upvotes: 7,
        createdAt: "2026-04-27T18:40:00.000Z",
        updatedAt: "2026-04-27T18:40:00.000Z",
      },
    ],
  },
  {
    title: "What is the best way to prepare SOP and LORs for university applications abroad?",
    body:
      "I am in my final undergraduate year and planning to apply for master's programs abroad. I know this is broader than Indian admissions, but I would appreciate advice on timelines for SOP drafting, selecting recommenders, and avoiding generic applications.",
    category: "university",
    tags: ["SOP", "LOR", "Applications"],
    authorIndex: 2,
    views: 84,
    createdAt: "2026-04-19T07:30:00.000Z",
    updatedAt: "2026-04-26T10:10:00.000Z",
    answers: [
      {
        body:
          "Start by listing your strongest academic and project stories, then map them to each target program's themes. Good SOPs are specific and evidence-based. For LORs, choose recommenders who can discuss your work in detail rather than famous names who know you only superficially.",
        authorIndex: 1,
        upvotes: 12,
        createdAt: "2026-04-19T09:00:00.000Z",
        updatedAt: "2026-04-19T09:00:00.000Z",
      },
      {
        body:
          "Give your recommenders a clean brief: resume, project summary, target universities, and submission deadlines. That single step improves letter quality more than most students realise.",
        authorIndex: 4,
        upvotes: 8,
        createdAt: "2026-04-26T10:10:00.000Z",
        updatedAt: "2026-04-26T10:10:00.000Z",
      },
    ],
  },
  {
    title: "How do I decide between BA LLB and BBA LLB for corporate law goals?",
    body:
      "I want to work in corporate law or business advisory later. I understand both BA LLB and BBA LLB are accepted, but I would like to know whether one gives a noticeable edge in internships or long-term career direction.",
    category: "law",
    tags: ["BA LLB", "BBA LLB", "Corporate Law"],
    authorIndex: 3,
    views: 111,
    createdAt: "2026-04-18T16:20:00.000Z",
    updatedAt: "2026-04-25T11:30:00.000Z",
    answers: [
      {
        body:
          "In practice, the college brand, your internships, research work, and communication skills matter more than BA LLB versus BBA LLB. BBA LLB gives more structured exposure to management subjects, but BA LLB is not a disadvantage for corporate placements at strong law schools.",
        authorIndex: 0,
        upvotes: 14,
        createdAt: "2026-04-18T18:00:00.000Z",
        updatedAt: "2026-04-18T18:00:00.000Z",
      },
      {
        body:
          "If you genuinely enjoy economics, policy, history, or political science, BA LLB may keep you more engaged academically. The better choice is often the one whose non-law subjects you can sustain for five years.",
        authorIndex: 2,
        upvotes: 7,
        createdAt: "2026-04-25T11:30:00.000Z",
        updatedAt: "2026-04-25T11:30:00.000Z",
      },
    ],
  },
  {
    title: "Is it worth asking current students before paying counselling acceptance fee?",
    body:
      "I have a seat in hand through counselling and the acceptance deadline is close. I can still reach out to a few current students on LinkedIn. Is that actually useful at this stage, and what should I ask them?",
    category: "university",
    tags: ["Counselling", "Admission", "Student Reviews"],
    authorIndex: 1,
    views: 59,
    createdAt: "2026-04-30T05:50:00.000Z",
    updatedAt: "2026-04-30T05:50:00.000Z",
    answers: [],
  },
];

async function main() {
  await prisma.answerUpvote.deleteMany();
  await prisma.questionUpvote.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.savedCollege.deleteMany();
  await prisma.review.deleteMany();
  await prisma.course.deleteMany();
  await prisma.college.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password@123", 10);

  const users = await Promise.all(
    reviewUsers.map((user) =>
      prisma.user.create({
        data: {
          ...user,
          passwordHash,
        },
      }),
    ),
  );

  for (const [index, college] of colleges.entries()) {
    const createdCollege = await prisma.college.create({
      data: {
        slug: college.slug,
        name: college.name,
        city: college.city,
        state: college.state,
        feesPerYear: college.feesPerYear,
        rating: college.rating,
        naacGrade: college.naacGrade,
        establishedYear: college.establishedYear,
        website: college.website,
        placementPct: college.placementPct,
        avgPackage: college.avgPackage,
        highestPackage: college.highestPackage,
        topRecruiters: college.topRecruiters,
        courses: {
          create: college.courses,
        },
      },
    });

    await prisma.review.createMany({
      data: users.map((user, reviewIndex) => ({
        collegeId: createdCollege.id,
        userId: user.id,
        rating: reviewRatings[reviewIndex] ?? 4,
        body: reviewBodies[(index + reviewIndex) % reviewBodies.length] ?? reviewBodies[0],
      })),
    });
  }

  for (const discussion of discussions) {
    const createdQuestion = await prisma.question.create({
      data: {
        title: discussion.title,
        body: discussion.body ?? null,
        category: discussion.category,
        tags: discussion.tags,
        authorId: users[discussion.authorIndex]!.id,
        isPinned: discussion.isPinned ?? false,
        isSolved: discussion.isSolved ?? false,
        views: discussion.views,
        createdAt: new Date(discussion.createdAt),
        updatedAt: new Date(discussion.updatedAt),
      },
    });

    for (const answer of discussion.answers) {
      await prisma.answer.create({
        data: {
          body: answer.body,
          questionId: createdQuestion.id,
          authorId: users[answer.authorIndex]!.id,
          upvotes: answer.upvotes,
          isAccepted: answer.isAccepted ?? false,
          createdAt: new Date(answer.createdAt),
          updatedAt: new Date(answer.updatedAt),
        },
      });
    }

    await prisma.question.update({
      where: { id: createdQuestion.id },
      data: {
        upvotes: discussion.answers.reduce((sum, answer) => sum + Math.max(1, Math.floor(answer.upvotes / 3)), 0),
      },
    });
  }

  console.log(
    `Seeded ${colleges.length} colleges, ${colleges.length * reviewUsers.length} reviews, and ${discussions.length} help questions.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
