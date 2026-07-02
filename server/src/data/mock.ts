import type {
  Track,
  User,
  Resource,
  ProgressRecord,
  DayActivity,
  StoredModuleState,
} from "./types.js";

/**
 * Mock content for Engineering & Reservoir (PRD §7.2 — 14 tracks).
 * ⚠️ Content is placeholder for the demo; real workflows compiled in "Build" phase.
 * Two overlap pairs are preserved (not merged) per PRD §7.2.
 */

// Small helper to keep module authoring terse.
let mSeq = 0;
function mod(
  trackId: string,
  title: string,
  titleAr: string,
  duration: number,
  type: "video" | "reading" | "interactive",
  order: number,
  prerequisite?: string,
) {
  mSeq += 1;
  const id = `${trackId}-m${order}`;
  return { id, trackId, title, titleAr, duration, type, order, prerequisite };
}

/** Build a linear track: each module requires the previous one (FR-L5 sequencing). */
function linear(
  id: string,
  title: string,
  titleAr: string,
  icon: string,
  order: number,
  status: Track["status"],
  mods: Array<[string, string, number, "video" | "reading" | "interactive"]>,
  overlapsWith?: string,
): Track {
  const modules = mods.map(([t, tAr, dur, type], i) =>
    mod(id, t, tAr, dur, type, i + 1, i === 0 ? undefined : `${id}-m${i}`),
  );
  return {
    id,
    title,
    titleAr,
    department: "Engineering & Reservoir",
    icon,
    order,
    status,
    overlapsWith,
    modules,
  };
}

