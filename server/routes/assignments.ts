import { Router } from 'express';
import auth from '../middleware/auth';
import LeadAssignment from '../models/LeadAssignment';

const router = Router();

// @route   POST api/assignments
// @desc    Assign a lead to an agent
// @access  Private
router.post('/', auth, async (req, res) => {
  const { lead_id, agent_id } = req.body;

  try {
    // Check if the lead is already assigned
    const existingAssignment = await LeadAssignment.findOne({ lead_id });
    if (existingAssignment) {
      return res.status(400).json({ msg: 'This lead is already assigned.' });
    }

    const newAssignment = new LeadAssignment({
      lead_id,
      agent_id,
    });

    const assignment = await newAssignment.save();
    res.json(assignment);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/assignments
// @desc    Get all lead assignments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const assignments = await LeadAssignment.find()
      .populate('lead_id', ['first_name', 'phone', 'notes'])
      .populate('agent_id', ['name', 'email'])
      .sort({ assigned_at: -1 });
    res.json(assignments);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
