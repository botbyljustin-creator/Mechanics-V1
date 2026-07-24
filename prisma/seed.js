const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

/* ---------------------------------------------------------------
   Source data — carried over 1:1 from the mechanics-os.jsx prototype
   and the Mechanics reference doc. This is seed data only; once the
   app is running, KPIs/SOPs are edited and stored in the database.
--------------------------------------------------------------- */
const DEPARTMENTS = [
  {
    key: "bd",
    name: "Business Development",
    short: "BizDev",
    icon: "Briefcase",
    purpose: "Generate and secure new opportunities.",
    includes: ["Lead generation", "Client relationships", "Estimating", "Proposals", "Bid tracking", "Pipeline management"],
    outputs: ["Awarded projects", "Contracts", "Revenue pipeline"],
    kpis: [
      { key: "close_ratio", name: "Close Ratio", target: 35, actual: 28, unit: "%", higherBetter: true },
      { key: "pipeline_value", name: "Pipeline Value", target: 2500000, actual: 1800000, unit: "$", higherBetter: true },
      { key: "rev_forecast", name: "Revenue Forecast", target: 5000000, actual: 4200000, unit: "$", higherBetter: true },
      { key: "client_retention", name: "Client Retention", target: 90, actual: 85, unit: "%", higherBetter: true },
    ],
    sops: [
      { title: "Lead Intake Process", body: "Log every inbound lead in the pipeline within 24 hours. Assign an owner, qualify against project minimums, and schedule the first response before end of day." },
    ],
    accountEmail: "bizdev@mechanicsos.local",
    accountName: "Business Development Lead",
    role: "DEPT_HEAD",
  },
  {
    key: "ops",
    name: "Operations",
    short: "Ops",
    icon: "Cog",
    purpose: "Execute work efficiently and consistently.",
    includes: ["Project management", "Scheduling", "Purchasing", "Deployment", "Field execution", "QA/QC", "Closeout"],
    outputs: ["Completed projects", "Customer satisfaction", "Billing readiness"],
    kpis: [
      { key: "labor_eff", name: "Labor Efficiency", target: 85, actual: 78, unit: "%", higherBetter: true },
      { key: "on_time", name: "On-Time Completion", target: 95, actual: 88, unit: "%", higherBetter: true },
      { key: "rework", name: "Rework", target: 3, actual: 6, unit: "%", higherBetter: false },
      { key: "job_profit", name: "Job Profitability", target: 18, actual: 14, unit: "%", higherBetter: true },
    ],
    sops: [
      { title: "Closeout Checklist", body: "Confirm punch list is signed off, final billing package is assembled, and QA/QC documentation is filed before a job is marked complete." },
    ],
    accountEmail: "ops@mechanicsos.local",
    accountName: "Operations Lead",
    role: "DEPT_HEAD",
  },
  {
    key: "finance",
    name: "Finance",
    short: "Finance",
    icon: "Wallet",
    purpose: "Manage the financial health of the business.",
    includes: ["Billing", "Payroll", "Job costing", "Forecasting", "Cash flow", "Budgeting", "Collections"],
    outputs: ["Profitability", "Cash reserves", "Growth capital"],
    kpis: [
      { key: "net_margin", name: "Net Margin", target: 12, actual: 9, unit: "%", higherBetter: true },
      { key: "ar_aging", name: "AR Aging", target: 30, actual: 45, unit: "days", higherBetter: false },
      { key: "cash_flow", name: "Cash Flow", target: 500000, actual: 320000, unit: "$", higherBetter: true },
      { key: "overhead", name: "Overhead", target: 20, actual: 24, unit: "%", higherBetter: false },
      { key: "labor_pct", name: "Labor %", target: 35, actual: 38, unit: "%", higherBetter: false },
    ],
    sops: [
      { title: "Monthly Close Procedure", body: "Reconcile job costing against billing by the 3rd business day. Update the cash flow forecast and circulate the margin summary to leadership." },
    ],
    accountEmail: "finance@mechanicsos.local",
    accountName: "Finance Lead",
    role: "DEPT_HEAD",
  },
  {
    key: "people",
    name: "People",
    short: "People",
    icon: "Users",
    purpose: "Develop and support the operators of the machine.",
    includes: ["Hiring", "Onboarding", "Training", "Accountability", "Incentives", "Leadership development"],
    outputs: ["Stronger teams", "Lower turnover", "Better execution"],
    kpis: [
      { key: "retention", name: "Retention", target: 90, actual: 82, unit: "%", higherBetter: true },
      { key: "training", name: "Training Completion", target: 100, actual: 74, unit: "%", higherBetter: true },
      { key: "safety", name: "Safety Performance", target: 100, actual: 96, unit: "pts", higherBetter: true },
      { key: "utilization", name: "Team Utilization", target: 80, actual: 71, unit: "%", higherBetter: true },
    ],
    sops: [
      { title: "Onboarding Sequence", body: "New hires complete safety orientation on day one, are paired with a mentor for two weeks, and have a 30-day check-in scheduled before their start date." },
    ],
    accountEmail: "people@mechanicsos.local",
    accountName: "People Lead",
    role: "DEPT_HEAD",
  },
  {
    key: "tech",
    name: "Technology & Automation",
    short: "Tech",
    icon: "Cpu",
    purpose: "Connect systems and improve visibility.",
    includes: ["Microsoft 365", "Teams", "Smartsheet", "Dashboards", "Power Automate", "AI workflows", "Reporting systems"],
    outputs: ["Faster decisions", "Automation", "Better communication", "Real-time visibility"],
    kpis: [
      { key: "hours_eliminated", name: "Manual Hours Eliminated", target: 200, actual: 120, unit: "hrs/mo", higherBetter: true },
      { key: "report_speed", name: "Reporting Speed", target: 24, actual: 48, unit: "hrs", higherBetter: false },
      { key: "automation_count", name: "Automation Count", target: 25, actual: 14, unit: "live", higherBetter: true },
      { key: "data_accuracy", name: "Data Accuracy", target: 99, actual: 93, unit: "%", higherBetter: true },
    ],
    sops: [
      { title: "New Automation Request", body: "Submit the manual process for review, confirm the data source is centralized, then build and test the automation in a sandbox before publishing it company-wide." },
    ],
    accountEmail: "tech@mechanicsos.local",
    accountName: "Technology & Automation Lead",
    role: "DEPT_HEAD",
  },
  {
    key: "leadership",
    name: "Leadership",
    short: "Lead",
    icon: "Compass",
    purpose: "Engineer and guide the machine.",
    includes: ["Vision", "Priorities", "Communication", "Strategic planning", "Accountability", "Continuous improvement"],
    outputs: ["Alignment", "Clarity", "Execution", "Growth"],
    kpis: [
      { key: "goals_completed", name: "Strategic Goals Completed", target: 100, actual: 62, unit: "%", higherBetter: true },
      { key: "alignment", name: "Department Alignment", target: 100, actual: 71, unit: "pts", higherBetter: true },
      { key: "company_perf", name: "Company-Wide Performance", target: 100, actual: 78, unit: "pts", higherBetter: true },
    ],
    sops: [
      { title: "Quarterly Strategy Review", body: "Review progress against strategic goals with every department head, document blockers, and re-prioritize the roadmap for the next quarter." },
    ],
    accountEmail: "leadership@mechanicsos.local",
    accountName: "Leadership",
    role: "LEADERSHIP",
  },
];

