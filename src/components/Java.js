import React from 'react';
import { Link } from 'react-router';

export default class Java extends React.Component {
  getJava() {
    var html = `<applet code="gomoku.Main.class" width="750" height="750">
                  <p>Please enable <a href="https://www.java.com/verify">Java</a> in your browser.</p>
                  <param name="cache_option" value="no">
                </applet>`;
    return { __html: html };
  }
  render() {
    return (<div>
      <p><Link to="/home">Home</Link></p>
      <div className="java" dangerouslySetInnerHTML={ this.getJava() }></div>
    </div>)
  }
}