export const tracks: Track[] = [
  linear("t1", "Reservoir Simulation Fundamentals", "أساسيات محاكاة المكامن", "reservoir", 1, "current", [
    ["Introduction to Reservoir Engineering", "مقدمة في هندسة المكامن", 45, "video"],
    ["Fluid Properties & PVT Analysis", "خصائص الموائع وتحليل PVT", 60, "reading"],
    ["Reservoir Pressure Concepts", "مفاهيم ضغط المكمن", 50, "video"],
    ["Material Balance Equations", "معادلات التوازن المادي", 75, "interactive"],
    ["Decline Curve Analysis", "تحليل منحنى التناقص", 55, "video"],
  ], "t9"),

  linear("t2", "Intersect (IX) Simulation Tool", "أداة المحاكاة إنترسكت", "gear", 2, "current", [
    ["IX Interface & Navigation", "واجهة IX والتنقل", 30, "video"],
    ["Building Your First Model", "بناء أول نموذج", 90, "interactive"],
    ["Grid Design & Upscaling", "تصميم الشبكة والتوسيع", 70, "reading"],
    ["Well Control & Constraints", "التحكم بالآبار والقيود", 60, "video"],
    ["Running & Debugging Simulations", "تشغيل المحاكاة وتصحيحها", 80, "interactive"],
  ]),

  linear("t3", "Well Test Analysis", "تحليل اختبار الآبار", "chart-bar", 3, "current", [
    ["Well Test Fundamentals", "أساسيات اختبار الآبار", 55, "video"],
    ["Buildup & Drawdown Tests", "اختبارات البناء والسحب", 70, "reading"],
    ["Interpretation Methods", "طرق التفسير", 80, "interactive"],
    ["Data Quality & Validation", "جودة البيانات والتحقق", 45, "video"],
  ], "t7"),

  linear("t4", "Field Operations & Safety", "العمليات الميدانية والسلامة", "shield", 4, "current", [
    ["Site Safety Protocols", "بروتوكولات سلامة الموقع", 40, "video"],
    ["Emergency Response Procedures", "إجراءات الاستجابة للطوارئ", 50, "reading"],
    ["Permit to Work System", "نظام تصاريح العمل", 35, "interactive"],
    ["Field Reporting Standards", "معايير التقارير الميدانية", 30, "video"],
  ]),

  linear("t5", "SBHP Validation", "التحقق من ضغط القاع الساكن", "gauge", 5, "current", [
    ["SBHP Survey Overview", "نظرة عامة على مسح SBHP", 40, "reading"],
    ["Gradient Analysis", "تحليل التدرج", 60, "interactive"],
    ["Correcting to Datum", "التصحيح إلى المرجع", 50, "video"],
    ["Validation & Sign-off Workflow", "سير عمل التحقق والاعتماد", 55, "interactive"],
  ]),

  linear("t6", "PGOR Validation", "التحقق من نسبة الغاز إلى النفط", "flask", 6, "review-due", [
    ["Producing GOR Concepts", "مفاهيم نسبة الغاز المنتَج", 40, "reading"],
    ["Allocation & Metering", "التخصيص والقياس", 65, "video"],
    ["Anomaly Detection", "كشف الشذوذ", 55, "interactive"],
    ["Validation Checklist", "قائمة التحقق", 35, "reading"],
  ]),

  linear("t7", "PTA Analysis", "تحليل انتقال الضغط", "magnifier", 7, "current", [
    ["Pressure Transient Theory", "نظرية انتقال الضغط", 55, "video"],
    ["Flow Regimes & Derivatives", "أنظمة التدفق والمشتقات", 75, "interactive"],
    ["Model Recognition", "التعرف على النموذج", 70, "reading"],
    ["Case Studies", "دراسات حالة", 60, "video"],
  ], "t3"),

  linear("t8", "PIPESIM Model", "نموذج بايبسِم", "pipe", 8, "current", [
    ["PIPESIM Environment", "بيئة PIPESIM", 35, "video"],
    ["Multiphase Flow Correlations", "ارتباطات التدفق متعدد الأطوار", 70, "reading"],
    ["Nodal Analysis", "التحليل العقدي", 80, "interactive"],
    ["Network Modeling", "نمذجة الشبكات", 75, "video"],
  ]),

  linear("t9", "Simulation Fundamentals", "أساسيات المحاكاة", "grid", 9, "current", [
    ["Numerical Methods Basics", "أساسيات الطرق العددية", 50, "reading"],
    ["Discretization & Grids", "التقطيع والشبكات", 65, "interactive"],
    ["Solvers & Convergence", "الحلّالات والتقارب", 70, "video"],
  ], "t1"),

  linear("t10", "STPF Fundamentals", "أساسيات STPF", "ruler", 10, "current", [
    ["STPF Overview", "نظرة عامة على STPF", 40, "reading"],
    ["Data Preparation", "إعداد البيانات", 60, "interactive"],
    ["Workflow Execution", "تنفيذ سير العمل", 65, "video"],
  ]),

  linear("t11", "Stimulation Program", "برنامج التحفيز", "spark", 11, "current", [
    ["Stimulation Candidates", "اختيار الآبار المرشحة", 45, "reading"],
    ["Acidizing Design", "تصميم الحمضنة", 70, "interactive"],
    ["Hydraulic Fracturing Basics", "أساسيات التكسير الهيدروليكي", 80, "video"],
    ["Post-Job Evaluation", "التقييم بعد العملية", 50, "reading"],
  ]),

  linear("t12", "Completion Program", "برنامج الإكمال", "wrench", 12, "current", [
    ["Completion Types", "أنواع الإكمال", 45, "reading"],
    ["Sand Control", "التحكم بالرمال", 65, "video"],
    ["Perforation Strategy", "استراتيجية التثقيب", 60, "interactive"],
    ["Completion Reporting", "تقارير الإكمال", 35, "reading"],
  ]),

  linear("t13", "SPTR Workframe", "إطار عمل SPTR", "layers", 13, "undocumented", [
    ["SPTR Introduction", "مقدمة SPTR", 40, "reading"],
    ["Workframe Setup", "إعداد إطار العمل", 60, "interactive"],
    ["Reporting Templates", "قوالب التقارير", 45, "video"],
  ]),

  linear("t14", "Pore Pressure Prediction", "التنبؤ بضغط المسام", "globe", 14, "review-due", [
    ["Pore Pressure Concepts", "مفاهيم ضغط المسام", 50, "reading"],
    ["Seismic & Log Methods", "الطرق الزلزالية والتسجيلية", 75, "interactive"],
    ["Predrill Prediction", "التنبؤ قبل الحفر", 70, "video"],
    ["Real-time Monitoring", "المراقبة الفورية", 55, "interactive"],
  ]),
];

