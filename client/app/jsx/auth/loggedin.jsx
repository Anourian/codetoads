var LoggedIn = React.createClass({
  callApi: function() {
    var AWS_URL = AWS_URL || 'http://localhost:3000/secured/ping'
    $.ajax({
      url: AWS_URL,
      method: 'GET'
    }).then(function(data, textStatus, jqXHR) {
      alert("The request to the secured enpoint was successfull");
    }, function() {
      alert("You need to download the server seed and start it to call this API");
    });
  },

  logOut: function() {
    localStorage.removeItem('userToken');
    //need to redirect to home after
  },

  saveUser: function() {
    console.log('profile from save user ');
    console.log(this.state.profile);
    $.ajax({
      url: 'http://localhost:3000/api/saveUser',
      method: 'POST',
      data: this.state.profile
    }).then(function(data, textStatus, jqXHR) {
      alert("The request to the secured enpoint was successfull");
    }, function() {
      alert("You need to download the server seed and start it to call this API");
    });
  },

  getInitialState: function() {
    return {
      profile: null
    }
  },

  componentDidMount: function() {
    this.props.lock.getProfile(this.props.idToken, function (err, profile) {
      if (err) {
        console.log("Error loading the Profile", err);
        alert("Error loading the Profile");
      }
      this.setState({profile: profile});
    }.bind(this));
  },

  render: function() {
    if (this.state.profile) {
      return (
        <div className="logged-in-box auth0-box logged-in">
          <h1 id="logo"><img src="https://cdn.auth0.com/blog/auth0_logo_final_blue_RGB.png" /></h1>
          <img src={this.state.profile.picture} />
          <h2>Welcome {this.state.profile.nickname}</h2>
          <button onClick={this.callApi} className="btn btn-lg btn-primary">Call API</button>
          <br />
          <button onClick={this.logOut} className="btn btn-lg btn-primary">Sign Out</button>
        </div>);
    } else {
      return (
        <div className="logged-in-box auth0-box logged-in">
          <h1 id="logo"><img src="https://cdn.auth0.com/blog/auth0_logo_final_blue_RGB.png" /></h1>
        </div>);
    }
  }
});

module.exports = LoggedIn;