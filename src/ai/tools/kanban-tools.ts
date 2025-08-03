
'use server';

/**
 * @fileOverview Genkit tools for interacting with the Kanban board.
 *
 * - addTask - A tool that allows the AI to add a new task to a specified column on the Kanban board.
 * - getTasks - A tool that allows the AI to retrieve all tasks from the Kanban board.
 */

import {ai} from '@/ai/genkit';
import { createClient } from '@/lib/supabase/server';
import {z} from 'zod';

export const addTask = ai.defineTool(
  {
    name: 'addTask',
    description: 'Adds a new task to the user\'s Kanban board.',
    inputSchema: z.object({
      columnId: z
        .enum(['column-1', 'column-2', 'column-3'])
        .describe('The ID of the column to add the task to. "column-1" is "To Do", "column-2" is "In Progress", and "column-3" is "Done".'),
      content: z.string().describe('The content or description of the task.'),
      priority: z.enum(['Low', 'Medium', 'High']).optional().describe('The priority of the task.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    try {
      const supabase = createClient();
       // In a real multi-tenant app, we would get the user ID here.
       // For now, we are adding it to the default user's board.
       const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('tasks')
        .insert({ 
          content: input.content, 
          column_id: input.columnId, 
          priority: input.priority || 'Medium',
          assignee_id: user?.id,
        });

      if (error) throw error;
      
      return {
        success: true,
        message: `Successfully added the task "${input.content}" to the board.`,
      };
    } catch (error: any) {
      console.error("Failed to add task via AI tool:", error);
      return {
        success: false,
        message: `Failed to add task: ${error.message}`,
      };
    }
  }
);

export const getTasks = ai.defineTool(
    {
        name: 'getTasks',
        description: 'Retrieves all tasks from all columns on the Kanban board.',
        inputSchema: z.object({}),
        outputSchema: z.any(),
    },
    async () => {
        try {
            const supabase = createClient();
            const { data: columnsData, error: columnsError } = await supabase
              .from('kanban_columns')
              .select('*')
              .order('column_order', { ascending: true });
            
            if (columnsError) throw columnsError;
        
            const { data: tasksData, error: tasksError } = await supabase
              .from('tasks')
              .select('*');
        
            if (tasksError) throw tasksError;

            // The AI needs a simple list of tasks and columns to reason about.
            // We can simplify the data structure we return to it.
            const columns = columnsData.map(c => ({ id: c.id, title: c.title }));
            const tasks = tasksData.map(t => ({ id: t.id, content: t.content, columnId: t.column_id, priority: t.priority }));

            return {
                tasks: tasks,
                columns: columns,
            };
        } catch (error: any) {
            console.error("Failed to get tasks via AI tool:", error);
            return {
                success: false,
                message: `Failed to get tasks: ${error.message}`,
            };
        }
    }
);