export const users: User[] = [
  {
    id: "u1",
    name: "Shahad Aljasmi",
    nameAr: "شهد الجسمي",
    initials: "SA",
    role: "learner",
    jobTitle: "Reservoir Engineer",
    department: "Engineering & Reservoir",
    joined: "2024-01-15",
    streak: 12,
    points: 2340,
    rank: "Advanced Learner",
    lastActive: "2026-07-02",
    assignedTrackIds: ["t1", "t2", "t3", "t4", "t5", "t7", "t14"],
  },
  {
    id: "u2",
    name: "Faisal Al-Otaibi",
    nameAr: "فيصل العتيبي",
    initials: "FO",
    role: "learner",
    jobTitle: "Petroleum Engineer",
    department: "Engineering & Reservoir",
    joined: "2025-09-01",
    streak: 4,
    points: 860,
    rank: "New Hire",
    lastActive: "2026-07-01",
    assignedTrackIds: ["t1", "t2", "t4", "t8", "t9"],
  },
  {
    id: "u3",
    name: "Noura Al-Sabah",
    nameAr: "نورة الصباح",
    initials: "NS",
    role: "learner",
    jobTitle: "Senior Reservoir Engineer",
    department: "Engineering & Reservoir",
    joined: "2019-03-10",
    streak: 21,
    points: 5120,
    rank: "Expert",
    lastActive: "2026-07-02",
    assignedTrackIds: ["t1", "t2", "t3", "t5", "t6", "t7", "t11", "t12"],
  },
  {
    id: "u4",
    name: "Yousef Al-Ajmi",
    nameAr: "يوسف العجمي",
    initials: "YA",
    role: "learner",
    jobTitle: "Reservoir Engineer",
    department: "Engineering & Reservoir",
    joined: "2023-06-20",
    streak: 0,
    points: 1490,
    rank: "Intermediate Learner",
    lastActive: "2026-06-18",
    assignedTrackIds: ["t1", "t3", "t4", "t8", "t14"],
  },
  {
    id: "u5",
    name: "Dana Al-Mutairi",
    nameAr: "دانة المطيري",
    initials: "DM",
    role: "learner",
    jobTitle: "Production Engineer",
    department: "Engineering & Reservoir",
    joined: "2025-02-01",
    streak: 7,
    points: 1120,
    rank: "New Hire",
    lastActive: "2026-06-30",
    assignedTrackIds: ["t4", "t8", "t10", "t11", "t12"],
  },
  {
    id: "u6",
    name: "Abdullah Al-Hajri",
    nameAr: "عبدالله الهاجري",
    initials: "AH",
    role: "learner",
    jobTitle: "Reservoir Engineer",
    department: "Engineering & Reservoir",
    joined: "2022-11-05",
    streak: 3,
    points: 2010,
    rank: "Advanced Learner",
    lastActive: "2026-06-28",
    assignedTrackIds: ["t1", "t2", "t5", "t6", "t7", "t14"],
  },
  {
    id: "u7",
    name: "Maryam Al-Kandari",
    nameAr: "مريم الكندري",
    initials: "MK",
    role: "learner",
    jobTitle: "Petroleum Engineer",
    department: "Engineering & Reservoir",
    joined: "2024-08-12",
    streak: 9,
    points: 1760,
    rank: "Intermediate Learner",
    lastActive: "2026-07-01",
    assignedTrackIds: ["t1", "t3", "t4", "t9", "t10", "t13"],
  },
  {
    id: "u8",
    name: "Khaled Al-Fadhli",
    nameAr: "خالد الفضلي",
    initials: "KF",
    role: "learner",
    jobTitle: "Junior Reservoir Engineer",
    department: "Engineering & Reservoir",
    joined: "2026-01-20",
    streak: 2,
    points: 380,
    rank: "New Hire",
    lastActive: "2026-06-25",
    assignedTrackIds: ["t1", "t2", "t4"],
  },
  {
    id: "m1",
    name: "Mohammad Albahar",
    nameAr: "محمد البحّار",
    initials: "MA",
    role: "manager",
    jobTitle: "Manager — Reservoir",
    department: "Engineering & Reservoir",
    joined: "2015-04-01",
    streak: 0,
    points: 0,
    rank: "Manager",
    lastActive: "2026-07-02",
    assignedTrackIds: [],
  },
];

export const weeklyActivity: DayActivity[] = [
  { dayIndex: 0, minutes: 0 },
  { dayIndex: 1, minutes: 45 },
  { dayIndex: 2, minutes: 90 },
  { dayIndex: 3, minutes: 30 },
  { dayIndex: 4, minutes: 75 },
  { dayIndex: 5, minutes: 0 },
  { dayIndex: 6, minutes: 60 },
];

