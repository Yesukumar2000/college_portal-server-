import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Function to initialize the principal account if it doesn't exist
const initializePrincipal = async () => {
  const principalExists = await User.findOne({ email: 'principal123@gmail.com' });
  if (!principalExists) {
    const hashedPassword = await bcrypt.hash('principal123', 10);
    await User.create({
      name: 'Principal',
      email: 'principal123@gmail.com',
      password: hashedPassword,
      role: 'principal',
      username: 'principal123'
    });
    console.log('Principal account created');
  } else {
    console.log('Principal account already exists');
  }
};

initializePrincipal();

// Route for user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ email: user.email, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', user, token });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
});

// Route for creating a new student
router.post('/create-student', async (req, res) => {
  const { name, email, password, rollNo } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newStudent = new User({ name, email, password: hashedPassword, role: 'student', username: email, rollNo });

  try {
    await newStudent.save();
    res.status(201).json({ message: 'Student created successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error creating student', error: err.message });
  }
});

// Route for updating user password
router.post('/update-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(currentPassword, user.password))) {
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });
  } else {
    res.status(400).json({ message: 'Invalid current password' });
  }
});

// Route for fetching all students
router.get('/students', async (_req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
});

// Route for fetching a specific student by email
router.get('/student/:email', async (req, res) => {
  try {
    const student = await User.findOne({ email: req.params.email, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student', error: err.message });
  }
});

// Route for deleting a student by email
router.delete('/delete-student/:email', async (req, res) => {
  try {
    const student = await User.findOneAndDelete({ email: req.params.email, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student', error: err.message });
  }
});

// Route for updating student details by email
router.put('/update-student/:email', async (req, res) => {
  const { name, rollNo } = req.body;
  try {
    const student = await User.findOneAndUpdate(
      { email: req.params.email, role: 'student' },
      { name, rollNo },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student updated successfully', student });
  } catch (err) {
    res.status(500).json({ message: 'Error updating student', error: err.message });
  }
});

export default router;