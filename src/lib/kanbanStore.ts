
'use server';

// NOTE: This is a simple in-memory store for demonstration purposes.
// In a real application, you would use a database.

interface Task {
  id: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  assignee: {
    name: string;
    avatar: string;
  };
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface KanbanData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

const initialData: KanbanData = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Configure Next.js application', priority: 'High', dueDate: '2024-08-15', assignee: { name: 'Alice', avatar: 'A' } },
    'task-2': { id: 'task-2', content: 'Set up Tailwind CSS for styling', priority: 'Medium', dueDate: '2024-08-16', assignee: { name: 'Bob', avatar: 'B' } },
    'task-3': { id: 'task-3', content: 'Build the main layout component', priority: 'Low', dueDate: '2024-08-20', assignee: { name: 'Charlie', avatar: 'C' } },
    'task-4': { id: 'task-4', content: 'Implement user authentication', priority: 'High', dueDate: '2024-08-22', assignee: { name: 'Alice', avatar: 'A' } },
    'task-5': { id: 'task-5', content: 'Develop the chat feature with Ably', priority: 'Medium', dueDate: '2024-08-25', assignee: { name: 'David', avatar: 'D' } },
    'task-6': { id: 'task-6', content: 'Integrate Phaser for the 2D world', priority: 'High', dueDate: '2024-08-18', assignee: { name: 'Bob', avatar: 'B' } },
    'task-7': { id: 'task-7', content: 'Deploy the application to production', priority: 'High', dueDate: '2024-08-30', assignee: { name: 'Alice', avatar: 'A' } },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: ['task-5'],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: ['task-6', 'task-7'],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};


class KanbanStore {
    private data: KanbanData;
    private subscribers: ((data: KanbanData) => void)[] = [];

    constructor() {
        this.data = JSON.parse(JSON.stringify(initialData)); // Deep copy
    }

    subscribe(callback: (data: KanbanData) => void) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    private notify() {
        this.subscribers.forEach(callback => callback(this.data));
    }

    getData(): KanbanData {
        return this.data;
    }
    
    setData(newData: KanbanData) {
        this.data = newData;
        this.notify();
    }

    addTask(columnId: string, content: string) {
        const newTaskId = `task-${Date.now()}`;
        const newTask: Task = {
            id: newTaskId,
            content,
            priority: 'Medium',
            dueDate: new Date().toISOString().split('T')[0],
            assignee: { name: 'Unassigned', avatar: '?' }
        };

        const column = this.data.columns[columnId];
        const newTaskIds = Array.from(column.taskIds);
        newTaskIds.push(newTaskId);

        this.data = {
            ...this.data,
            tasks: {
                ...this.data.tasks,
                [newTaskId]: newTask,
            },
            columns: {
                ...this.data.columns,
                [columnId]: {
                    ...column,
                    taskIds: newTaskIds,
                },
            },
        };
        this.notify();
    }
    
     deleteTask(taskId: string, columnId: string) {
        const newTasks = { ...this.data.tasks };
        delete newTasks[taskId];

        const column = this.data.columns[columnId];
        const newTaskIds = column.taskIds.filter(id => id !== taskId);

        this.data = {
          ...this.data,
          tasks: newTasks,
          columns: {
            ...this.data.columns,
            [column.id]: {
                ...column,
                taskIds: newTaskIds,
            },
          },
        };
        this.notify();
    }

    moveTask(result: { destination: any; source: any; draggableId: string }) {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startColumn = this.data.columns[source.droppableId];
        const endColumn = this.data.columns[destination.droppableId];

        if (startColumn === endColumn) {
            const newTaskIds = Array.from(startColumn.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...startColumn,
                taskIds: newTaskIds,
            };

            this.data = {
                ...this.data,
                columns: {
                    ...this.data.columns,
                    [newColumn.id]: newColumn,
                },
            };
        } else {
            const startTaskIds = Array.from(startColumn.taskIds);
            startTaskIds.splice(source.index, 1);
            const newStartColumn = {
                ...startColumn,
                taskIds: startTaskIds,
            };

            const endTaskIds = Array.from(endColumn.taskIds);
            endTaskIds.splice(destination.index, 0, draggableId);
            const newEndColumn = {
                ...endColumn,
                taskIds: endTaskIds,
            };
            
            this.data = {
                ...this.data,
                columns: {
                    ...this.data.columns,
                    [newStartColumn.id]: newStartColumn,
                    [newEndColumn.id]: newEndColumn,
                },
            };
        }
        this.notify();
    }
}

export const kanbanStore = new KanbanStore();
export type { KanbanData, Task, Column };
