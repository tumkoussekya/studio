
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET all Kanban data
export async function GET(req: NextRequest) {
  const supabase = createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { data: columnsData, error: columnsError } = await supabase
      .from('kanban_columns')
      .select('*')
      .order('column_order', { ascending: true });
    
    if (columnsError) throw columnsError;

    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) throw tasksError;

    const tasks = tasksData.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as any);

    const columns = columnsData.reduce((acc, column) => {
      acc[column.id] = {
        ...column,
        taskIds: tasksData.filter(t => t.column_id === column.id).map(t => t.id)
      };
      return acc;
    }, {} as any);

    const columnOrder = columnsData.map(c => c.id);

    return NextResponse.json({ tasks, columns, columnOrder });

  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// POST a new task
export async function POST(req: NextRequest) {
  const supabase = createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { content, columnId } = await req.json();

    const { data, error } = await supabase
      .from('tasks')
      .insert({ content, column_id: columnId, assignee_id: user.id, due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// PUT (update) a task's position
export async function PUT(req: NextRequest) {
  const supabase = createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { taskId, newColumnId } = await req.json();

    const { error } = await supabase
      .from('tasks')
      .update({ column_id: newColumnId })
      .eq('id', taskId);

    if (error) throw error;
    return new NextResponse('Task updated successfully', { status: 200 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// DELETE a task
export async function DELETE(req: NextRequest) {
    const supabase = createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const url = new URL(req.url);
        const taskId = url.searchParams.get('taskId');
        if (!taskId) return new NextResponse('Task ID is required', { status: 400 });
        
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);
        
        if (error) throw error;

        return new NextResponse('Task deleted successfully', { status: 200 });
    } catch (error: any) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