export const resources: Resource[] = [
  {
    id: "r1",
    title: "Reservoir Simulation Handbook",
    titleAr: "دليل محاكاة المكامن",
    type: "pdf",
    level: "reference",
    tags: ["simulation", "reference"],
    description: "Comprehensive reference for simulation techniques used in operations.",
    descriptionAr: "مرجع شامل لتقنيات المحاكاة المستخدمة في العمليات.",
    url: "#",
    relatedTrackId: "t1",
  },
  {
    id: "r2",
    title: "IX Quick Start Guide",
    titleAr: "دليل البدء السريع لـ IX",
    type: "video-series",
    level: "beginner",
    tags: ["intersect", "getting-started"],
    description: "3-part video series to get you up and running in Intersect.",
    descriptionAr: "سلسلة من ٣ مقاطع لتبدأ العمل في إنترسكت.",
    url: "#",
    relatedTrackId: "t2",
  },
  {
    id: "r3",
    title: "SBHP Survey Workflow",
    titleAr: "سير عمل مسح SBHP",
    type: "interactive",
    level: "intermediate",
    tags: ["sbhp", "workflow"],
    description: "Step-by-step guided walkthrough of the SBHP proposal system.",
    descriptionAr: "شرح إرشادي خطوة بخطوة لنظام مقترحات SBHP.",
    url: "#",
    relatedTrackId: "t5",
  },
  {
    id: "r4",
    title: "Material Balance Deep Dive",
    titleAr: "تعمق في التوازن المادي",
    type: "recorded-lecture",
    level: "intermediate",
    tags: ["material-balance", "lecture"],
    description: "2-hour lecture on material balance from the engineering team.",
    descriptionAr: "محاضرة ساعتين حول التوازن المادي من فريق الهندسة.",
    url: "#",
    relatedTrackId: "t1",
  },
  {
    id: "r5",
    title: "History Matching Best Practices",
    titleAr: "أفضل ممارسات المطابقة التاريخية",
    type: "pdf",
    level: "advanced",
    tags: ["history-matching", "guidelines"],
    description: "Internal guidelines for history matching workflows.",
    descriptionAr: "إرشادات داخلية لسير عمل المطابقة التاريخية.",
    url: "#",
    relatedTrackId: "t2",
  },
  {
    id: "r6",
    title: "Production Forecasting Methods",
    titleAr: "طرق التنبؤ بالإنتاج",
    type: "interactive",
    level: "advanced",
    tags: ["forecasting", "decline-curve"],
    description: "Hands-on exercises for decline curve and simulation-based forecasting.",
    descriptionAr: "تمارين عملية للتنبؤ بمنحنى التناقص والمحاكاة.",
    url: "#",
    relatedTrackId: "t1",
  },
  {
    id: "r7",
    title: "PTA Interpretation Atlas",
    titleAr: "أطلس تفسير PTA",
    type: "pdf",
    level: "advanced",
    tags: ["pta", "well-test", "derivatives"],
    description: "Diagnostic plots and model signatures for pressure transient analysis.",
    descriptionAr: "المخططات التشخيصية وبصمات النماذج لتحليل انتقال الضغط.",
    url: "#",
    relatedTrackId: "t7",
  },
  {
    id: "r8",
    title: "Field Safety Induction",
    titleAr: "تعريف السلامة الميدانية",
    type: "video-series",
    level: "beginner",
    tags: ["safety", "field-operations"],
    description: "Mandatory safety induction for new field engineers.",
    descriptionAr: "تعريف السلامة الإلزامي للمهندسين الميدانيين الجدد.",
    url: "#",
    relatedTrackId: "t4",
  },
];

/**
 * Seeded progress. Encoded compactly as [userId, trackId, completedCount, inProgress?]
 * — the first N modules of a track are completed, and optionally the next is in-progress.
 */
const progressSeed: Array<[string, string, number, boolean?]> = [
  // Shahad (u1) — the demo learner, mirrors MVP-ish state
  ["u1", "t1", 3, true],
  ["u1", "t2", 2, true],
  ["u1", "t3", 1, false],
  ["u1", "t4", 4, false],
  ["u1", "t5", 1, true],
  ["u1", "t7", 0, true],
  // Faisal (u2) — new hire, early
  ["u2", "t1", 2, true],
  ["u2", "t4", 4, false],
  ["u2", "t2", 1, false],
  // Noura (u3) — expert, mostly done
  ["u3", "t1", 5, false],
  ["u3", "t2", 5, false],
  ["u3", "t3", 4, false],
  ["u3", "t5", 4, false],
  ["u3", "t7", 3, true],
  ["u3", "t11", 2, true],
  ["u3", "t12", 4, false],
  // Yousef (u4) — at-risk, stale
  ["u4", "t1", 1, false],
  ["u4", "t3", 1, true],
  // Dana (u5)
  ["u5", "t4", 4, false],
  ["u5", "t8", 2, true],
  ["u5", "t10", 1, false],
  // Abdullah (u6)
  ["u6", "t1", 4, false],
  ["u6", "t5", 2, true],
  ["u6", "t7", 2, false],
  // Maryam (u7)
  ["u7", "t1", 3, false],
  ["u7", "t4", 4, false],
  ["u7", "t9", 1, true],
  ["u7", "t10", 3, false],
  // Khaled (u8) — brand new
  ["u8", "t1", 1, true],
];

export function seedProgress(): ProgressRecord[] {
  const records: ProgressRecord[] = [];
  const stamp = "2026-06-30T09:00:00.000Z";
  for (const [userId, trackId, done, inProgress] of progressSeed) {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) continue;
    const ordered = [...track.modules].sort((a, b) => a.order - b.order);
    ordered.forEach((m, i) => {
      let state: StoredModuleState | null = null;
      if (i < done) state = "completed";
      else if (i === done && inProgress) state = "in-progress";
      if (state) {
        records.push({ userId, moduleId: m.id, state, updatedAt: stamp });
      }
    });
  }
  return records;
}
