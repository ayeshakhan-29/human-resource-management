// Centralized data for projects and tasks
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  progress: number;
  teamSize: number;
  manager: string;
  budget: string;
  category: string;
  tasks: Task[];
  milestones: Milestone[];
}

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Milestone {
  id: string;
  name: string;
  dueDate: string;
  status: 'pending' | 'completed';
  description: string;
}

export const projects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of company website with modern design and improved UX",
    status: "active",
    priority: "high",
    startDate: "2025-01-15",
    endDate: "2025-04-30",
    progress: 65,
    teamSize: 8,
    manager: "Sarah Johnson",
    budget: "$45,000",
    category: "Development",
    tasks: [
      { id: "t1", name: "Design Mockups", status: "completed", assignee: "Alex Chen", dueDate: "2025-02-01", priority: "high" },
      { id: "t2", name: "Frontend Development", status: "in-progress", assignee: "Mike Davis", dueDate: "2025-03-15", priority: "high" },
      { id: "t3", name: "Backend API", status: "pending", assignee: "Lisa Wang", dueDate: "2025-03-30", priority: "medium" }
    ],
    milestones: [
      { id: "m1", name: "Design Approval", dueDate: "2025-02-01", status: "completed", description: "Final design mockups approved" },
      { id: "m2", name: "Development Complete", dueDate: "2025-03-30", status: "pending", description: "All development work finished" },
      { id: "m3", name: "Testing & Launch", dueDate: "2025-04-30", status: "pending", description: "Final testing and website launch" }
    ]
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "iOS and Android mobile application for customer engagement",
    status: "planning",
    priority: "urgent",
    startDate: "2025-03-01",
    endDate: "2025-08-15",
    progress: 15,
    teamSize: 12,
    manager: "Mike Chen",
    budget: "$120,000",
    category: "Development",
    tasks: [
      { id: "t4", name: "Requirements Gathering", status: "completed", assignee: "Mike Chen", dueDate: "2025-03-15", priority: "high" },
      { id: "t5", name: "UI/UX Design", status: "in-progress", assignee: "Emma Wilson", dueDate: "2025-04-15", priority: "high" }
    ],
    milestones: [
      { id: "m4", name: "Requirements Finalized", dueDate: "2025-03-15", status: "completed", description: "All requirements documented and approved" },
      { id: "m5", name: "Design Complete", dueDate: "2025-04-15", status: "pending", description: "UI/UX design finalized" }
    ]
  },
  {
    id: "3",
    name: "Marketing Campaign Q2",
    description: "Digital marketing campaign for Q2 product launch",
    status: "active",
    priority: "medium",
    startDate: "2025-04-01",
    endDate: "2025-06-30",
    progress: 40,
    teamSize: 6,
    manager: "Emily Davis",
    budget: "$25,000",
    category: "Marketing",
    tasks: [
      { id: "t6", name: "Write ad copy", status: "completed", assignee: "Emily Davis", dueDate: "2025-04-15", priority: "medium" },
      { id: "t7", name: "Schedule posts", status: "in-progress", assignee: "John Smith", dueDate: "2025-05-01", priority: "medium" }
    ],
    milestones: [
      { id: "m6", name: "Campaign Launch", dueDate: "2025-05-01", status: "pending", description: "Marketing campaign goes live" },
      { id: "m7", name: "Performance Review", dueDate: "2025-06-30", status: "pending", description: "Analyze campaign results" }
    ]
  },
  {
    id: "4",
    name: "Office Renovation",
    description: "Modernize office space with new furniture and layout",
    status: "on-hold",
    priority: "low",
    startDate: "2025-02-01",
    endDate: "2025-05-30",
    progress: 30,
    teamSize: 4,
    manager: "David Wilson",
    budget: "$80,000",
    category: "Operations",
    tasks: [
      { id: "t8", name: "Order furniture", status: "pending", assignee: "David Wilson", dueDate: "2025-03-01", priority: "low" }
    ],
    milestones: [
      { id: "m8", name: "Furniture Delivery", dueDate: "2025-03-15", status: "pending", description: "All furniture arrives" },
      { id: "m9", name: "Renovation Complete", dueDate: "2025-05-30", status: "pending", description: "Office renovation finished" }
    ]
  },
  {
    id: "5",
    name: "Customer Portal",
    description: "Self-service portal for customer account management",
    status: "completed",
    priority: "high",
    startDate: "2025-10-01",
    endDate: "2025-01-31",
    progress: 100,
    teamSize: 10,
    manager: "Lisa Rodriguez",
    budget: "$60,000",
    category: "Development",
    tasks: [
      { id: "t9", name: "Setup user login", status: "completed", assignee: "Lisa Rodriguez", dueDate: "2025-12-01", priority: "high" },
      { id: "t10", name: "Add dashboard", status: "completed", assignee: "Tom Brown", dueDate: "2025-01-15", priority: "high" }
    ],
    milestones: [
      { id: "m10", name: "Portal Launch", dueDate: "2025-01-31", status: "completed", description: "Customer portal goes live" }
    ]
  },
  {
    id: "6",
    name: "Data Migration",
    description: "Migrate legacy systems to new cloud infrastructure",
    status: "active",
    priority: "urgent",
    startDate: "2025-03-15",
    endDate: "2025-07-30",
    progress: 55,
    teamSize: 15,
    manager: "Alex Thompson",
    budget: "$200,000",
    category: "IT",
    tasks: [
      { id: "t11", name: "Backup legacy data", status: "completed", assignee: "Alex Thompson", dueDate: "2025-04-01", priority: "urgent" },
      { id: "t12", name: "Cloud setup", status: "in-progress", assignee: "Sarah Lee", dueDate: "2025-05-15", priority: "urgent" }
    ],
    milestones: [
      { id: "m11", name: "Data Backup Complete", dueDate: "2025-04-01", status: "completed", description: "All legacy data backed up" },
      { id: "m12", name: "Migration Complete", dueDate: "2025-07-30", status: "pending", description: "All systems migrated to cloud" }
    ]
  }
];

// Legacy task export for backward compatibility
export const tasks = projects.flatMap(project => project.tasks);
