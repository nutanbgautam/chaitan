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
    const entries = db.getFinanceEntriesByUserId(session.user.id, limit, offset);

    // Transform database fields to camelCase for frontend
    const transformedEntries = entries.map(entry => ({
      id: entry.id,
      amount: entry.amount,
      currency: entry.currency,
      category: entry.category,
      subcategory: entry.subcategory,
      description: entry.description,
      date: entry.date,
      recurring: entry.recurring === 1,
      recurringPattern: entry.recurring_pattern,
      priority: entry.priority,
      tags: entry.tags ? JSON.parse(entry.tags) : [],
      notes: entry.notes,
      source: entry.source || 'manual',
      journalEntryId: entry.journal_entry_id,
      createdAt: entry.created_at
    }));

    return NextResponse.json(transformedEntries);
  } catch (error) {
    console.error('Error fetching finance entries:', error);
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
    const { amount, currency, category, subcategory, description, date, recurring, recurringPattern, priority, tags, notes } = body;

    if (!amount || !currency || !category || !description || !date) {
      return NextResponse.json(
        { message: 'Amount, currency, category, description, and date are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const entryId = db.createFinanceEntry({
      userId: session.user.id,
      amount: parseFloat(amount),
      currency,
      category,
      subcategory: subcategory || null,
      description,
      date,
      recurring: recurring || false,
      recurringPattern: recurringPattern || null,
      priority: priority || 'medium',
      tags: tags || null,
      notes: notes || null
    });

    const entry = db.getFinanceEntryById(entryId);

    // Transform database fields to camelCase for frontend
    const transformedEntry = {
      id: entry.id,
      amount: entry.amount,
      currency: entry.currency,
      category: entry.category,
      subcategory: entry.subcategory,
      description: entry.description,
      date: entry.date,
      recurring: entry.recurring === 1,
      recurringPattern: entry.recurring_pattern,
      priority: entry.priority,
      tags: entry.tags ? JSON.parse(entry.tags) : [],
      notes: entry.notes,
      createdAt: entry.created_at
    };

    return NextResponse.json(transformedEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating finance entry:', error);
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
      amount, 
      currency, 
      category, 
      subcategory, 
      description, 
      date, 
      recurring, 
      recurringPattern, 
      priority, 
      tags, 
      notes 
    } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if entry exists and belongs to user
    const entries = db.getFinanceEntriesByUserId(session.user.id, 1000, 0);
    const entry = entries.find(e => e.id === id);
    
    if (!entry) {
      return NextResponse.json(
        { message: 'Finance entry not found' },
        { status: 404 }
      );
    }

    // Update entry
    const updateData: any = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (currency) updateData.currency = currency;
    if (category) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (description) updateData.description = description;
    if (date) updateData.date = date;
    if (recurring !== undefined) updateData.recurring = recurring;
    if (recurringPattern !== undefined) updateData.recurringPattern = recurringPattern;
    if (priority) updateData.priority = priority;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (notes !== undefined) updateData.notes = notes;

    db.updateFinanceEntry(id, updateData);

    return NextResponse.json({
      message: 'Finance entry updated successfully'
    });

  } catch (error) {
    console.error('Error updating finance entry:', error);
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
        { message: 'Finance entry ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const entries = db.getFinanceEntriesByUserId(session.user.id, 1000, 0);
    const entry = entries.find(e => e.id === id);
    
    if (!entry) {
      return NextResponse.json(
        { message: 'Finance entry not found' },
        { status: 404 }
      );
    }

    db.deleteFinanceEntry(id);
    
    return NextResponse.json({
      message: 'Finance entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting finance entry:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 