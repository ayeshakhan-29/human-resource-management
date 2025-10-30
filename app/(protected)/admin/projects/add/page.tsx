'use client';

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { createProjectWithAttachment } from "@/lib/actions/project.action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  Users,
  Target,
  Save,
  AlertCircle,
  Paperclip,
  Plus,
  X
} from "lucide-react";
import { getAllEmployees } from "@/lib/actions/employee.actions";
import type { Employee } from "@/lib/types/employee.types";

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export default function AddProjectPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as const,
    priority: 'medium' as const,
    startDate: '',
    endDate: '',
    budget: '',
    manager: '',
    clientName: '',
    clientEmail: ''
  });

  // Department and team state
  const DEPARTMENTS = [
    "development",
    "design",
    "seo",
    "marketing",
    "content writing",
  ] as const;

  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTeamMember = () => {
    if (!selectedEmployeeId) return;
    const emp = allEmployees.find(e => String(e.id) === selectedEmployeeId);
    if (!emp) return;
    const already = teamMembers.some(tm => tm.id === String(emp.id));
    if (already) return;
    const member: TeamMember = {
      id: String(emp.id),
      name: emp.fullName,
      email: emp.email,
    };
    setTeamMembers(prev => [...prev, member]);
    setSelectedEmployeeId("");
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.description.trim()) newErrors.description = 'Project description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.budget.trim()) newErrors.budget = 'Budget is required';

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Prepare data to match backend API
        const projectData = {
          name: formData.name,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: formData.budget,
          managerId: formData.manager ? parseInt(formData.manager) : undefined,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          // Send department and team to backend as extra fields; backend may ignore unknowns safely
          department: selectedDepartment || undefined,
          teamMemberIds: teamMembers.map(t => Number(t.id)),
          tags: [],
          attachments: [],
        };

        const response = await createProjectWithAttachment(projectData, selectedFile || undefined);
        if (response.success) {
          alert('Project created successfully!');
          handleReset();
        } else {
          alert('Failed to create project: ' + response.message);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        alert('Error creating project: ' + message);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: '',
      manager: '',
      clientName: '',
      clientEmail: ''
    });
    setTeamMembers([]);
    setSelectedDepartment("");
    setSelectedEmployeeId("");
    setErrors({});
    setSelectedFile(null);
  };

  // Fetch employees once
  useEffect(() => {
    const run = async () => {
      try {
        const res = await getAllEmployees();
        if (res.success) {
          setAllEmployees(res.data || []);
        }
      } catch (err) {
        // silently ignore; team picker will be empty
      }
    };
    run();
  }, []);

  // Employees filtered by selected department
  const filteredEmployees = useMemo(() => {
    if (!selectedDepartment) return [] as Employee[];
    return (allEmployees || []).filter(e => (e.userInfo?.department || "").toLowerCase() === selectedDepartment.toLowerCase());
  }, [allEmployees, selectedDepartment]);

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Projects", href: "/admin/projects" },
          { label: "Add Project" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Add New Project</h1>
          <p className="text-gray-600">Create a new project with detailed information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Essential project details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter project name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the project objectives and scope"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline and Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline & Budget
              </CardTitle>
              <CardDescription>Project schedule and financial information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.startDate}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.endDate}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget *</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="e.g., $50,000"
                    className={errors.budget ? 'border-red-500' : ''}
                  />
                  {errors.budget && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.budget}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Project Management
              </CardTitle>
              <CardDescription>Assign project manager and team members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manager">Project Manager *</Label>
              <Select value={formData.manager} onValueChange={(v) => handleInputChange('manager', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project manager" />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.fullName} ({emp.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.manager && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.manager}
                </div>
              )}
            </div>

            {/* Department Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dep) => (
                      <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add Employee from selected department */}
              <div className="space-y-2">
                <Label htmlFor="teamAdd">Add Team Member</Label>
                <div className="flex gap-2">
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={selectedDepartment ? "Select employee" : "Select department first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.fullName} ({emp.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={addTeamMember} disabled={!selectedEmployeeId}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

              {/* Team Members */}
              <div className="space-y-4">
                <Label>Team Members</Label>
                {/* Display Team Members */}
                {teamMembers.length > 0 && (
                  <div className="space-y-2">
                    <Label>Current Team Members</Label>
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.email}</div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTeamMember(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tasks Section */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Add Project Tasks
              </CardTitle>
              <CardDescription>Add tasks for this project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Input
                  placeholder="Task name"
                  value={newTask.name}
                  onChange={e => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                  className="lg:col-span-2"
                />
                <Input
                  placeholder="Assignee"
                  value={newTask.assignee}
                  onChange={e => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                />
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                <Select value={newTask.priority} onValueChange={value => setNewTask(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' | 'urgent' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newTask.status} onValueChange={value => setNewTask(prev => ({ ...prev, status: value as 'pending' | 'in-progress' | 'completed' | 'blocked' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" size="sm" className="w-full md:w-auto" onClick={addTask}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button> */}
          {/* Display Tasks */}
          {/* {tasks.length > 0 && (
                <div className="space-y-2">
                  <Label>Project Tasks</Label>
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{task.name}</span>
                            {task.status === 'completed' && <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>}
                            {task.status === 'in-progress' && <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>}
                            {task.status === 'pending' && <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>}
                            {task.status === 'blocked' && <Badge className="bg-red-100 text-red-800 border-red-200">Blocked</Badge>}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Assignee: {task.assignee}</div>
                            <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                            <div>Priority: <span className="capitalize">{task.priority}</span></div>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeTask(task.id)} className="text-red-600 hover:text-red-700">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card> */}

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Attachments
              </CardTitle>
              <CardDescription>Upload, files related to the project or tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Paperclip className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, GIF (MAX. 20MB)</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt"
                  />
                </label>
              </div>

              {/* Show selected file */}
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Paperclip className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">{selectedFile.name}</span>
                  <span className="text-xs text-blue-600">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="ml-auto text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
