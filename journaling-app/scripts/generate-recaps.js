#!/usr/bin/env node

/**
 * Automatic Recap Generation Script
 * 
 * This script can be run as a cron job to automatically generate
 * weekly and monthly recaps for all users.
 * 
 * Usage:
 * - Weekly: node scripts/generate-recaps.js weekly
 * - Monthly: node scripts/generate-recaps.js monthly
 * - Both: node scripts/generate-recaps.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const API_ENDPOINT = '/api/recaps/generate';

// Get command line arguments
const args = process.argv.slice(2);
const recapType = args[0]; // 'weekly', 'monthly', or undefined for both

async function generateRecapForUser(userId, type) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_ENDPOINT, BASE_URL);
    
    const postData = JSON.stringify({
      userId: userId,
      type: type
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 3001),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Generated ${type} recap for user ${userId}`);
          resolve(JSON.parse(data));
        } else {
          console.error(`❌ Failed to generate ${type} recap for user ${userId}: ${res.statusCode} - ${data}`);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error generating ${type} recap for user ${userId}:`, error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function getAllUsers() {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/users', BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 3001),
      path: url.pathname,
      method: 'GET'
    };

    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const users = JSON.parse(data);
            resolve(users);
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        } else {
          console.error(`❌ Failed to get users: ${res.statusCode} - ${data}`);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error getting users:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function generateRecaps() {
  try {
    console.log('🚀 Starting automatic recap generation...');
    console.log(`📍 Base URL: ${BASE_URL}`);
    
    // Get all users
    console.log('📋 Fetching users...');
    const users = await getAllUsers();
    console.log(`👥 Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('ℹ️  No users found. Exiting.');
      return;
    }
    
    // Determine which recap types to generate
    const types = [];
    if (!recapType || recapType === 'weekly') {
      types.push('weekly');
    }
    if (!recapType || recapType === 'monthly') {
      types.push('monthly');
    }
    
    console.log(`📅 Generating recaps for types: ${types.join(', ')}`);
    
    // Generate recaps for each user and type
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const user of users) {
      for (const type of types) {
        try {
          await generateRecapForUser(user.id, type);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            userId: user.id,
            type: type,
            error: error.message
          });
        }
      }
    }
    
    // Summary
    console.log('\n📊 Recap Generation Summary:');
    console.log(`✅ Successful: ${results.success}`);
    console.log(`❌ Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(error => {
        console.log(`  - User ${error.userId} (${error.type}): ${error.error}`);
      });
    }
    
    console.log('\n🎉 Recap generation completed!');
    
  } catch (error) {
    console.error('💥 Fatal error during recap generation:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Automatic Recap Generation Script

Usage:
  node scripts/generate-recaps.js [type]

Arguments:
  type    Type of recap to generate (weekly, monthly, or omit for both)

Examples:
  node scripts/generate-recaps.js weekly    # Generate weekly recaps only
  node scripts/generate-recaps.js monthly   # Generate monthly recaps only
  node scripts/generate-recaps.js           # Generate both weekly and monthly recaps

Environment Variables:
  NEXT_PUBLIC_APP_URL    Base URL of the application (default: http://localhost:3001)

Cron Job Examples:
  # Generate weekly recaps every Sunday at 9 AM
  0 9 * * 0 cd /path/to/journaling-app && node scripts/generate-recaps.js weekly
  
  # Generate monthly recaps on the 1st of each month at 9 AM
  0 9 1 * * cd /path/to/journaling-app && node scripts/generate-recaps.js monthly
  
  # Generate both weekly and monthly recaps
  0 9 * * 0 cd /path/to/journaling-app && node scripts/generate-recaps.js
  `);
  process.exit(0);
}

// Validate recap type
if (recapType && !['weekly', 'monthly'].includes(recapType)) {
  console.error('❌ Invalid recap type. Must be "weekly" or "monthly".');
  console.error('Use --help for usage information.');
  process.exit(1);
}

// Run the script
generateRecaps(); 