async function main() {
  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  for (const [index, dept] of DEPARTMENTS.entries()) {
    const department = await prisma.department.upsert({
      where: { key: dept.key },
      update: {
        name: dept.name,
        short: dept.short,
        icon: dept.icon,
        purpose: dept.purpose,
        includes: JSON.stringify(dept.includes),
        outputs: JSON.stringify(dept.outputs),
        order: index,
      },
      create: {
        key: dept.key,
        name: dept.name,
        short: dept.short,
        icon: dept.icon,
        purpose: dept.purpose,
        includes: JSON.stringify(dept.includes),
        outputs: JSON.stringify(dept.outputs),
        order: index,
      },
    });

    for (const kpi of dept.kpis) {
      await prisma.kpi.upsert({
        where: { departmentId_key: { departmentId: department.id, key: kpi.key } },
        update: {},
        create: {
          key: kpi.key,
          name: kpi.name,
          unit: kpi.unit,
          higherBetter: kpi.higherBetter,
          target: kpi.target,
          actual: kpi.actual,
          departmentId: department.id,
        },
      });
    }

    const existingSops = await prisma.sop.count({ where: { departmentId: department.id } });
    if (existingSops === 0) {
      for (const sop of dept.sops) {
        await prisma.sop.create({
          data: {
            title: sop.title,
            body: sop.body,
            departmentId: department.id,
          },
        });
      }
    }

    await prisma.user.upsert({
      where: { email: dept.accountEmail },
      update: {},
      create: {
        email: dept.accountEmail,
        name: dept.accountName,
        role: dept.role,
        departmentId: department.id,
        passwordHash,
      },
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@mechanicsos.local" },
    update: {},
    create: {
      email: "admin@mechanicsos.local",
      name: "Admin",
      role: "ADMIN",
      departmentId: null,
      passwordHash,
    },
  });

  console.log("Seed complete.");
  console.log("");
  console.log("Accounts created (all share the seed password below):");
  for (const dept of DEPARTMENTS) {
    console.log(`  ${dept.accountEmail}  (${dept.role}, ${dept.name})`);
  }
  console.log("  admin@mechanicsos.local  (ADMIN)");
  console.log("");
  console.log(`Seed password: ${defaultPassword}`);
  console.log("Change every password after first login — see README.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
