export type TaskStatus = "pending" | "in-progress" | "completed" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string; // ISO
  project?: string;
  createdAt?: string; // ISO
  completedAt?: string; // ISO
  subtasks?: Array<{ id: string; title: string; done: boolean }>;
}

let tasks: TaskItem[] = [
  {
    id: "1",
    title: "Design Landing Page",
    description: "Create responsive UI for the new landing page",
    status: "in-progress",
    priority: "high",
    assignee: "Sarah Johnson",
    dueDate: "2025-09-10",
    project: "Website Redesign",
    createdAt: "2025-08-31",
    subtasks: [
      { id: "1-1", title: "Wireframes", done: true },
      { id: "1-2", title: "High-fidelity mocks", done: false },
    ],
  },
  {
    id: "2",
    title: "API Authentication",
    description: "Implement JWT-based authentication for the API",
    status: "pending",
    priority: "urgent",
    assignee: "Alex Chen",
    dueDate: "2025-09-05",
    project: "Customer Portal",
    createdAt: "2025-09-01",
    subtasks: [
      { id: "2-1", title: "Auth routes", done: false },
      { id: "2-2", title: "Token refresh", done: false },
    ],
  },
  {
    id: "3",
    title: "Marketing Copy Q4",
    description: "Draft marketing copy for Q4 campaigns",
    status: "completed",
    priority: "medium",
    assignee: "Emily Davis",
    dueDate: "2025-08-18",
    project: "Q4 Campaign",
    createdAt: "2025-08-10",
    completedAt: "2025-08-18",
    subtasks: [
      { id: "3-1", title: "Draft", done: true },
      { id: "3-2", title: "Review", done: true },
    ],
  },
  {
    id: "4",
    title: "Database Backups",
    description: "Set up automated nightly backups",
    status: "blocked",
    priority: "high",
    assignee: "Mike Davis",
    dueDate: "2025-09-02",
    project: "Infra Ops",
    createdAt: "2025-09-02",
  },
  {
    id: "5",
    title: "App Store Assets",
    description: "Prepare screenshots and metadata for app stores",
    status: "pending",
    priority: "low",
    assignee: "Emma Wilson",
    dueDate: "2025-09-20",
    project: "Mobile App",
    createdAt: "2025-09-05",
  },
  {
    id: "6",
    title: "Payment Webhooks",
    description: "Implement payment webhook handlers",
    status: "completed",
    priority: "high",
    assignee: "Alex Chen",
    dueDate: "2025-09-02",
    project: "Billing",
    createdAt: "2025-08-25",
    completedAt: "2025-09-02",
  },
  {
    id: "7",
    title: "Onboarding Emails",
    description: "Set up onboarding email sequence",
    status: "in-progress",
    priority: "medium",
    assignee: "Sarah Johnson",
    dueDate: "2025-09-12",
    project: "Growth",
    createdAt: "2025-09-03",
  },
  {
    id: "8",
    title: "Incident Runbook",
    description: "Document incident response procedures",
    status: "completed",
    priority: "medium",
    assignee: "Mike Davis",
    dueDate: "2025-09-04",
    project: "SRE",
    createdAt: "2025-08-28",
    completedAt: "2025-09-04",
  },
];

export function getTasks(): TaskItem[] {
  return tasks;
}

export function setTasks(next: TaskItem[]): void {
  tasks = next;
}

export function addTask(task: TaskItem): void {
  tasks = [...tasks, task];
}

export function updateTask(id: string, updates: Partial<TaskItem>): TaskItem | undefined {
  let updated: TaskItem | undefined;
  tasks = tasks.map((t) => {
    if (t.id === id) {
      updated = { ...t, ...updates } as TaskItem;
      return updated;
    }
    return t;
  });
  return updated;
}

export function deleteTask(id: string): void {
  tasks = tasks.filter((t) => t.id !== id);
}
