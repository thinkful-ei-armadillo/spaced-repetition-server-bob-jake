const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');
const parser = express.json()


const languageRouter = express.Router();

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      );

      if (!language)
        return res.status(404).json({
          error: 'You don\'t have any languages',
        });

      req.language = language;
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      );

      res.json({
        language: req.language,
        words,
      });
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .get('/head', async (req, res, next) => {
   
    try {
      const nextWord = await LanguageService.getHead(
        req.app.get('db'), 
        req.language.id);

      res.json({
        nextWord: nextWord.original,
        wordCorrectCount: nextWord.correct_count,
        wordIncorrectCount: nextWord.incorrect_count,
        totalScore: req.language.total_score
      });
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .post('/guess', parser, async (req, res, next) => {
    const guess = req.body.guess;
    if(!guess){
      res.status(400).json({
        error: `Missing 'guess' in request body` 
      });
    }
    try{
      

      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      );
      
      const head = await LanguageService.getHead(
        req.app.get('db'), 
        req.language.id
      );

      const list = await LanguageService.createList(
        req.app.get('db'), 
        req.language.id);
        
        console.log(list)

      const compare = await LanguageService.handleGuess(
        req.app.get('db'),
        req.language.id
      )


      if(compare.translation === guess){
        res.send('Congrats! You got it right');
      } else {
        res.send('Wrong!');
      }
      next();
    }
    catch(error){
      next(error);
    }
  });


// const wordList = new LinkedList();
// nextWord.map(word => wordList.insertLast(word));
// let currentNode = wordList.head;
// res.json({
//   nextWord: currentNode.value.original,
//   wordCorrectCount: currentNode.value.correct_count,
//   wordIncorrectCount: currentNode.value.incorrect_count,
//   totalScore: req.language.total_score

module.exports = languageRouter;
