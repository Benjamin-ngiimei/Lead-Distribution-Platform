import { Router } from 'express';
import auth from '../middleware/auth';
import Agent from '../models/Agent';

const router = Router();

// @route   GET api/agents
// @desc    Get all agents
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find().select('-password_hash').sort({ createdAt: -1 });
    res.json(agents);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/agents/:id
// @desc    Delete an agent
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({ msg: 'Agent not found' });
    }

    await Agent.deleteOne({ _id: req.params.id });

    res.json({ msg: 'Agent removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/agents/:id
// @desc    Update an agent
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, email, mobile_number, country_code } = req.body;

  // Build agent object
  const agentFields: any = {};
  if (name) agentFields.name = name;
  if (email) agentFields.email = email;
  if (mobile_number) agentFields.mobile_number = mobile_number;
  if (country_code) agentFields.country_code = country_code;

  try {
    let agent = await Agent.findById(req.params.id);

    if (!agent) return res.status(404).json({ msg: 'Agent not found' });

    agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { $set: agentFields },
      { new: true }
    );

    res.json(agent);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
