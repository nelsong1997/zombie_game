import React from 'react';

class App extends React.Component {
	constructor() {
        super();
        this.state = {
        }
    }

    displayBoard() {
        let theHexagons = []
        for (let j=0; j<10; j++) {
            let h = 0
            if (j%2) h = Math.sqrt(3)/2
            for (let i=0; i<10; i++) {
                let k = i*Math.sqrt(3) + h
                let pointsString = 
                    `${1.5*j+.5},${k} ${1.5*j+1.5},${k} ${1.5*j+2},${k+Math.sqrt(3)/2}
                     ${1.5*j+1.5},${k+Math.sqrt(3)} ${1.5*j+.5},${k+Math.sqrt(3)} ${1.5*j},${k+Math.sqrt(3)/2}`
                theHexagons.push(
                    <polygon points={pointsString} style={{fill: "none", stroke: "black", strokeWidth: ".01"}}/>
                )
            }
        }
        return (
            <svg viewBox="0 0 20 20">
                {theHexagons}
            </svg>
        )
    }

    render() {
        return (
            <div>
                {this.displayBoard()}
            </div>
        )
    }
}  

export default App;