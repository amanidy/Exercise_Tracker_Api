const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();

const router = express.Router();

const app = express();

mongoose.connect(process.env.URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to the database'))
  .catch(err => console.log('Error connecting to the database:', err));


app.use(bodyParser.urlencoded({ extended: false }));

const User = mongoose.model('User', {
    username: { type: String, required: true },
});

const Exercise = mongoose.model('Exercise', {
    username: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: String, default: () => new Date().toDateString() },
    
    
})

router.post('/users', async (req, res) => {
    const { username } = req.body;
    const user = new User({ username });

    await user.save();
    res.json({ username: user.username, _id:user._id });
});


router.post('/exercises', async (req, res) => {
    const { username, description, duration, date } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).send('User not found');
    }

    const exercise = new Exercise({
        username,
        description,
        duration,
        date: date ? new Date(date).toDateString() : new Date().toDateString(),
    })

    await exercise.save();

    res.json({
        username: exercise.username,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date,
        _id: user._id,
    });
});


router.get('/users/:id/logs', async (req, res) => {
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

module.exports = router;
