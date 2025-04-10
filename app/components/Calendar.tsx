'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as BigCalendar, dateFnsLocalizer, SlotInfo, EventProps } from 'react-big-calendar';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  workType: 'plumbing' | 'electrical' | 'carpentry' | 'general';
  workers: string[];
  project: string;
  location: string;
  description?: string;
}

interface CalendarProps {
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  onCreateEvent?: () => void;
}

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const workTypeColors = {
  plumbing: '#0EA5E9',
  electrical: '#F59E0B',
  carpentry: '#10B981',
  general: '#8B5CF6',
};

export default function Calendar({ onSelectSlot, onSelectEvent, onCreateEvent }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        const formattedEvents = data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(formattedEvents);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = workTypeColors[event.workType];
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  const CustomToolbar = (toolbar: any) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Today
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toolbar.onNavigate('PREV')}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              &lt;
            </button>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {toolbar.label}
            </span>
            <button
              onClick={() => toolbar.onNavigate('NEXT')}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              &gt;
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {onCreateEvent && (
            <button
              onClick={onCreateEvent}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Event
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  };

  return (
    <div className="h-full">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 200px)' }}
        onSelectEvent={(event) => onSelectEvent?.(event as CalendarEvent)}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar,
        }}
        popup
        views={['day']}
        defaultView="day"
      />
    </div>
  );
} 