require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");

const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const User = require("./models/User.js");
const Plan=require("./models/Plan.js");
const Progress=require("./models/Progress.js");
const Schedule=require("./models/Schedule.js");
const Community = require("./models/Community.js");
const path = require('path');
const cors = require('cors');
const MongoStore = require("connect-mongo");
const router = express.Router();
const Contact = require('./models/Contact.js');


const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'))
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

console.log("MONGOURI from .env:", process.env.MONGOURI);

// MongoDB connection
mongoose.connect(process.env.MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));





// Existing signup and login endpoints (unchanged)
app.post('/api/signup', async (req, res) => {
  const { email, password , username} = req.body;
  console.log('Signup request body:', req.body);

  if (!email || !password || !username)
    return res.status(400).json({ message: 'All fields are required.' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: 'User with this email already exists.' });

    const newUser = new User({
      email,
      password,
      username,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' , user: { email: newUser.email, username: newUser.username }});
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

app.post('/api/login', async (req, res) => {
  console.log('Login request body:', req.body);
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    console.log('User found:', user ? user.email : 'No user');
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.get("/api/plans", async (req, res) => {
  const plans = await Plan.find();
  res.json(plans);
});

// Add a new plan
app.post("/api/plans", async (req, res) => {
  const { day, workout } = req.body;
  const newPlan = new Plan({ day, workout });
  await newPlan.save();
  res.status(201).json(newPlan);
});

// Delete a plan
app.delete("/api/plans/:id", async (req, res) => {
  await Plan.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

//progress
app.post('/api/progress', async (req, res) => {
  const { userId, weeklyProgress, weekStart } = req.body;
  try {
    const progress = await Progress.findOneAndUpdate(
      { userId },
      { weeklyProgress, weekStart },
      { new: true, upsert: true }
    );
    res.status(200).json(progress);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

app.get('/api/progress', async (req, res) => {
  const { userId } = req.query;
  try {
    const progress = await Progress.findOne({ userId });
    if (!progress) {
      return res.status(200).json({ weeklyProgress: [false, false, false, false, false, false, false], weekStart: getWeekStart() });
    }
    res.status(200).json(progress);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load progress' });
  }
});


//guided-workout
app.get("/api/exercises", async (req, res) => {
  const search = req.query.search || "";
  const regex = new RegExp(search, "i");
  const exercises = await Exercise.find({ name: regex });
  res.json(exercises);
});


//schedule
app.post("/api/schedule", async (req, res) => {
  const { date, task, completed = false } = req.body;
  if (!date || !task) return res.status(400).json({ error: "Missing fields" });

  try {
    const existing = await Schedule.findOneAndUpdate(
      { date },
      { task, completed },
      { upsert: true, new: true }
    );
    res.json(existing);
  } catch (err) {
    console.error('Error in POST /api/schedule:', err);
    res.status(500).json({ error: "Failed to save task" });
  }
});

// GET: Fetch task by date OR all tasks in a month
app.get("/api/schedule", async (req, res) => {
  const { date, month } = req.query;

  try {
    if (date) {
      const entry = await Schedule.findOne({ date });
      return res.json(entry || {});
    }

    if (month) {
      // month should be like "2025-05"
      const regex = new RegExp(`^${month}`);
      const entries = await Schedule.find({ date: regex });
      return res.json(entries);
    }

    res.status(400).json({ error: "Missing date or month query" });
  } catch (err) {
    console.error('Error in GET /api/schedule:', err);
    res.status(500).json({ error: "Failed to fetch task(s)" });
  }
});

// DELETE: Delete a task by date
app.delete("/api/schedule", async (req, res) => {
  const { date } = req.body; // Changed from req.query to req.body
  if (!date) return res.status(400).json({ error: "Date required" });

  try {
    const result = await Schedule.deleteOne({ date });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /api/schedule:', err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// PATCH: Update completion status of a task
app.patch("/api/schedule/completed", async (req, res) => {
  const { date, completed } = req.body;
  if (!date || typeof completed !== "boolean") {
    return res.status(400).json({ error: "Date and completed status required" });
  }

  try {
    const updated = await Schedule.findOneAndUpdate(
      { date },
      { completed },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Task not found" });
    res.json(updated);
  } catch (err) {
    console.error('Error in PATCH /api/schedule/completed:', err);
    res.status(500).json({ error: "Failed to update task status" });
  }
});

// Serve HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "schedule-planner.html"));
});




// Get all posts
app.get('/api/community', async (req, res) => {
  try {
    const posts = await Community.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create new post
app.post('/api/community', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newPost = new Community({ name, email, message });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Delete a post by ID
app.delete('/api/community/:id', async (req, res) => {
  try {
    await Community.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
});

// Report a post by ID (mark reported = true)
app.post('/api/community/report/:id', async (req, res) => {
  try {
    await Community.findByIdAndUpdate(req.params.id, { reported: true });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Report failed' });
  }
});



//CONTACT-US



// POST: Contact form submission
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(201).json({ message: "Message received successfully." });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ error: "Failed to submit contact form." });
  }
});

// GET: Fetch all contact messages (admin use)
app.get("/api/contact", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve contacts." });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});