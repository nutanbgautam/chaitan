import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = getDatabase();
    const task = db.getTaskById(id);
    
    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task belongs to user
    if (task.user_id !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

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
      source: task.source || 'manual',
      journalEntryId: task.journal_entry_id,
      createdAt: task.created_at
    };

    return NextResponse.json(transformedTask);

  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: taskId } = await params;
    const { action } = await request.json();
    
    if (action !== 'toggle') {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if task exists and belongs to user
    const tasks = db.getTasksByUserId(session.user.id, 1000, 0);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      );
    }

    // Toggle completion status
    const newIsCompleted = !task.is_completed;
    const completedDate = newIsCompleted ? new Date().toISOString() : undefined;
    
    // Update task completion status using direct SQL to avoid field name conversion issues
    const updateStmt = db.db.prepare(`
      UPDATE tasks 
      SET is_completed = ?, completed_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    updateStmt.run(newIsCompleted ? 1 : 0, completedDate, newIsCompleted ? 'completed' : 'pending', taskId);

    // Get updated task
    const updatedTask = db.getTaskById(taskId);

    // Transform database fields to camelCase for frontend
    const transformedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      startDate: updatedTask.start_date,
      deadline: updatedTask.deadline,
      category: updatedTask.category,
      assignee: updatedTask.assignee,
      remarks: updatedTask.remarks,
      isCompleted: updatedTask.is_completed === 1,
      completedDate: updatedTask.completed_date,
      source: updatedTask.source || 'manual',
      journalEntryId: updatedTask.journal_entry_id,
      createdAt: updatedTask.created_at
    };

    return NextResponse.json({
      message: `Task ${newIsCompleted ? 'completed' : 'marked as pending'}`,
      task: transformedTask
    });

  } catch (error) {
    console.error('Error toggling task completion:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: taskId } = await params;
    const db = getDatabase();
    
    // Check if task exists and belongs to user
    const tasks = db.getTasksByUserId(session.user.id, 1000, 0);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete task
    db.deleteTask(taskId);

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