import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async (req, res, next) => {
  try {
    // Get token from header - support both x-auth-token and Authorization Bearer
    let token = req.header('x-auth-token');
    
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    // Check if no token
    if (!token) {
      console.warn('No token provided in request');
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    console.log('Token decoded:', decoded);
    
    if (!decoded.id) {
      console.error('Token does not contain user ID');
      return res.status(401).json({ msg: 'Invalid token format' });
    }
    
    // Add user from payload
    try {
      req.user = await User.findById(decoded.id).select('-password');
    } catch (dbErr) {
      console.error('Database error finding user:', dbErr);
      return res.status(500).json({ msg: 'Database error' });
    }
    
    console.log('User found from token:', req.user?._id, req.user?.username);
    
    if (!req.user) {
      console.error('User not found in database for ID:', decoded.id);
      return res.status(401).json({ msg: 'User not found' });
    }
    
    // Enforce admin-controlled inactive or blocked status: restricted students cannot perform any actions
    if (req.user.userType === 'student') {
      if (req.user.isInactive) {
        const reason = req.user.inactiveReason || 'No reason provided';
        console.warn(`Inactive student attempted access: ${req.user._id} - ${reason}`);
        return res.status(403).json({ msg: 'Account inactive', reason });
      }

      if (req.user.isBlocked) {
        const reason = req.user.blockedReason || 'No reason provided';
        console.warn(`Blocked student attempted access: ${req.user._id} - ${reason}`);
        return res.status(403).json({ msg: 'Account blocked', reason });
      }
    }
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Token is not valid' });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Admin access required' });
  }
};
