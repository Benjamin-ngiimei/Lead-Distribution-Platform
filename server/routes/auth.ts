import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Agent from '../models/Agent';

const router = Router();

// @route   POST api/auth/register
// @desc    Register a new agent
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, mobile_number, password } = req.body;

  try {
    let agent = await Agent.findOne({ email });
    if (agent) {
      return res.status(400).json({ msg: 'Agent already exists' });
    }

    agent = new Agent({
      name,
      email,
      mobile_number,
      password_hash: password, // The pre-save hook will hash this
    });

    await agent.save();

    res.status(201).json({ msg: 'Agent registered successfully' });

  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate agent & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, agent.password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      agent: {
        id: agent.id,
      },
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in .env file');
    }

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
