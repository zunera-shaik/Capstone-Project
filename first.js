const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// Replace with your actual Firebase service account key file
const serviceAccount = require('./key.json');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();
const token = '7769317892:AAGXotZKVWJLI6NYVPTuewZrVZgk5Ufekbo';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const a = msg.text;
  const NewMsg = a.split(' ');

  if (NewMsg[0] === 'marksEntry') {
    bot.sendMessage(chatId, 'Please Enter Marks(MPC)');
  } 
  else if (NewMsg[0] === 'insert') {
    if (!NewMsg[1] || !NewMsg[2]) {
      bot.sendMessage(chatId, 'Invalid format. Use: insert <subject> <marks>');
      return;
    }

    try {
      await db.collection('Marks').add({
        key: NewMsg[1],
        datavalue: NewMsg[2],
        UserId: msg.from.id
      });

      bot.sendMessage(chatId, `Marks for ${NewMsg[1]} stored successfully.`);


    } catch (error) {
      bot.sendMessage(chatId, 'Error storing marks. Please try again.');
      console.error(error);
    }
  } 
  else if (NewMsg[0] === 'get') {
    try {
      const snapshot = await db.collection('Marks').where('UserId', '==', msg.from.id).get();
      
      if (snapshot.empty) {
        bot.sendMessage(chatId, 'No marks found.');
        return;
      }

      let marksData = 'Your Marks:\n';
      snapshot.forEach((doc) => {
        const data = doc.data();
        marksData += `${data.key}: ${data.datavalue}\n`;

      });

      bot.sendMessage(chatId, marksData);
    } catch (error) {
      bot.sendMessage(chatId, 'Error retrieving marks. Please try again.');
      console.error(error);
    }
  } 
  else {
    bot.sendMessage(chatId, 'Please provide valid information.');
  }
});
