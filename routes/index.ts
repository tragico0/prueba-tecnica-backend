import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import v1Routes from './v1';

dotenv.config();

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.send('Welcome');
});

router.use('/v1', v1Routes);

module.exports = router;
