const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const crypto = require('crypto');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizationMiddleware');

dotenv.config();