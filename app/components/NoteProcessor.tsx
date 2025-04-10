import { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

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

interface NoteProcessorProps {
  onAccept: (updates: ProcessedNote) => void;
  onReject: () => void;
  onEdit: (updates: ProcessedNote) => void;
}

export default function NoteProcessor({ onAccept, onReject, onEdit }: NoteProcessorProps) {
  const [note, setNote] = useState('');
  const [processedNote, setProcessedNote] = useState<ProcessedNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // Simulate AI processing of the note
  const processNote = (noteText: string) => {
    // Check if it's a work update note
    if (noteText.toLowerCase().includes('day work')) {
      const workUpdate: ProcessedNote = {
        type: 'work',
        rawText: noteText,
        content: {
          date: 'Monday', // In real implementation, we'd parse this from the note
          workers: [
            { name: 'vincent', duration: 'half-day', estimatedHours: 4 },
            { name: 'george', duration: 'full-day', estimatedHours: 8 },
            { name: 'michael', duration: 'half-day', estimatedHours: 4 },
          ],
        },
      };
      setProcessedNote(workUpdate);
    }
    // Check if it's a task update note
    else if (noteText.includes('$')) {
      const taskUpdate: ProcessedNote = {
        type: 'task',
        rawText: noteText,
        content: {
          location: 'Laundry room',
          tasks: [
            { description: 'retile floors', estimatedCost: 1000 },
            { description: 'add insulation' },
            { description: 'bolt screws' },
          ],
        },
      };
      setProcessedNote(taskUpdate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processNote(note);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Process Project Note
      </h2>

      {!processedNote ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter or paste your note
            </label>
            <textarea
              id="note"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., '(Monday) - vincent half-day work...' or 'Laundry room - $1000 retile floors...'"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Process Note
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              AI-Processed Update
            </h3>
            {isEditing ? (
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                rows={4}
                value={editedContent || JSON.stringify(processedNote.content, null, 2)}
                onChange={(e) => setEditedContent(e.target.value)}
              />
            ) : (
              <div className="space-y-2">
                {processedNote.type === 'work' && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Date: {(processedNote.content as WorkUpdate).date}
                    </p>
                    <div className="space-y-1">
                      {(processedNote.content as WorkUpdate).workers.map((worker, idx) => (
                        <p key={idx} className="text-sm text-gray-600 dark:text-gray-300">
                          {worker.name}: {worker.duration} ({worker.estimatedHours} hours)
                        </p>
                      ))}
                    </div>
                  </>
                )}
                {processedNote.type === 'task' && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Location: {(processedNote.content as TaskUpdate).location}
                    </p>
                    <div className="space-y-1">
                      {(processedNote.content as TaskUpdate).tasks.map((task, idx) => (
                        <p key={idx} className="text-sm text-gray-600 dark:text-gray-300">
                          • {task.description}
                          {task.estimatedCost && ` ($${task.estimatedCost})`}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => onAccept(processedNote)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Accept
            </button>
            <button
              onClick={() => {
                if (isEditing) {
                  try {
                    const editedNote = {
                      ...processedNote,
                      content: JSON.parse(editedContent),
                    };
                    onEdit(editedNote);
                  } catch (e) {
                    alert('Invalid JSON format');
                  }
                }
                setIsEditing(!isEditing);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              {isEditing ? 'Save Changes' : 'Edit'}
            </button>
            <button
              onClick={onReject}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <XCircleIcon className="h-5 w-5 mr-2" />
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 