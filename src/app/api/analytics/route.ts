
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Helper function to check admin role
async function checkAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !userData) {
    throw new Error('Could not retrieve user role');
  }

  if (userData.role !== 'Admin') {
    throw new Error('Forbidden: Insufficient privileges');
  }
}

export async function GET() {
  const supabase = createClient();
  try {
    // Ensure the user is an admin before proceeding
    await checkAdmin();

    // 1. Get total users
    const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // 2. Get total tasks
    const { count: totalTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

    if (tasksError) throw tasksError;

    // 3. Get task status distribution
    const { data: taskStatusData, error: taskStatusError } = await supabase
        .from('tasks')
        .select('column_id');
        
    if (taskStatusError) throw taskStatusError;

    const { data: columnsData, error: columnsError } = await supabase
        .from('kanban_columns')
        .select('id, title');
    
    if (columnsError) throw columnsError;

    const columnTitleMap = new Map(columnsData.map(c => [c.id, c.title]));
    
    const statusCounts = taskStatusData.reduce((acc, task) => {
        const title = columnTitleMap.get(task.column_id) || 'Unknown';
        acc[title] = (acc[title] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const taskStatusDistribution = Object.entries(statusCounts).map(([name, count]) => ({ name, count }));

    // 4. Get recent tasks
    const { data: recentTasks, error: recentTasksError } = await supabase
        .from('tasks')
        .select('content, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (recentTasksError) throw recentTasksError;


    return NextResponse.json({
        totalUsers: totalUsers ?? 0,
        totalTasks: totalTasks ?? 0,
        taskStatusDistribution,
        recentTasks,
    });

  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
        return NextResponse.json({ message: error.message }, { status: 403 });
    }
     if (error.message.includes('Not authenticated')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
