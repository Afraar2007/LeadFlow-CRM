import dotenv from 'dotenv';

dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Note from '../models/Note.js';
import connectDB from './connectDB.js';

const DEFAULT_ADMIN = {
  name: process.env.ADMIN_NAME || 'Admin User',
  email: (process.env.ADMIN_EMAIL || 'admin@leadflow.com').toLowerCase(),
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  role: 'Admin',
};

const SAMPLE_LEADS = [
  {
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1-555-0101',
    company: 'TechCorp Inc.',
    country: 'United States',
    leadSource: 'Website',
    message: 'Interested in enterprise plan with custom integrations.',
    status: 'New',
    priority: 'High',
  },
  {
    fullName: 'Michael Chen',
    email: 'michael.chen@innovate.io',
    phone: '+1-555-0102',
    company: 'Innovate.io',
    country: 'Canada',
    leadSource: 'LinkedIn',
    message: 'Looking for a CRM solution for their growing sales team.',
    status: 'Contacted',
    priority: 'High',
  },
  {
    fullName: 'Emily Rodriguez',
    email: 'emily.r@startupx.com',
    phone: '+1-555-0103',
    company: 'StartupX',
    country: 'United States',
    leadSource: 'Referral',
    message: 'Referred by a current customer. Needs demo for small team.',
    status: 'Qualified',
    priority: 'Medium',
  },
  {
    fullName: 'James Wilson',
    email: 'james.wilson@globaltech.com',
    phone: '+1-555-0104',
    company: 'GlobalTech Solutions',
    country: 'United Kingdom',
    leadSource: 'Email',
    message: 'Responded to outbound campaign about lead management.',
    status: 'Proposal Sent',
    priority: 'High',
  },
  {
    fullName: 'Aisha Patel',
    email: 'aisha.patel@dataflow.com',
    phone: '+1-555-0105',
    company: 'DataFlow Analytics',
    country: 'India',
    leadSource: 'Advertisement',
    message: 'Saw our ad on LinkedIn. Interested in analytics features.',
    status: 'Negotiation',
    priority: 'High',
  },
  {
    fullName: 'David Kim',
    email: 'david.kim@buildcore.com',
    phone: '+1-555-0106',
    company: 'BuildCore Construction',
    country: 'Australia',
    leadSource: 'Website',
    message: 'Signed up for free trial. Using it for construction project leads.',
    status: 'Won',
    priority: 'Medium',
  },
  {
    fullName: 'Lisa Thompson',
    email: 'lisa.t@marketwise.com',
    phone: '+1-555-0107',
    company: 'MarketWise Agency',
    country: 'United States',
    leadSource: 'Cold Call',
    message: 'Initial conversation went well. Follow-up scheduled.',
    status: 'Lost',
    priority: 'Low',
  },
  {
    fullName: 'Robert Garcia',
    email: 'robert.g@nexusventures.com',
    phone: '+1-555-0108',
    company: 'Nexus Ventures',
    country: 'Mexico',
    leadSource: 'LinkedIn',
    message: 'CEO interested in scaling their sales operations.',
    status: 'New',
    priority: 'Medium',
  },
  {
    fullName: 'Amanda Foster',
    email: 'amanda.f@greenleaf.org',
    phone: '+1-555-0109',
    company: 'GreenLeaf Nonprofit',
    country: 'United States',
    leadSource: 'Referral',
    message: 'Nonprofit organization looking for discounted pricing.',
    status: 'Contacted',
    priority: 'Low',
  },
  {
    fullName: 'Thomas Anderson',
    email: 'thomas.a@quantumtech.com',
    phone: '+1-555-0110',
    company: 'Quantum Technologies',
    country: 'Germany',
    leadSource: 'Website',
    message: 'Requested demo for their 50-person sales team.',
    status: 'Qualified',
    priority: 'High',
  },
];

const SAMPLE_NOTES = [
  {
    text: 'Initial call completed. Client expressed strong interest in the analytics dashboard.',
  },
  {
    text: 'Sent product brochure and pricing information via email.',
  },
  {
    text: 'Follow-up meeting scheduled for next week to discuss custom requirements.',
  },
  {
    text: 'Client requested additional information about API integration capabilities.',
  },
  {
    text: 'Demo completed successfully. Client was impressed with the UI and reporting features.',
  },
];

const seedDatabase = async () => {
  try {
    const conn = await connectDB();
    console.log('\n📦 Connected to MongoDB:', conn.connection.host);

    // --- Seed Admin User ---
    let admin;
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });

    if (existingAdmin) {
      admin = existingAdmin;
      console.log(`\x1b[33m%s\x1b[0m`, `⚠ Admin already exists: ${admin.email}`);
    } else {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, salt);

      admin = await User.create({
        ...DEFAULT_ADMIN,
        password: hashedPassword,
      });
      admin.password = undefined;

      console.log(`\x1b[32m%s\x1b[0m`, `✓ Admin created: ${admin.email}`);
    }

    // --- Seed Sample Leads ---
    const existingLeads = await Lead.countDocuments();
    if (existingLeads > 0) {
      console.log(`\x1b[33m%s\x1b[0m`, `⚠ ${existingLeads} leads already exist. Skipping lead seed.`);
    } else {
      const leadPromises = SAMPLE_LEADS.map((leadData, index) => {
        return Lead.create({
          ...leadData,
          createdBy: admin._id,
          assignedTo: admin._id,
        }).then(async (lead) => {
          // Add a sample note to some leads
          if (index < SAMPLE_NOTES.length) {
            await Note.create({
              lead: lead._id,
              author: admin._id,
              text: SAMPLE_NOTES[index].text,
            });

            lead.notesCount = 1;
            await lead.save();
          }
          return lead;
        });
      });

      const leads = await Promise.all(leadPromises);
      console.log(`\x1b[32m%s\x1b[0m`, `✓ ${leads.length} sample leads created with notes`);
    }

    // --- Summary ---
    const totalLeads = await Lead.countDocuments();
    const totalNotes = await Note.countDocuments();
    const statusCounts = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    console.log('\n═════════════════════════════════');
    console.log('        DATABASE SEED SUMMARY');
    console.log('═════════════════════════════════');
    console.log(`   ${'Admin:'.padEnd(20)} ${admin.name} (${admin.email})`);
    console.log(`   ${'Total Leads:'.padEnd(20)} ${totalLeads}`);
    console.log(`   ${'Total Notes:'.padEnd(20)} ${totalNotes}`);
    console.log('─────────────────────────────────');
    console.log('   Lead Status Breakdown:');
    statusCounts.forEach(({ _id, count }) => {
      console.log(`     ${_id.padEnd(20)} ${count}`);
    });
    console.log('═════════════════════════════════\n');
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `\n✗ Seed failed: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.\n');
    process.exit(0);
  }
};

seedDatabase();