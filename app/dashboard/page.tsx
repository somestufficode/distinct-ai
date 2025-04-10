'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ArrowPathIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../components/DashboardLayout';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isLoading?: boolean;
  href?: string;
}

function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  isLoading = false,
  href,
}: StatCardProps & { href?: string }) {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">{icon}</div>
      </div>
      {isLoading ? (
        <div className="animate-pulse h-7 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
      ) : (
        <div className="flex items-end gap-2">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {trend && trendValue && (
            <p className={`text-sm flex items-center ${trendColor}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
      )}
      {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function QuickActionCard({ title, description, icon, href, color }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow transition-transform hover:translate-y-[-2px]"
    >
      <div className={`p-3 ${color} rounded-lg`}>{icon}</div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
}

interface UpcomingEventCardProps {
  title: string;
  date: string;
  time: string;
  project: string;
  workType: string;
  workers: number;
}

function UpcomingEventCard({ title, date, time, project, workType, workers }: UpcomingEventCardProps) {
  const workTypeColors = {
    plumbing: 'bg-sky-100 text-sky-800',
    electrical: 'bg-amber-100 text-amber-800',
    carpentry: 'bg-emerald-100 text-emerald-800',
    general: 'bg-violet-100 text-violet-800',
  };

  const workTypeColor = workTypeColors[workType as keyof typeof workTypeColors] || workTypeColors.general;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="font-medium text-gray-900 dark:text-white truncate">{title}</h3>
      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
        <CalendarDaysIcon className="h-4 w-4 mr-1" />
        <span>{date} · {time}</span>
      </div>
      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
        <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
        <span className="truncate">{project}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${workTypeColor}`}>
          {workType}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <UserGroupIcon className="h-3 w-3 mr-1" />
          {workers} worker{workers !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    workersAssigned: 0,
    totalBudget: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    // Simulating API call to fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch projects stats
        const projectsResponse = await fetch('/api/projects');
        if (!projectsResponse.ok) {
          throw new Error(`Failed to fetch projects: ${projectsResponse.statusText}`);
        }
        const projectsData = await projectsResponse.json();
        
        // Get current date and next 3 days
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(now.getDate() + 3);
        
        // Fetch events for the next 3 days
        const eventsResponse = await fetch(`/api/events?startDate=${now.toISOString()}&endDate=${threeDaysFromNow.toISOString()}`);
        if (!eventsResponse.ok) {
          throw new Error(`Failed to fetch events: ${eventsResponse.statusText}`);
        }
        const eventsData = await eventsResponse.json();
        
        // Fetch workers stats
        const workersResponse = await fetch('/api/workers');
        if (!workersResponse.ok) {
          throw new Error(`Failed to fetch workers: ${workersResponse.statusText}`);
        }
        const workersData = await workersResponse.json();
        
        // Check if the responses are successful
        if (projectsData && eventsData && workersData) {
          // Extract data from responses
          const projects = Array.isArray(projectsData) ? projectsData : (projectsData.data || []);
          const events = Array.isArray(eventsData) ? eventsData : (eventsData.data || []);
          const workers = Array.isArray(workersData) ? workersData : (workersData.data || []);
          
          // Calculate stats
          const activeProjects = projects.filter((p: any) => 
            p.status === 'planning' || p.status === 'in_progress' || p.status === 'almost_done'
          ).length;
          
          const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
          
          // Sort events by date and time
          const sortedEvents = events.sort((a: any, b: any) => 
            new Date(a.start).getTime() - new Date(b.start).getTime()
          );
          
          setStats({
            totalProjects: projects.length,
            activeProjects,
            totalEvents: events.length,
            upcomingEvents: sortedEvents.length,
            workersAssigned: workers.length,
            totalBudget,
          });
          
          setUpcomingEvents(sortedEvents);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const formatEventTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
            <p className="font-medium">Error loading dashboard data</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200"
            >
              Try again
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            description={`${stats.activeProjects} active projects`}
            icon={<ClipboardDocumentListIcon className="w-6 h-6 text-blue-500" />}
            href="/dashboard/projects"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            description="Next 3 days"
            icon={<CalendarDaysIcon className="w-6 h-6 text-blue-500" />}
            href="/dashboard/schedule"
          />
          <StatCard
            title="Workers Assigned"
            value={stats.workersAssigned}
            description="Available workers"
            icon={<UserGroupIcon className="w-6 h-6 text-blue-500" />}
          />
          <StatCard
            title="Total Budget"
            value={`$${stats.totalBudget.toLocaleString()}`}
            description="Across all projects"
            icon={<CurrencyDollarIcon className="w-6 h-6 text-blue-500" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard
            title="Create New Project"
            description="Start a new project and assign workers"
            icon={<PlusIcon className="w-6 h-6 text-white" />}
            href="/dashboard/projects/new"
            color="bg-blue-500"
          />
          <QuickActionCard
            title="Schedule Event"
            description="Add a new event to the calendar"
            icon={<CalendarDaysIcon className="w-6 h-6 text-white" />}
            href="/dashboard/schedule/new"
            color="bg-green-500"
          />
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Events</h2>
              <Link
                href="/dashboard/schedule"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
              >
                View all
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <UpcomingEventCard
                    key={event._id}
                    title={event.title}
                    date={formatEventDate(event.start)}
                    time={formatEventTime(event.start)}
                    project={event.project?.name || 'Unassigned'}
                    workType={event.workType}
                    workers={event.workers?.length || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No upcoming events in the next 3 days</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 