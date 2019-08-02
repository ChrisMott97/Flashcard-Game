import React, { Component} from "react";
import '../assets/style.scss';


class App extends Component{
    render(){
        let name="Chris";
        return(
            <div>
                <h1>Hello, {name}</h1>
            </div>
        )
    }
}

export default App;