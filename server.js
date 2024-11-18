const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');

const bodyParser = require('body-parser');


app.use(cors())
app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.json());


mongoose.connect(process.env.URL, {
  useNewUrlParser: true,
  useUnifiedTopology:true
}).then(() => console.log("Connected to the database succesfully"))
  .catch(err => console.log("Failed to connect", err))


  
const User = mongoose.model('User', {
  username: { type: String, required: true }
});


const Exercise = mongoose.model("Exercise", {
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String, default: () => new Date().toDateString() },
});

app.post('/api/users', async (req, res) => {

  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({error:'username is required'})
    }
    const user = new User({ username: username.trim() })
  
    await user.save();

    res.json({ username: user.username, _id: user._id })
  

  } catch (err) {
    res.status(500).json({error:err.message})
  }

});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const userId = req.params._id;
    const { description, duration, date } = req.body;
    
    
    if (!description || !duration) {
      return res.status(400).json({ error: "Please provide description and duration" });
    }

   
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const exercise = new Exercise({
        username: user.username,
      description,
      duration: Number(duration), 
      date: date ? new Date(date).toDateString() : new Date().toDateString(),
      userId: user._id 
    });

    await exercise.save();

    res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/users/:id/logs', async (req, res) => {


  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(400).send('User not found');
  }

  const exercises = await Exercise.find({ username: user.username });

  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log: exercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date,
    })),
  });
});