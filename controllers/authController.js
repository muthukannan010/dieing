const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .limit(1);

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role || 'operator';

    const { error } = await supabase.from('users').insert({
      username,
      email,
      password: hashedPassword,
      role: assignedRole
    });

    if (error) throw error;

    res.status(201).json({ success: true, message: 'Registration successful! You can now log in.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please enter username and password.' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error) throw error;
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ success: true, message: 'Login successful!', role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address.' });
    }

    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'No user registered with this email.' });
    }

    // Propose mock reset link/success
    res.json({
      success: true,
      message: 'Password reset link sent to your email. (Simulated)'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  if (req.accepts('html')) {
    return res.redirect('/login');
  }
  res.json({ success: true, message: 'Logged out successfully.' });
};
