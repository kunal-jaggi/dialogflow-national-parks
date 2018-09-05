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
'smokies': new BasicCard({
  title: 'Great Smoky Mountains National Park',
  image: {
    url: 'https://www.nationalgeographic.com/content/dam/travel/photos/000/894/89492.adapt.676.1.jpg',
    accessibilityText: 'Great Smoky Mountains National Park',
  },
  display: 'WHITE',
}),
'canyon': new BasicCard({
  title: 'Grand Canyon National Park',
  image: {
    url: 'https://www.nationalgeographic.com/content/dam/travel/photos/000/334/33476.adapt.676.1.jpg',
    accessibilityText: 'Grand Canyon National Park',
  },
  display: 'WHITE',
}),
'glacier': new BasicCard({
  title: 'Glacier National Park',
  image: {
    url: 'https://www.nationalgeographic.com/content/dam/travel/photos/000/894/89495.adapt.676.1.jpg',
    accessibilityText: 'Glacier National Park',
  },
  display: 'WHITE',
}),
'olympic': new BasicCard({
  title: 'Olympic National Park',
  image: {
    url: 'https://www.nationalgeographic.com/content/dam/travel/photos/000/333/33319.adapt.676.1.jpg',
    accessibilityText: 'Olympic National Park',
  },
  display: 'WHITE',
}),
'rocky': new BasicCard({
  title: 'Rocky Mountain National Park',
  image: {
    url: 'https://www.nationalgeographic.com/content/dam/travel/photos/000/333/33322.adapt.676.1.jpg',
    accessibilityText: 'Rocky Mountain National Park',
  },
  display: 'WHITE',
}),
'teton': new BasicCard({
  title: 'Grand Teton National Park',
  image: {
    url: 'https://www.nationalgeographic.com/content/dam/travel/photos/000/333/33313.adapt.676.1.jpg',
    accessibilityText: 'Grand Teton National Park',
  },
  display: 'WHITE',
}),
'yosemite': new BasicCard({
  title: 'Yosemite National Park',
  image: {
    url: 'https://www.nationalgeographic.com/content/dam/travel/photos/000/894/89493.adapt.676.1.jpg',
    accessibilityText: 'Yosemite National Park',
  },
  display: 'WHITE',
}),
'zion': new BasicCard({
  title: 'Zion National Park',
  image: {
    url: 'https://www.nationalgeographic.com/content/dam/travel/photos/000/333/33328.adapt.676.1.jpg',
    accessibilityText: 'Zion National Park',
  },
  display: 'WHITE',
}),
'acadia': new BasicCard({
  title: 'Acadia National Park',
  image: {
    url: 'https://www.nationalgeographic.com/content/dam/travel/photos/000/333/33307.adapt.676.1.jpg',
    accessibilityText: 'Acadia National Park',
  },
  display: 'WHITE',
})
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
      conv.ask(`${keyFact}. I can also tell you its address, entry fees, phone or more facts. How can I help you?`);
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
