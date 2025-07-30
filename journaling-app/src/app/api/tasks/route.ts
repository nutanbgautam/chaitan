import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getDatabase();
    const tasks = db.getTasksByUserId(session.user.id, limit, offset);

    // Transform database fields to camelCase for frontend
    const transformedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      startDate: task.start_date,
      deadline: task.deadline,
      category: task.category,
      assignee: task.assignee,
      remarks: task.remarks,
      isCompleted: task.is_completed === 1,
      completedDate: task.completed_date,
      source: task.source || 'manual',
      journalEntryId: task.journal_entry_id,
      createdAt: task.created_at
    }));

    return NextResponse.json(transformedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, status, priority, startDate, deadline, category, assignee, remarks } = body;

    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const taskId = db.createTask({
      userId: session.user.id,
      title,
      description: description || null,
      status: status || 'pending',
      priority: priority || 'medium',
      startDate: startDate || null,
      deadline: deadline || null,
      category: category || null,
      assignee: assignee || null,
      remarks: remarks || null
    });

    const task = db.getTaskById(taskId);

    // Transform database fields to camelCase for frontend
    const transformedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      startDate: task.start_date,
      deadline: task.deadline,
      category: task.category,
      assignee: task.assignee,
      remarks: task.remarks,
      isCompleted: task.is_completed === 1,
      completedDate: task.completed_date,
      createdAt: task.created_at
    };

    return NextResponse.json(transformedTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { 
      id, 
      title, 
      description, 
      status, 
      priority, 
      startDate, 
      deadline, 
      category, 
      assignee, 
      remarks,
      isCompleted,
      completedDate
    } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'Task ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if task exists and belongs to user
    const tasks = db.getTasksByUserId(session.user.id, 1000, 0);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      );
    }

    // Update task
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (category !== undefined) updateData.category = category;
    if (assignee !== undefined) updateData.assignee = assignee;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (completedDate !== undefined) updateData.completedDate = completedDate;

    db.updateTask(id, updateData);

    return NextResponse.json({
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'Task ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const tasks = db.getTasksByUserId(session.user.id, 1000, 0);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      );
    }

    db.deleteTask(id);
    
    return NextResponse.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 