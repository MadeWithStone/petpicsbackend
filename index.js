// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    return res.redirect(303, snapshot.ref.toString());
  });
});

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onCreate((snapshot, context) => {
      // Grab the current value of what was written to the Realtime Database.
      const original = snapshot.val();
      console.log('Uppercasing', context.params.pushId, original);
      const uppercase = original.toUpperCase();

      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return snapshot.ref.parent.child('uppercase').set(uppercase);
});

      /*console.log('Deleting textPosts');
      function removeData(){
        admin.database().ref('/textPosts').remove()
        const files = ['gs://airshare-3f340.appspot.com/postImgs/'];
        for (var i = 0, l = files.length; i <= l; i++) {
          ("gs://airshare-3f340.appspot.com").file(files[i]).delete()
        }
      }
      return removeData();*/

      

exports.newPost = functions.database.ref('/textPosts/{pushId}/username')
    .onCreate((snapshot, context) => {
      console.log('adding post to messages');
      return admin.database().ref('/messages').push({original: snapshot.val()});
      
})
    
exports.sendNewPostNotification = functions.database.ref('/messages/{pushId}/original')
    .onCreate((snapshot, context) => {
      console.log('sending notification of new post');
          
      var topic = 'newPost';
      var payload = {
        notification: {
          title: "New Post on Pet Pics",
          body: snapshot.val()+(" has posted a very cute image"),
        }
      };
            
      admin.messaging().sendToTopic(topic, payload)
        .then(function(response) { 
          return this.console.log("Successfully sent message:", response); 
        })
        .catch(function(error) { 
          return this.console.log("Error sending message:", error); 
        });
});

exports.chooseWinner = functions.https.onRequest((req, res) => {
    admin.database().ref('textPosts').once("value", function(snapshot) {
      const data = snapshot.val();
      var num = 0;
      var stars = 0;
      var name = "";
       
      
     for (var i in data) {
      const postDict = data[i];
      var dataDict = {};
        if (i === 0) {
          stars = postDict['stars'];
          name = postDict['username'];
        } else if (postDict['stars']>stars){
          stars = postDict['stars'];
          name = postDict['username'];
        }
        
        
  }
  console.log('The winner is '+name+" with "+stars+" stars.");
  var topic = 'newPost';
  var payload = {
    notification: {
      title: "The Winner of Pet Pics Has Been Chosen",
      body: ('The winner is '+name+" with "+stars+" stars."),
    }
  };
        
  admin.messaging().sendToTopic(topic, payload)
    .then(function(response) { 
      admin.database().ref('/textPosts').remove();
      return this.console.log("Successfully sent message:", response); 
    })
    .catch(function(error) { 
      return this.console.log("Error sending message:", error); 
    });   
      //response.send(dataDict);
    })
    res.status(200).send('The winner has been chosen');
    res.redirect(303, "Https://console.firebase.google.com");
    res.status(200).end();
});
        