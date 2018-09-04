'use strict';

// Import the Dialogflow module and response creation dependencies
// from the Actions on Google client library.
const {
  dialogflow,
  BasicCard,
  Permission,
} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Initialize to access Firebase cloud Storage.
admin.initializeApp();

// Create the Firestore client, which represents a Firestore Database and is the entry point for all Firestore operations.
const db = admin.firestore();
//Create a referene to 'parks' Collection
const collectionRef = db.collection('parks');

const pictureMap = {
'yellowstone': new BasicCard({
  title: 'Yellowstone National Park',
  image: {
    url: 'https://www.nationalgeographic.com/content/dam/travel/photos/000/894/89494.adapt.676.1.jpg',
    accessibilityText: 'Yellowstone National Park',
  },
  display: 'WHITE',
}),
'pink unicorn': new BasicCard({
  title: 'Pink Unicorn',
  image: {
    url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDbFVfTXpoaEE5Vzg/style-color-uiapplication-palette2.png',
    accessibilityText: 'Pink Unicorn Color',
  },
  display: 'WHITE',
}),
'blue grey coffee': new BasicCard({
  title: 'Blue Grey Coffee',
  image: {
    url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDZUdpeURtaTUwLUk/style-color-colorsystem-gray-secondary-161116.png',
    accessibilityText: 'Blue Grey Coffee Color',
  },
  display: 'WHITE',
}),
};

/**
* Original impl uses a Map
*/
// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
// app.intent('Park Name', (conv, {park}) => {
//   const parkKey = responses.parkMap.get(park);
//   if(!parkKey){
//     conv.close('Sorry, I do not know  about ' + park);
//   }else{
//     conv.user.storage.park = park;
//     conv.ask(responses.parkMap.get(park).keyFact +  `. I can also tell you its address, entry fees, phone or more facts. What can I help you with? `);
//   }
// });

// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
app.intent('Park Name', (conv, {park}) => {
  const term = park.toLowerCase();
  const termRef = collectionRef.doc(`${term}`);

  //Retrieve the data by calling the get() method
  //The get method returns a promise with the document snapshot data
  return termRef.get()
    .then((snapshot) => {
      conv.user.storage.park = term;
      const {keyFact} = snapshot.data();
      conv.ask(`${keyFact}. I can also tell you its address, entry fees, phone or more facts. What can I help you with?`);
      return null;
    }).catch((e) => {
      console.log('error:', e);
      conv.close('Sorry, I do not know  about ' + park);
    });
});


// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
app.intent('Know More', (conv, {about}) => {
  const term = about.toLowerCase();

  var response = '';
  const park = conv.user.storage.park;
  console.log(`++++inside Know More intnt, the park name is ${park}`);
  const parkRef = collectionRef.doc(`${park}`);

  //Retrieve the data by calling the get() method
  return parkRef.get()
    .then((snapshot) => {
      const {name, phone, fees, keyFact, address, facts} = snapshot.data();
      switch (term) {
        case 'address':
          response =  `The address for ${park} is, ${address}. Do you want to see a picture?`;
        break;

        case 'phone':
          response = `The phone number for ${park} is, ${phone}. Do you want to see a picture?`;
        break;

        case 'fees':
          response =  `Here's the entrance fees for ${park}. ${fees}. Do you want to see a picture?`;
        break;

        case 'facts':
          response = facts[Math.floor(Math.random() * 5)] + '. Do you want to see a picture?';
        break;

        default:
          response = `Sorry, I don't know about that`;
      }// swtich end
      conv.ask(response);
      return null;
    }).catch((e) => {
      console.log('error:', e);
      conv.close('Sorry, I do not know  about ' + park);
    });
});

// Handle the Dialogflow intent named 'Know More - yes'.
app.intent('Know More - yes', (conv) => {
  // Present user with the corresponding basic card and end the conversation.
  const park = conv.user.storage.park;
  conv.close(`Here's the picture`, pictureMap[park]);
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
