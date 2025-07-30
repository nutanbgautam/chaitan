import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const db = getDatabase();

    // Check if entry exists and belongs to user
    const existingEntry = db.getFinanceEntryById(id);
    if (!existingEntry || existingEntry.user_id !== session.user.id) {
      return NextResponse.json(
        { message: 'Finance entry not found' },
        { status: 404 }
      );
    }

    // Update entry
    db.updateFinanceEntry(id, body);

    // Get updated entry
    const updatedEntry = db.getFinanceEntryById(id);

    // Transform database fields to camelCase for frontend
    const transformedEntry = {
      id: updatedEntry.id,
      amount: updatedEntry.amount,
      currency: updatedEntry.currency,
      category: updatedEntry.category,
      subcategory: updatedEntry.subcategory,
      description: updatedEntry.description,
      date: updatedEntry.date,
      recurring: updatedEntry.recurring === 1,
      recurringPattern: updatedEntry.recurring_pattern,
      priority: updatedEntry.priority,
      tags: updatedEntry.tags,
      notes: updatedEntry.notes,
      createdAt: updatedEntry.created_at
    };

    return NextResponse.json(transformedEntry);
  } catch (error) {
    console.error('Error updating finance entry:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDatabase();

    // Check if entry exists and belongs to user
    const existingEntry = db.getFinanceEntryById(id);
    if (!existingEntry || existingEntry.user_id !== session.user.id) {
      return NextResponse.json(
        { message: 'Finance entry not found' },
        { status: 404 }
      );
    }

    // Delete entry
    db.deleteFinanceEntry(id);

    return NextResponse.json({ message: 'Finance entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting finance entry:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 