'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader } from '@googlemaps/js-api-loader';
import { format, isSameDay, addDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import * as Tabs from '@radix-ui/react-tabs';
// MUI imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs from 'dayjs';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// declare global {
//   interface Window {
//     google: {
//       maps: {
//         DistanceMatrixService: new () => {
//           getDistanceMatrix: (options: any) => Promise<any>;
//         };
//         TravelMode: {
//           DRIVING: string;
//         };
//         TrafficModel: {
//           BEST_GUESS: string;
//         };
//       };
//     };
//   }
// }

const muiDatePickerStyles = {
  '.MuiPickersDay-root': {
    fontSize: '0.875rem',
    margin: 0,
  },
  '.MuiDayCalendar-header': {
    paddingBottom: '8px',
  },
  '.MuiPickersCalendarHeader-label': {
    fontSize: '1rem',
    fontWeight: 500,
  },
  '.MuiPickersDay-root.Mui-selected': {
    backgroundColor: '#3B82F6',
    color: '#fff',
  },
  '.MuiPickersDay-today': {
    border: '1px solid #3B82F6',
  },
};

const workTypeColors: Record<string, string> = {
  plumbing: '#0EA5E9',  // Sky blue
  electrical: '#F59E0B', // Amber
  carpentry: '#10B981',  // Emerald
  general: '#8B5CF6',    // Violet
};

export interface WorkEvent {
  _id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  project: {
    _id: string;
    name: string;
    address: string;
  };
  location: string;
  workers: Array<{
    _id: string;
    name: string;
    workType: string;
  }>;
  workType: 'plumbing' | 'electrical' | 'carpentry' | 'general';
  description: string;
  travelTimeBefore?: number; // in minutes
  backgroundColor?: string;
}

function MiniCalendar({ 
  selectedDate,
  onDateSelect,
}: { 
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={dayjs(selectedDate)}
          onChange={(newValue) => {
            if (newValue) {
              onDateSelect(newValue.toDate());
            }
          }}
          slotProps={{
            day: {
              sx: {
                '&.MuiPickersDay-root.Mui-selected': {
                  backgroundColor: '#3B82F6',
                },
                '&.MuiPickersDay-root.Mui-selected:hover': {
                  backgroundColor: '#2563EB',
                },
                '&.MuiPickersDay-root.Mui-selected:focus': {
                  backgroundColor: '#2563EB',
                },
                '&.MuiPickersDay-root': {
                  fontSize: '0.75rem',
                  margin: 0,
                  padding: '4px 0',
                },
                '&.MuiPickersDay-today': {
                  border: '1px solid #3B82F6',
                },
              }
            }
          }}
          sx={{
            width: '100%',
            '& .MuiDayCalendar-header': {
              justifyContent: 'space-around',
              paddingBottom: '8px',
            },
            '& .MuiDayCalendar-weekContainer': {
              justifyContent: 'space-around',
            },
            '& .MuiPickersCalendarHeader-label': {
              fontSize: '0.875rem',
              fontWeight: 500,
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
}

function EventsList({ 
  events, 
  selectedDate,
  onDateSelect,
}: { 
  events: WorkEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}) {
  const todaysEvents = events.filter(event => 
    isSameDay(new Date(event.start), selectedDate)
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">
          {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        {todaysEvents.length > 0 && (
          <span className="text-xs text-gray-500">{todaysEvents.length} event{todaysEvents.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="space-y-4">
        {todaysEvents.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-gray-500 mb-2">No events scheduled</p>
            {/* <button 
              onClick={() => {}}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add event
            </button> */}
          </div>
        ) :
          todaysEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start mb-2">
                <div className="w-2 h-2 rounded-full mt-1.5 mr-2.5" style={{ backgroundColor: workTypeColors[event.workType] }}></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {event.title}
                  </h4>
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                  </div>
                </div>
                {event.travelTimeBefore && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center whitespace-nowrap">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {event.travelTimeBefore}min
                  </span>
                )}
              </div>
              
              {event.description && (
                <p className="text-xs text-gray-500 ml-4.5 mb-3 line-clamp-2">{event.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{event.location || event.project?.address}</span>
                </div>
                <div className="flex -space-x-2">
                  {event.workers && event.workers.map((worker) => (
                    <span key={worker._id} className="inline-block h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium uppercase">
                      {worker.name.charAt(0)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

interface Project {
  _id: string;
  name: string;
  address: string;
}

interface Worker {
  _id: string;
  name: string;
  workType: string;
}

interface CreateEventFormData {
  title: string;
  start: string;
  end: string;
  project: string;
  location: string;
  workers: string[];
  workType: 'plumbing' | 'electrical' | 'carpentry' | 'general';
  description: string;
}

function CreateEventModal({ 
  isOpen, 
  closeModal, 
  projects,
  workers,
  selectedDate,
  refreshEvents
}: { 
  isOpen: boolean; 
  closeModal: () => void;
  projects: Project[];
  workers: Worker[];
  selectedDate?: Date;
  refreshEvents?: () => void;
}) {
  const [formData, setFormData] = useState<CreateEventFormData>({
    title: '',
    start: selectedDate ? new Date(selectedDate.setHours(9, 0, 0, 0)).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    end: selectedDate ? new Date(selectedDate.setHours(17, 0, 0, 0)).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    project: '',
    location: '',
    workers: [],
    workType: 'general',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form dates when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const startDate = new Date(selectedDate);
      startDate.setHours(9, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(17, 0, 0, 0);
      
      setFormData(prev => ({
        ...prev,
        start: startDate.toISOString().slice(0, 16),
        end: endDate.toISOString().slice(0, 16)
      }));
    }
  }, [selectedDate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData({
      ...formData,
      workers: selectedOptions
    });
    
    if (errors.workers) {
      setErrors({
        ...errors,
        workers: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    
    if (!formData.start) {
      newErrors.start = 'Start date/time is required';
    }
    
    if (!formData.end) {
      newErrors.end = 'End date/time is required';
    } else if (new Date(formData.end) <= new Date(formData.start)) {
      newErrors.end = 'End time must be after start time';
    }
    
    if (!formData.project) {
      newErrors.project = 'Project is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting event data:', formData);
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      console.log('Event creation response:', result);
      
      if (result.success) {
        closeModal();
        if (refreshEvents) {
          refreshEvents();
        } else {
          // Force calendar refresh by reloading the page
          window.location.reload();
        }
      } else {
        setErrors({
          form: result.message || 'Failed to create event'
        });
        // If there are specific field errors, update the errors state
        if (result.errors) {
          setErrors(prev => ({
            ...prev,
            ...result.errors
          }));
        }
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setErrors({
        form: 'An error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Schedule New Event
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={closeModal}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.form && (
                    <div className="p-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded">
                      {errors.form}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Event Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm`}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Date/Time*
                      </label>
                      <input
                        type="datetime-local"
                        name="start"
                        id="start"
                        value={formData.start}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border ${errors.start ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm`}
                      />
                      {errors.start && <p className="mt-1 text-sm text-red-500">{errors.start}</p>}
                    </div>
                    <div>
                      <label htmlFor="end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        End Date/Time*
                      </label>
                      <input
                        type="datetime-local"
                        name="end"
                        id="end"
                        value={formData.end}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border ${errors.end ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm`}
                      />
                      {errors.end && <p className="mt-1 text-sm text-red-500">{errors.end}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project*
                    </label>
                    <select
                      name="project"
                      id="project"
                      value={formData.project}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${errors.project ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm`}
                    >
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name} - {project.address}
                        </option>
                      ))}
                    </select>
                    {errors.project && <p className="mt-1 text-sm text-red-500">{errors.project}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location*
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm`}
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="workers" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assigned Workers
                    </label>
                    <select
                      multiple
                      name="workers"
                      id="workers"
                      value={formData.workers}
                      onChange={handleWorkerChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                      size={Math.min(5, (workers || []).length || 3)}
                    >
                      {(workers || []).map((worker) => (
                        <option key={worker._id} value={worker._id}>
                          {worker.name} ({worker.workType})
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple workers</p>
                  </div>
                  
                  <div>
                    <label htmlFor="workType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Work Type
                    </label>
                    <select
                      name="workType"
                      id="workType"
                      value={formData.workType}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                    >
                      <option value="general">General</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="carpentry">Carpentry</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creating...' : 'Schedule Event'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default function Schedule() {
  const [events, setEvents] = useState<WorkEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<WorkEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day'>('day');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);

  const resetToToday = () => {
    const today = new Date();
    setSelectedDate(today);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Initialize Google Maps Distance Matrix
  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      libraries: ['places'],
    });

    loader.load().then(() => {
      console.log('Google Maps API loaded');
    });
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Calculate date range for the query
        const startDate = startOfWeek(selectedDate);
        const endDate = endOfWeek(selectedDate);
        
        // Format dates as ISO strings
        const startISO = startDate.toISOString();
        const endISO = endDate.toISOString();
        
        const response = await fetch(
          `/api/events?startDate=${startISO}&endDate=${endISO}`
        );
        
        if (!response.ok) {
          throw new Error(`Error fetching events: ${response.statusText}`);
        }
        
        const events = await response.json();
        setEvents(events);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [selectedDate]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch projects for the dropdown
        const projectsResponse = await fetch('/api/projects');
        const projectsResult = await projectsResponse.json();
        setProjects(projectsResult.data || []);
        
        // Fetch workers for the dropdown
        const workersResponse = await fetch('/api/workers');
        const workersResult = await workersResponse.json();
        setWorkers(workersResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProjects([]);
        setWorkers([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // const viewOptions = [
  //   { key: 'day', label: 'day' },
  //   { key: 'week', label: 'week' },
  //   { key: 'month', label: 'month' },
  // ];

  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const weekTitle = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;

  // Get the events for the currently selected date
  const currentDayEvents = events.filter(event => 
    isSameDay(new Date(event.start), selectedDate)
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Render time slots for day view
  const renderTimeSlots = () => {
    const hours = [];
    for (let i = 7; i < 19; i++) {
      const hour = i % 12 === 0 ? 12 : i % 12;
      const ampm = i < 12 ? 'am' : 'pm';
      hours.push(
        <div key={i} className="flex border-t border-gray-200 dark:border-gray-700">
          <div className="w-16 py-4 pr-4 text-right text-xs text-gray-500">
            {hour}{ampm}
          </div>
          <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 relative min-h-[60px]">
            {currentDayEvents
              .filter(event => {
                const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
                const eventHour = eventStart.getHours();
                return eventHour === i;
              })
              .map((event) => {
                const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
                const eventEnd = event.end instanceof Date ? event.end : new Date(event.end);
                
                return (
                  <div
                    key={event._id}
                    onClick={() => {
                      setSelectedEventDetails(event);
                    }}
                    className="absolute mx-2 rounded-lg p-2 cursor-pointer"
                    style={{
                      backgroundColor: workTypeColors[event.workType],
                      top: `${(eventStart.getMinutes() / 60) * 100}%`,
                      height: `${(eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60) * 100}%`,
                      minHeight: '25px',
                      left: '0',
                      right: '0',
                      zIndex: 10,
                    }}
                  >
                    <div className="font-medium text-white truncate text-sm">{event.title}</div>
                    <div className="text-xs text-white text-opacity-90 truncate">
                      {format(eventStart, 'h:mm a')} - {format(eventEnd, 'h:mm a')}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      );
    }
    return hours;
  };

  const handleAddEvent = (date?: Date) => {
    setSelectedDate(date || new Date());
    setIsCreateModalOpen(true);
  };

  const handleRefreshEvents = () => {
    // Calendar component handles its own data fetching through useEffect
    window.location.reload();
  };

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
          
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Calendar</h1>
                <button 
                  onClick={resetToToday}
                  className="ml-4 text-sm bg-white dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  Today
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAddEvent()}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Event
                </button>
                {/* <div className="view-selector flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  {viewOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setView(option.key as 'day' | 'week' | 'month')}
                      className={`text-xs font-medium px-3 py-1.5 ${
                        view === option.key
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-white dark:bg-gray-800 text-gray-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div> */}
              </div>
            </div>
            
            {/* Calendar View */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : error ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-red-500">{error}</div>
                    </div>
                  ) : (
                    <>
                      {view === 'day' && (
                        <div className="h-full overflow-auto">
                          {renderTimeSlots()}
                        </div>
                      )}
                      {/* {view === 'week' && (
                        <div className="h-full p-4">
                          <p className="text-center text-gray-500">Week view is not yet implemented</p>
                        </div>
                      )}
                      {view === 'month' && (
                        <div className="h-full">
                          <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            value={dayjs(selectedDate)}
                            onChange={(newValue) => {
                              if (newValue) {
                                handleDateChange(newValue.toDate());
                                setView('day');
                              }
                            }}
                            slots={{
                              day: (props) => {
                                const date = props.day.toDate();
                                const hasEvents = events.some(event => isSameDay(new Date(event.start), date));
                                
                                return (
                                  <div>
                                    <PickersDay {...props} />
                                    {hasEvents && (
                                      <div className="w-1 h-1 mx-auto mt-1 rounded-full bg-blue-500"></div>
                                    )}
                                  </div>
                                );
                              }
                            }}
                            slotProps={{
                              day: {
                                sx: {
                                  '&.MuiPickersDay-root.Mui-selected': {
                                    backgroundColor: '#3B82F6',
                                  },
                                  '&.MuiPickersDay-root.Mui-selected:hover': {
                                    backgroundColor: '#2563EB',
                                  },
                                  '&.MuiPickersDay-root.Mui-selected:focus': {
                                    backgroundColor: '#2563EB',
                                  },
                                  '&.MuiPickersDay-root': {
                                    fontSize: '0.875rem',
                                  },
                                  '&.MuiPickersDay-today': {
                                    border: '1px solid #3B82F6',
                                  },
                                }
                              }
                            }}
                            sx={{
                              ...muiDatePickerStyles,
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        </div>
                      )} */}
                    </>
                  )}
                </LocalizationProvider>
              </div>
              
              <div className="w-80 mini-calendar-container overflow-y-auto">
                <div className="p-6 space-y-6">
                  <MiniCalendar 
                    selectedDate={selectedDate}
                    onDateSelect={handleDateChange}
                  />
                  
                  <EventsList 
                    events={events}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        closeModal={() => setIsCreateModalOpen(false)}
        projects={projects}
        workers={workers}
        selectedDate={selectedDate}
        refreshEvents={handleRefreshEvents}
      />
    </DashboardLayout>
  );
} 