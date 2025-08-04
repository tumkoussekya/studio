
'use client';

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2, Calendar, Flag, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Interfaces to match Supabase schema
interface Task {
  id: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High';
  due_date: string;
  assignee_id: string | null;
  // TODO: Add assignee details from a join
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

const addTaskSchema = z.object({
    content: z.string().min(3, { message: 'Task content must be at least 3 characters long.' }),
    priority: z.enum(['Low', 'Medium', 'High']),
});

type AddTaskFormValues = z.infer<typeof addTaskSchema>;


const priorityColors: Record<Task['priority'], string> = {
    Low: 'bg-blue-500 hover:bg-blue-600',
    Medium: 'bg-yellow-500 hover:bg-yellow-600',
    High: 'bg-red-500 hover:bg-red-600',
};

const KanbanSkeleton = () => (
    <div className="bg-background min-h-screen">
        <header className="p-4 border-b">
            <Skeleton className="h-8 w-1/3" />
        </header>
        <main className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="bg-secondary/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-8 w-8" />
                        </CardHeader>
                        <CardContent className="p-2 space-y-2">
                            {Array.from({ length: 2 }).map((_, j) => (
                                <div key={j} className="p-3 rounded-md bg-card border flex flex-col gap-3">
                                    <div className="flex items-start justify-between">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-5 w-5" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                            <Skeleton className="h-5 w-20" />
                                        </div>
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                    </div>
                                </div>
                            ))}
                             <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    </div>
);


export default function KanbanPage() {
  const [data, setData] = useState<KanbanData | null>(null);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      content: '',
      priority: 'Medium',
    },
  });


  const fetchKanbanData = useCallback(async () => {
    // Keep loader visible for a moment to prevent flashing
    if (!isLoading) setIsLoading(true);
    try {
        const response = await fetch('/api/kanban/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch Kanban data');
        }
        const fetchedData = await response.json();
        setData(fetchedData);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error loading board',
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  }, [toast, isLoading]);

  useEffect(() => {
    fetchKanbanData();
  }, [fetchKanbanData]);


  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (!data) return;

    // Optimistic UI update
    const startColumn = data.columns[source.droppableId];
    const endColumn = data.columns[destination.droppableId];
    
    let updatedData = { ...data };

    if (startColumn === endColumn) {
        const newTaskIds = Array.from(startColumn.taskIds);
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);

        const newColumn = { ...startColumn, taskIds: newTaskIds };
        updatedData.columns[newColumn.id] = newColumn;
    } else {
        const startTaskIds = Array.from(startColumn.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStartColumn = { ...startColumn, taskIds: startTaskIds };

        const endTaskIds = Array.from(endColumn.taskIds);
        endTaskIds.splice(destination.index, 0, draggableId);
        const newEndColumn = { ...endColumn, taskIds: endTaskIds };
        
        updatedData.columns[newStartColumn.id] = newStartColumn;
        updatedData.columns[newEndColumn.id] = newEndColumn;
    }
    setData(updatedData);

    // API call to update backend
    try {
        const response = await fetch('/api/kanban/tasks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: draggableId, newColumnId: destination.droppableId })
        });
        if (!response.ok) throw new Error('Failed to update task position.');
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update failed', description: error.message });
        // Revert UI on failure
        fetchKanbanData(); 
    }
  };

  const handleAddTask = async (values: AddTaskFormValues) => {
    if (!selectedColumn || !data) return;
    
    // Disable form while submitting
    form.formState.isSubmitting = true;

    try {
        const response = await fetch('/api/kanban/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: values.content, columnId: selectedColumn, priority: values.priority }),
        });
        
        const newTask = await response.json();
        if (!response.ok) throw new Error(newTask.message || 'Failed to add task.');
        
        // Optimistic UI update
        const updatedData = { ...data };
        updatedData.tasks[newTask.id] = newTask;
        updatedData.columns[selectedColumn].taskIds.push(newTask.id);
        setData(updatedData);

        toast({ title: 'Task Added', description: `"${values.content}" has been added.`});
        form.reset();
        setSelectedColumn('');
        setIsModalOpen(false);

    } catch (error: any) {
         toast({ variant: 'destructive', title: 'Failed to add task', description: error.message });
    } finally {
        form.formState.isSubmitting = false;
    }
  };
  
  const handleDeleteTask = async (taskId: string, columnId: string) => {
    // Optimistic UI update
    const originalData = data;
    if(data) {
        const newTasks = { ...data.tasks };
        delete newTasks[taskId];
        const column = data.columns[columnId];
        const newTaskIds = column.taskIds.filter(id => id !== taskId);
        const updatedData = { ...data, tasks: newTasks, columns: { ...data.columns, [columnId]: { ...column, taskIds: newTaskIds }}};
        setData(updatedData);
    }
    
    try {
         const response = await fetch(`/api/kanban/tasks?taskId=${taskId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete task.');
        toast({ title: "Task Deleted" });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to delete task', description: error.message });
        setData(originalData); // Revert on failure
    }
  };


  if (isLoading || !data) {
    return <KanbanSkeleton />;
  }
  
  const openModalForColumn = (columnId: string) => {
      setSelectedColumn(columnId);
      setIsModalOpen(true);
      form.reset();
  }

  return (
    <TooltipProvider>
      <div className="bg-background min-h-screen">
        <header className="p-4 border-b">
          <h1 className="text-2xl font-bold">Project Kanban Board</h1>
        </header>
        <main className="p-4 overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:min-w-[1024px]">
              {data.columnOrder.map((columnId) => {
                const column = data.columns[columnId];
                const tasks = column.taskIds.map((taskId) => data.tasks[taskId]).filter(Boolean);

                return (
                  <Card key={column.id} className="bg-secondary/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <h2 className="text-lg font-semibold">{column.title} ({tasks.length})</h2>
                       <Dialog open={isModalOpen && selectedColumn === column.id} onOpenChange={(isOpen) => { if (!isOpen) setSelectedColumn(''); setIsModalOpen(isOpen); }}>
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={() => openModalForColumn(column.id)}>
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Add task</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Task to "{column?.title}"</DialogTitle>
                            <DialogDescription>
                                Fill in the details for your new task below.
                            </DialogDescription>
                          </DialogHeader>
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(handleAddTask)} className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="content"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Task Content</FormLabel>
                                      <FormControl>
                                        <Textarea placeholder="e.g., Design the new dashboard layout" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="priority"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Priority</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a priority" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Low">Low</SelectItem>
                                          <SelectItem value="Medium">Medium</SelectItem>
                                          <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                 <DialogFooter>
                                    <DialogClose asChild>
                                      <Button type="button" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Add Task
                                    </Button>
                                  </DialogFooter>
                              </form>
                            </Form>
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
                                            {task.due_date && (
                                              <div className="flex items-center gap-1">
                                                  <Calendar className="h-4 w-4" />
                                                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                              </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Avatar className="h-6 w-6">
                                                        {/* In a real app, you'd fetch the user's avatar image */}
                                                        <AvatarImage src="" />
                                                        <AvatarFallback>{task.assignee_id ? 'A' : '?'}</AvatarFallback>
                                                    </Avatar>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Assigned to {task.assignee_id || 'Unassigned'}</p>
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
