
'use client';

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2, UserCircle, Calendar, Flag } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

interface InitialData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

const getInitialData = (): InitialData => ({
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
});

const priorityColors: Record<Task['priority'], string> = {
    Low: 'bg-blue-500 hover:bg-blue-600',
    Medium: 'bg-yellow-500 hover:bg-yellow-600',
    High: 'bg-red-500 hover:bg-red-600',
};

export default function KanbanPage() {
  const [data, setData] = useState<InitialData>(getInitialData);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const endColumn = data.columns[destination.droppableId];

    if (startColumn === endColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      });
      return;
    }

    // Moving from one list to another
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

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStartColumn.id]: newStartColumn,
        [newEndColumn.id]: newEndColumn,
      },
    });
  };

  const handleAddTask = () => {
    if (!newTaskContent.trim() || !selectedColumn) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
      id: newTaskId,
      content: newTaskContent,
      priority: 'Medium',
      dueDate: new Date().toISOString().split('T')[0],
      assignee: { name: 'Unassigned', avatar: '?' }
    };

    const column = data.columns[selectedColumn];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.push(newTaskId);

    const newColumn = {
      ...column,
      taskIds: newTaskIds,
    };

    setData({
      ...data,
      tasks: {
        ...data.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...data.columns,
        [newColumn.id]: newColumn,
      },
    });

    setNewTaskContent('');
    setSelectedColumn('');
    setIsModalOpen(false);
  };
  
   const handleDeleteTask = (taskId: string, columnId: string) => {
    const newTasks = { ...data.tasks };
    delete newTasks[taskId];

    const column = data.columns[columnId];
    const newTaskIds = column.taskIds.filter(id => id !== taskId);

    const newColumn = {
      ...column,
      taskIds: newTaskIds,
    };

    setData({
      ...data,
      tasks: newTasks,
      columns: {
        ...data.columns,
        [column.id]: newColumn,
      },
    });
  };

  return (
    <TooltipProvider>
      <div className="bg-background min-h-screen">
        <header className="p-4 border-b">
          <h1 className="text-2xl font-bold">Project Kanban Board</h1>
        </header>
        <main className="p-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.columnOrder.map((columnId) => {
                const column = data.columns[columnId];
                const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

                return (
                  <Card key={column.id} className="bg-secondary/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <h2 className="text-lg font-semibold">{column.title} ({tasks.length})</h2>
                       <Dialog open={isModalOpen && selectedColumn === column.id} onOpenChange={(isOpen) => {
                          if (!isOpen) {
                            setSelectedColumn('');
                          }
                          setIsModalOpen(isOpen);
                        }}>
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={() => { setSelectedColumn(column.id); setIsModalOpen(true);}}>
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Add task</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Task to {column.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Textarea
                              placeholder="Enter task description..."
                              value={newTaskContent}
                              onChange={(e) => setNewTaskContent(e.target.value)}
                              rows={4}
                            />
                             <div className="flex justify-end gap-2">
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleAddTask}>Add Task</Button>
                              </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-[400px] p-2 rounded-md transition-colors ${
                              snapshot.isDraggingOver ? 'bg-primary/10' : ''
                            }`}
                          >
                            {tasks.map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-3 mb-2 rounded-md bg-card text-card-foreground shadow-sm border flex flex-col gap-3 ${
                                      snapshot.isDragging ? 'shadow-lg' : ''
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                       <span className="flex-grow font-medium pr-2">{task.content}</span>
                                       <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`border-transparent text-white ${priorityColors[task.priority]}`}>
                                                <Flag className="h-3 w-3 mr-1" />
                                                {task.priority}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback>{task.assignee.avatar}</AvatarFallback>
                                                    </Avatar>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Assigned to {task.assignee.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id, column.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </DragDropContext>
        </main>
      </div>
    </TooltipProvider>
  );
}
