'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import NoteProcessor from '../../../components/NoteProcessor';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  WrenchIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  PaperClipIcon,
  PencilIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { use } from 'react';

interface WorkUpdate {
  date: string;
  workers: Array<{
    name: string;
    duration: 'full-day' | 'half-day';
    estimatedHours: number;
  }>;
}

interface TaskUpdate {
  location: string;
  tasks: Array<{
    description: string;
    estimatedCost?: number;
  }>;
}

interface ProcessedNote {
  type: 'work' | 'task';
  content: WorkUpdate | TaskUpdate;
  rawText: string;
}

type WorkType = 'plumbing' | 'electrical' | 'carpentry' | 'general';

interface WorkItem {
  _id: string;
  id?: number;
  item: string;
  costEstimate: number;
  status: 'completed' | 'pending' | 'in_progress';
  type: WorkType;
  location: string;
  notes?: string;
  dateAdded: string;
  dateCompleted?: string;
  project: string;
}

interface Worker {
  id: number;
  name: string;
  role: string;
  hourlyRate: number;
  hoursWorked: number;
  specialty: WorkType[];
}

interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  url: string;
}

interface Project {
  _id: string;
  name: string;
  address: string;
  description: string;
  status: string;
  startDate: string;
  estimatedCompletion: string;
  budget: number;
  totalSpent?: number;
}

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const [activeTab, setActiveTab] = useState('overview');
  const [showNoteProcessor, setShowNoteProcessor] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showAddWorkItemModal, setShowAddWorkItemModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [newWorker, setNewWorker] = useState<Partial<Worker>>({
    name: '',
    role: '',
    hourlyRate: 0,
    hoursWorked: 0,
    specialty: [],
  });
  const [newWorkItem, setNewWorkItem] = useState<Partial<WorkItem>>({
    item: '',
    costEstimate: 0,
    type: 'general',
    location: '',
    notes: '',
    status: 'pending',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);
  const [isEditingWorkItem, setIsEditingWorkItem] = useState(false);
  const [selectedWorkItemForSchedule, setSelectedWorkItemForSchedule] = useState<WorkItem | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: 1,
      name: 'John Smith',
      role: 'Lead Electrician',
      hourlyRate: 75,
      hoursWorked: 24,
      specialty: ['electrical'],
    },
    {
      id: 2,
      name: 'Mike Johnson',
      role: 'Carpenter',
      hourlyRate: 65,
      hoursWorked: 16,
      specialty: ['carpentry'],
    },
  ]);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      name: 'Project Contract.pdf',
      type: 'PDF',
      uploadDate: '2024-01-15',
      size: '2.4 MB',
      url: '#',
    },
    {
      id: 2,
      name: 'Building Permit.pdf',
      type: 'PDF',
      uploadDate: '2024-01-16',
      size: '1.8 MB',
      url: '#',
    },
  ]);

  const typeColors: Record<WorkType, string> = {
    plumbing: 'bg-blue-100 text-blue-800',
    electrical: 'bg-yellow-100 text-yellow-800',
    carpentry: 'bg-green-100 text-green-800',
    general: 'bg-gray-100 text-gray-800',
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'work-items', name: 'Work Items' },
    { id: 'workers', name: 'Workers' },
    { id: 'documents', name: 'Documents' },
    { id: 'payroll', name: 'Payroll' },
  ];

  const handleNoteAccept = (processedNote: ProcessedNote) => {
    if (processedNote.type === 'work') {
      const workUpdate = processedNote.content as WorkUpdate;
      const updatedWorkers = [...workers];
      workUpdate.workers.forEach((update) => {
        const workerIndex = updatedWorkers.findIndex(
          (w) => w.name.toLowerCase() === update.name.toLowerCase()
        );
        if (workerIndex >= 0) {
          updatedWorkers[workerIndex].hoursWorked += update.estimatedHours;
        }
      });
      setWorkers(updatedWorkers);
    } else if (processedNote.type === 'task') {
      const taskUpdate = processedNote.content as TaskUpdate;
      const newWorkItems = taskUpdate.tasks.map((task, index) => ({
        _id: `temp-${Date.now()}-${index}`,
        item: task.description,
        costEstimate: task.estimatedCost || 0,
        status: 'pending' as const,
        type: 'general' as WorkType,
        location: taskUpdate.location,
        dateAdded: new Date().toISOString(),
        project: projectId,
      }));
      setWorkItems([...workItems, ...newWorkItems]);
    }
    setShowNoteProcessor(false);
  };

  const handleNoteReject = () => {
    setShowNoteProcessor(false);
  };

  const handleNoteEdit = (editedNote: ProcessedNote) => {
    handleNoteAccept(editedNote);
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorker.name && newWorker.role && newWorker.hourlyRate) {
      const worker: Worker = {
        id: Math.max(...workers.map(w => w.id)) + 1,
        name: newWorker.name,
        role: newWorker.role,
        hourlyRate: newWorker.hourlyRate,
        hoursWorked: 0,
        specialty: newWorker.specialty || [],
      };
      setWorkers([...workers, worker]);
      setShowAddWorkerModal(false);
      setNewWorker({
        name: '',
        role: '',
        hourlyRate: 0,
        hoursWorked: 0,
        specialty: [],
      });
    }
  };

  const handleAddWorkItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkItem.item && newWorkItem.type && newWorkItem.location) {
      try {
        const response = await fetch('/api/work-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newWorkItem,
            project: projectId,
          }),
        });

        if (!response.ok) throw new Error('Failed to create work item');
        
        await fetchWorkItems();
        setShowAddWorkItemModal(false);
        setNewWorkItem({
          item: '',
          costEstimate: 0,
          type: 'general',
          location: '',
          notes: '',
          status: 'pending',
        });
      } catch (error) {
        console.error('Error creating work item:', error);
      }
    }
  };

  const handleEditWorkItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkItem?._id) return;

    try {
      const response = await fetch(`/api/work-items/${selectedWorkItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedWorkItem),
      });

      if (!response.ok) throw new Error('Failed to update work item');
      
      await fetchWorkItems();
      setIsEditingWorkItem(false);
      setSelectedWorkItem(null);
    } catch (error) {
      console.error('Error updating work item:', error);
    }
  };

  const handleDeleteWorkItem = async (workItemId: string) => {
    if (!window.confirm('Are you sure you want to delete this work item?')) return;

    try {
      const response = await fetch(`/api/work-items/${workItemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete work item');
      
      await fetchWorkItems();
    } catch (error) {
      console.error('Error deleting work item:', error);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      const newDocument: Document = {
        id: Math.max(...documents.map(d => d.id)) + 1,
        name: selectedFile.name,
        type: selectedFile.type,
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        url: '#',
      };
      setDocuments([...documents, newDocument]);
      setShowAddDocumentModal(false);
      setSelectedFile(null);
    }
  };

  const handleScheduleWorkItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkItemForSchedule) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedWorkItemForSchedule.item,
          start: startTime,
          end: endTime,
          project: projectId,
          location: selectedWorkItemForSchedule.location,
          workType: selectedWorkItemForSchedule.type,
          description: selectedWorkItemForSchedule.notes || '',
        }),
      });

      if (!response.ok) throw new Error('Failed to schedule work item');

      setShowScheduleModal(false);
      setSelectedWorkItemForSchedule(null);
    } catch (error) {
      console.error('Error scheduling work item:', error);
    }
  };

  const fetchWorkItems = async () => {
    try {
      console.log('Fetching work items for project:', projectId);
      const response = await fetch(`/api/work-items?projectId=${projectId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`Failed to fetch work items: ${response.status} ${errorText}`);
      }
      const workItems = await response.json();
      console.log('Received work items:', workItems);
      setWorkItems(workItems || []);
    } catch (error) {
      console.error('Error fetching work items:', error);
      setWorkItems([]);
    }
  };

  const fetchProject = async () => {
    try {
      console.log('Fetching project:', projectId);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`Failed to fetch project: ${response.status} ${errorText}`);
      }
      const projectData = await response.json();
      console.log('Received project:', projectData);
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    fetchWorkItems();
  }, [projectId]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'work-items':
        return (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Work Items</h2>
              <button
                onClick={() => setShowAddWorkItemModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Work Item
              </button>
            </div>
            <div className="space-y-4">
              {workItems.map((item) => (
                <div
                  key={item._id}
                  className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.item}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.location}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[item.type]}`}>
                        {item.type}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedWorkItemForSchedule(item);
                          setShowScheduleModal(true);
                        }}
                        className="p-1 text-gray-500 hover:text-blue-500"
                        title="Schedule Work Item"
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWorkItem(item);
                          setIsEditingWorkItem(true);
                        }}
                        className="p-1 text-gray-500 hover:text-blue-500"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkItem(item._id)}
                        className="p-1 text-gray-500 hover:text-red-500"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="text-gray-500 dark:text-gray-400">
                      Cost Estimate: ${item.costEstimate.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      {item.status === 'completed' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                      ) : item.status === 'in_progress' ? (
                        <ClockIcon className="h-5 w-5 text-yellow-500 mr-1" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-gray-400 mr-1" />
                      )}
                      <span className="capitalize">{item.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="mt-2 text-sm text-gray-500">{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'workers':
        return (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Workers</h2>
              <button
                onClick={() => setShowAddWorkerModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Worker
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="border dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{worker.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{worker.role}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div>Rate: ${worker.hourlyRate}/hr</div>
                    <div>Hours: {worker.hoursWorked}</div>
                    <div className="flex flex-wrap gap-2">
                      {worker.specialty.map((spec) => (
                        <span
                          key={spec}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[spec]}`}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Documents</h2>
              <button
                onClick={() => setShowAddDocumentModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Document
              </button>
            </div>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border dark:border-gray-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <PaperClipIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{doc.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {doc.size} • Uploaded {doc.uploadDate}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">Loading project...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.address}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Budget</span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                ${project.budget.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Spent</span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                ${(project.totalSpent || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Start Date</span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(project.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Est. Completion</span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(project.estimatedCompletion).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowNoteProcessor(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Note
            </button>
          </div>
        </div>

        {showNoteProcessor && (
          <NoteProcessor
            onAccept={handleNoteAccept}
            onReject={handleNoteReject}
            onEdit={handleNoteEdit}
          />
        )}

        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {renderTabContent()}
      </div>

      <Transition appear show={showAddWorkerModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowAddWorkerModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Add New Worker
                  </Dialog.Title>
                  <form onSubmit={handleAddWorker} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newWorker.name}
                        onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Role
                      </label>
                      <input
                        type="text"
                        required
                        value={newWorker.role}
                        onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={newWorker.hourlyRate}
                        onChange={(e) => setNewWorker({ ...newWorker, hourlyRate: parseFloat(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Specialties
                      </label>
                      <select
                        multiple
                        value={newWorker.specialty}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value as WorkType);
                          setNewWorker({ ...newWorker, specialty: values });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="plumbing">Plumbing</option>
                        <option value="electrical">Electrical</option>
                        <option value="carpentry">Carpentry</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddWorkerModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                      >
                        Add Worker
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isEditingWorkItem} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsEditingWorkItem(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Edit Work Item
                  </Dialog.Title>
                  <form onSubmit={handleEditWorkItem} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Item Description
                      </label>
                      <input
                        type="text"
                        required
                        value={selectedWorkItem?.item || ''}
                        onChange={(e) => setSelectedWorkItem(prev => prev ? { ...prev, item: e.target.value } : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location
                      </label>
                      <input
                        type="text"
                        required
                        value={selectedWorkItem?.location || ''}
                        onChange={(e) => setSelectedWorkItem(prev => prev ? { ...prev, location: e.target.value } : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cost Estimate ($)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={selectedWorkItem?.costEstimate || 0}
                        onChange={(e) => setSelectedWorkItem(prev => prev ? { ...prev, costEstimate: parseFloat(e.target.value) } : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <select
                        value={selectedWorkItem?.type || 'general'}
                        onChange={(e) => setSelectedWorkItem(prev => prev ? { ...prev, type: e.target.value as WorkType } : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="general">General</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="electrical">Electrical</option>
                        <option value="carpentry">Carpentry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <select
                        value={selectedWorkItem?.status || 'pending'}
                        onChange={(e) => setSelectedWorkItem(prev => prev ? { ...prev, status: e.target.value as WorkItem['status'] } : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={selectedWorkItem?.notes || ''}
                        onChange={(e) => setSelectedWorkItem(prev => prev ? { ...prev, notes: e.target.value } : null)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditingWorkItem(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={showAddWorkItemModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowAddWorkItemModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Add Work Item
                  </Dialog.Title>
                  <form onSubmit={handleAddWorkItem} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Item Description
                      </label>
                      <input
                        type="text"
                        required
                        value={newWorkItem.item}
                        onChange={(e) => setNewWorkItem({ ...newWorkItem, item: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location
                      </label>
                      <input
                        type="text"
                        required
                        value={newWorkItem.location}
                        onChange={(e) => setNewWorkItem({ ...newWorkItem, location: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cost Estimate ($)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={newWorkItem.costEstimate}
                        onChange={(e) => setNewWorkItem({ ...newWorkItem, costEstimate: parseFloat(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <select
                        value={newWorkItem.type}
                        onChange={(e) => setNewWorkItem({ ...newWorkItem, type: e.target.value as WorkType })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="general">General</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="electrical">Electrical</option>
                        <option value="carpentry">Carpentry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={newWorkItem.notes}
                        onChange={(e) => setNewWorkItem({ ...newWorkItem, notes: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddWorkItemModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                      >
                        Add Work Item
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={showAddDocumentModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowAddDocumentModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Add Document
                  </Dialog.Title>
                  <form onSubmit={handleAddDocument} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Upload Document
                      </label>
                      <input
                        type="file"
                        required
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddDocumentModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedFile}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Upload Document
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={showScheduleModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowScheduleModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Schedule Work Item
                  </Dialog.Title>
                  <form onSubmit={handleScheduleWorkItem} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowScheduleModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                      >
                        Schedule
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </DashboardLayout>
  );
} 