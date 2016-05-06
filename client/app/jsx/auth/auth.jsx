// const React = require('react')
// const LoggedIn = require('./loggedin')
// const Home = require('./home')
//
// var Auth = React.createClass({
//
//   componentWillMount: function() {
//     this.setupAjax();
//     this.createLock();
//     this.setState({idToken: this.getIdToken()})
//   },
//   createLock: function() {
//     this.lock = new Auth0Lock(AUTH0.clientID, AUTH0.domain);
//   },
//   setupAjax: function() {
//     $.ajaxSetup({
//       'beforeSend': function(xhr) {
//         if (localStorage.getItem('userToken')) {
//           xhr.setRequestHeader('Authorization',
//                 'Bearer ' + localStorage.getItem('userToken'));
//         }
//       }
//     });
//   },
//   getIdToken: function() {
//     var idToken = localStorage.getItem('userToken');
//     debugger;
//     var authHash = this.lock.parseHash(window.location.hash);
//     if (!idToken && authHash) {
//       if (authHash.id_token) {
//         idToken = authHash.id_token
//         console.log('CALLING');
//         localStorage.setItem('userToken', authHash.id_token);
//         this.saveUser();
//       }
//       if (authHash.error) {
//         console.log("Error signing in", authHash);
//       }
//     }
//     return idToken;
//   },
//   render: function() {
//     if (this.state.idToken) {
//       return (<LoggedIn lock={this.lock} idToken={this.state.idToken} />);
//     }
//       return (<Home lock={this.lock} />);
//   }
// });
//
// module.exports = Auth;
