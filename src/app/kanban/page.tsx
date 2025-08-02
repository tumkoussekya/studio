
'use client';

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2, Calendar, Flag } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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
import { kanbanStore, type KanbanData, type Task } from '@/lib/kanbanStore';


const priorityColors: Record<Task['priority'], string> = {
    Low: 'bg-blue-500 hover:bg-blue-600',
    Medium: 'bg-yellow-500 hover:bg-yellow-600',
    High: 'bg-red-500 hover:bg-red-600',
};

export default function KanbanPage() {
  const [data, setData] = useState<KanbanData | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Initial data load
    setData(kanbanStore.getData());

    // Subscribe to updates
    const unsubscribe = kanbanStore.subscribe(setData);
    return () => unsubscribe();
  }, []);

  const onDragEnd = (result: DropResult) => {
    kanbanStore.moveTask(result);
  };

  const handleAddTask = () => {
    if (!newTaskContent.trim() || !selectedColumn) return;
    kanbanStore.addTask(selectedColumn, newTaskContent);
    setNewTaskContent('');
    setSelectedColumn('');
    setIsModalOpen(false);
  };
  
  const handleDeleteTask = (taskId: string, columnId: string) => {
    kanbanStore.deleteTask(taskId, columnId);
  };

  if (!data) {
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Loading Kanban board...</p>
        </div>
    );
  }

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
                const tasks = column.taskIds.map((taskId) => data.tasks[taskId]).filter(Boolean);

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
