import { Router } from 'express';
import auth from '../middleware/auth';
import Lead from '../models/Lead';
import Agent from '../models/Agent'; // Import Agent model
import LeadAssignment from '../models/LeadAssignment'; // Import LeadAssignment model
import mongoose from 'mongoose';

const router = Router();

// @route   POST api/leads
// @desc    Create a new lead
// @access  Private
router.post('/', auth, async (req, res) => {
  const { first_name, phone, notes, upload_batch_id } = req.body;

  try {
    const newLead = new Lead({
      first_name,
      phone,
      notes,
      upload_batch_id,
    });

    const lead = await newLead.save();
    res.json(lead);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads
// @desc    Get all leads
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/leads/distribute
// @desc    Distribute leads to agents from JSON data
// @access  Private
router.post('/distribute', auth, async (req, res) => {
  const { leads } = req.body;

  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ msg: 'No leads provided' });
  }

  try {
    const uploadBatchId = new mongoose.Types.ObjectId().toString();
    
    const leadsToSave = leads.map((lead: any) => ({
      first_name: lead.firstName,
      phone: lead.phone,
      notes: lead.notes,
      upload_batch_id: uploadBatchId,
    }));

    const savedLeads = await Lead.insertMany(leadsToSave);

    const agents = await Agent.find({});
    if (agents.length === 0) {
      return res.status(400).json({ msg: 'No agents available for lead distribution.' });
    }

    const assignments = [];
    let agentIndex = 0;

    for (const lead of savedLeads) {
      const agent = agents[agentIndex];
      assignments.push({
        lead_id: lead._id,
        agent_id: agent._id,
      });
      agentIndex = (agentIndex + 1) % agents.length;
    }

    await LeadAssignment.insertMany(assignments);

    res.json({ message: `Successfully processed ${savedLeads.length} leads and assigned them to agents.` });
  } catch (err: any) {
    console.error('Error in lead distribution:', err);
    res.status(500).send(err.message);
  }
});

// @route   DELETE api/leads/:id
// @desc    Delete a lead
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    await Lead.deleteOne({ _id: req.params.id });

    // Also delete lead assignments
    await LeadAssignment.deleteMany({ lead_id: req.params.id });

    res.json({ msg: 'Lead removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
