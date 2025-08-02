
'use server';

/**
 * @fileOverview Genkit tools for interacting with the Kanban board.
 *
 * - addTask - A tool that allows the AI to add a new task to a specified column on the Kanban board.
 * - getTasks - A tool that allows the AI to retrieve all tasks from the Kanban board.
 */

import {ai} from '@/ai/genkit';
import {kanbanStore} from '@/lib/kanbanStore';
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
      kanbanStore.addTask(input.columnId, input.content, input.priority);
      return {
        success: true,
        message: `Successfully added the task "${input.content}" to the board.`,
      };
    } catch (error: any) {
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
            const data = kanbanStore.getData();
            // We only need to return the tasks, not the full board structure
            return {
                tasks: Object.values(data.tasks),
                columns: data.columns,
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get tasks: ${error.message}`,
            };
        }
    }
);
