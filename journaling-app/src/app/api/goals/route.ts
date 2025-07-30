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
    const status = searchParams.get('status');
    const lifeArea = searchParams.get('lifeArea');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getDatabase();
    let goals = db.getGoalsByUserId(session.user.id, limit, offset);

    // Transform snake_case to camelCase
    const transformedGoals = goals.map((goal: any) => ({
      id: goal.id,
      userId: goal.user_id,
      title: goal.title,
      description: goal.description,
      targetDate: goal.target_date,
      lifeAreaId: goal.life_area_id,
      priority: goal.priority,
      category: goal.category,
      status: goal.status,
      progress: goal.progress,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    }));

    // Apply filters
    if (status && status !== 'all') {
      goals = transformedGoals.filter(goal => goal.status === status);
    } else {
      goals = transformedGoals;
    }

    if (lifeArea && lifeArea !== 'all') {
      goals = goals.filter(goal => goal.lifeAreaId === lifeArea);
    }

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
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

    const {
      title,
      description,
      targetDate,
      lifeAreaId,
      priority,
      category
    } = await request.json();

    if (!title || !targetDate || !lifeAreaId) {
      return NextResponse.json(
        { message: 'Title, target date, and life area are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const goalId = db.createGoal({
      userId: session.user.id,
      title,
      description: description || '',
      targetDate,
      lifeAreaId,
      priority: priority || 'medium',
      category: category || '',
      status: 'pending',
      progress: 0
    });

    return NextResponse.json({
      message: 'Goal created successfully',
      id: goalId
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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
      targetDate,
      lifeAreaId,
      priority,
      category,
      status,
      progress
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'Goal ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if goal exists and belongs to user
    const goals = db.getGoalsByUserId(session.user.id, 1000, 0);
    const goal = goals.find(g => g.id === id);
    
    if (!goal) {
      return NextResponse.json(
        { message: 'Goal not found' },
        { status: 404 }
      );
    }

    // Update goal with transformed field names
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (targetDate !== undefined) updateData.targetDate = targetDate;
    if (lifeAreaId !== undefined) updateData.lifeAreaId = lifeAreaId;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;

    db.updateGoal(id, updateData);

    return NextResponse.json({
      message: 'Goal updated successfully'
    });
  } catch (error) {
    console.error('Error updating goal:', error);
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
        { message: 'Goal ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const goals = db.getGoalsByUserId(session.user.id, 1000, 0);
    const goal = goals.find(g => g.id === id);
    
    if (!goal) {
      return NextResponse.json(
        { message: 'Goal not found' },
        { status: 404 }
      );
    }

    db.deleteGoal(id);
    
    return NextResponse.json({
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 