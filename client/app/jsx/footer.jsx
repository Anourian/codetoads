const React = require('react')
const ReactRouter = require('react-router')
const { Link } = ReactRouter
class Footer extends React.Component {
  render(){
    return (
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <ul className="list-inline">
                <li><Link to="/">Home</Link></li>
                <li className="footer-menu-divider">&#9679;</li>
                <li><Link to="/lobby">Lobby</Link></li>                
              </ul>
              <p className="copyright text-muted small">Copyright © CoadToads 2016. All Rights Reserved</p>
            </div>
          </div>
        </div>
      </footer>
      );
  }
}

module.exports = Footer