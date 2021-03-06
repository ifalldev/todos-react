import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Tasks } from '../api/tasks.js';

import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false,
    };
  }

  handleSubmit(e) {
    e.preventDefault();

    // find the text field via React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
    });

    // clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;

    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Lista de tarefas ({this.props.incompleteCount})</h1>

          <label className="hide-completed">
            <input type="checkbox" readOnly checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)} />
            Hide Completed Tasks
          </label>

          <AccountsUIWrapper />
          
          { this.props.currentUser ?
            <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
              <input type="text" ref="textInput" placeholder="Digite uma nova tarefa"
              />
            </form> : ''
          }
        </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}
// ATRIBUI ATRIBUTO COM LISTA(OBJETO)
// DE TIPAGEM DOS PROPS QUE O COMPONENTE
// DEVE RECEBER
App.propTypes = {
  tasks: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object,
};
// CRIA UM SANDBOX QUE PASSA OS VALORES SETADOS
// PARA O COMPONENT(NO CASO APP)
export default createContainer(() => {
  return {
    tasks: Tasks.find({}, { createdAt: -1 }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
}, App);