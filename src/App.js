import React from 'react';

class App extends React.Component {
	constructor() {
        super();
        this.state = {
            roundsCompleted: 0,
            humanOccupiedHexes: [],
            zombieOccupiedHexes: [],
            numZombieArms: 3,
            humanCount: 50,
            zombieCount: 1
        }
        this.nextRound = this.nextRound.bind(this);
        this.restart = this.restart.bind(this);
    }

    displayBoard() {
        let theHexagons = []
        let theHumans = []
        let theZombies = []
        for (let j=0; j<10; j++) { //j==columns
            let h = 0                   //h pushes column down if it's an even column
            if (j%2) h = Math.sqrt(3)/2
            for (let i=0; i<10; i++) { //i=="rows"
                let k = i*Math.sqrt(3) + h  //down
                let pointsString = 
                    `${1.5*j+.5},${k} ${1.5*j+1.5},${k} ${1.5*j+2},${k+Math.sqrt(3)/2}
                     ${1.5*j+1.5},${k+Math.sqrt(3)} ${1.5*j+.5},${k+Math.sqrt(3)} ${1.5*j},${k+Math.sqrt(3)/2}`
                theHexagons.push(
                    <polygon
                        id={"hex-" + (10*j + i)} points={pointsString} key={10*j + i}
                        style={{fill: "none", stroke: "black", strokeWidth: ".02"}}
                    />
                )
                if (this.state.humanOccupiedHexes.includes(10*j + i)) {
                    theHumans.push(
                        <text
                            x={1.5*j + .55} y={k+1.3}
                            fontFamily="Arial" fontSize="1.75px" fill="blue" key={10*j+i}>x
                        </text>
                    )
                }
                if (this.state.zombieOccupiedHexes.includes(10*j + i)) {
                    theZombies.push(
                        <text
                            x={1.5*j + .5} y={k+1.32} opacity="0.5"
                            fontFamily="Arial" fontSize="1.75px" fill="red" key={10*j+i}>o
                        </text>
                    )
                }
            }
        }
        return (
            <svg viewBox="0 0 15.5 18.5">
                {theHexagons}
                {theHumans}
                {theZombies}
            </svg>
        )
    }

    displayControls(stateObject) {
        let theButtons = []
        if (stateObject.roundsCompleted===0) {
            theButtons = <button onClick={this.nextRound}>start</button>
        } else {
            theButtons = [
                <div className="col-item" key="0">
                    <button onClick={this.nextRound}>next round</button>
                </div>,
                <div className="col-item" key="1">
                    <button onClick={this.restart}>restart</button>
                </div>
            ]
        }

        return (
            <div id="controls">
                <div id="col-0" className="column"> {/* buttons*/}
                    {theButtons}
                </div>
                <div id="col-1" className="column">   {/* initial condition settings*/}
                    <div className="col-item">
                        <label>Human Start Count</label>
                        <input type="number" className="num-input" defaultValue="50"/>
                    </div>
                    <div className="col-item">
                        <label>Zombie Start Count</label>
                        <input type="number" className="num-input" defaultValue="1"/>
                    </div>
                </div>
                <div id="col-2" className="column">   {/* status*/}
                    <div className="col-item">
                        <label>Human Count: {stateObject.humanCount}</label>
                    </div>
                    <div className="col-item">
                        <label>Zombie Count: {stateObject.zombieCount}</label>
                    </div>
                    <div className="col-item">
                        <label>Round #: {stateObject.roundsCompleted}</label>
                    </div>
                </div>
            </div>
        )
    }

    nextRound() {
        let stateObject = this.state
        let humanCount = stateObject.humanCount
        let zombieCount = stateObject.zombieCount
        let humanUnoccupiedHexes = makeCountArray(100)
        let zombieUnoccupiedHexes = makeCountArray(100)
        let humanOccupiedHexes = []
        let zombieOccupiedHexes = []
        for (let i=0; i<humanCount; i++) {
            let chosenIndex = randomInteger(0, 99-i)
            let chosenHex = humanUnoccupiedHexes[chosenIndex]
            humanOccupiedHexes.push(chosenHex)
            humanUnoccupiedHexes = deleteAtIndex(humanUnoccupiedHexes, chosenIndex)
        }
        for (let i=0; i<zombieCount; i++) {
            let chosenIndex = randomInteger(0, 99-3*i)
            let chosenHex = zombieUnoccupiedHexes[chosenIndex]

            let surroundingHexes;
            if (((chosenHex-chosenHex%10)/10)%2) {//if it's an odd column
                surroundingHexes = [chosenHex-1, chosenHex+10, chosenHex+11, chosenHex+1, chosenHex-9, chosenHex-10]
            } else {                                //even column
                surroundingHexes = [chosenHex-1, chosenHex+9, chosenHex+10, chosenHex+1, chosenHex-10, chosenHex-11]
            }
            if (chosenHex%10===0) {
                surroundingHexes[0] = null
                if (!(((chosenHex-chosenHex%10)/10)%2)) {  //if it's an even column
                    surroundingHexes[1] = null
                    surroundingHexes[5] = null
                }   
            } else if (chosenHex%10===9) {
                surroundingHexes[3] = null
                if (((chosenHex-chosenHex%10)/10)%2) { //odd column
                    surroundingHexes[2] = null
                    surroundingHexes[4] = null
                }
            }
            if (chosenHex<10) {
                surroundingHexes[4] = null
                surroundingHexes[5] = null
            } else if (chosenHex>=90) {
                surroundingHexes[1] = null
                surroundingHexes[2] = null
            }
            let armOptions = []
            for (let hex of surroundingHexes) {
                if (hex!==null&&!zombieOccupiedHexes.includes(hex)) armOptions.push(hex)
            }
            let arm0Index;
            let arm0Hex;
            if (armOptions.length>0) {
                arm0Index = randomInteger(0, armOptions.length - 1)
                arm0Hex = armOptions[arm0Index]
            }
            armOptions = deleteAtIndex(armOptions, arm0Index)
            let arm1Index;
            let arm1Hex;
            if (armOptions.length>0) {
                arm1Index = randomInteger(0, armOptions.length - 1)
                arm1Hex = armOptions[arm1Index]
            }
            zombieOccupiedHexes.push(chosenHex)
            zombieOccupiedHexes.push(arm0Hex)
            zombieOccupiedHexes.push(arm1Hex)
            zombieUnoccupiedHexes = deleteAtIndex(zombieUnoccupiedHexes, chosenIndex)
            zombieUnoccupiedHexes = deleteAtIndex(zombieUnoccupiedHexes, arm0Index)
            zombieUnoccupiedHexes = deleteAtIndex(zombieUnoccupiedHexes, arm1Index)
        }

        let newInfections = 0
        for (let hex of zombieOccupiedHexes) {
            if (humanOccupiedHexes.includes(hex)) newInfections++
            console.log(newInfections)
        }
        humanCount = humanCount - newInfections
        zombieCount = zombieCount + newInfections

        this.setState(
            {
                humanOccupiedHexes: humanOccupiedHexes.sort((a, b) => a-b),
                zombieOccupiedHexes: zombieOccupiedHexes.sort((a, b) => a-b),
                roundsCompleted: stateObject.roundsCompleted + 1,
                zombieCount: zombieCount,
                humanCount: humanCount
            }
        )
    }

    restart() {
        this.setState(
            {
                roundsCompleted: 0,
                humanOccupiedHexes: [],
                zombieOccupiedHexes: [],
                numZombieArms: 3,
                humanCount: 50,
                zombieCount: 1
            }
        )
    }

    render() {
        return (
            <div id="main">
                {this.displayBoard()}
                {this.displayControls(this.state)}
            </div>
        )
    }
}

//------------------------------------------------------------------------------------------------------------------------//

//------------------------------------------------------------------------------------------------------------------------//

function randomInteger(min, max) {
    let range = max - min + 1
    return Math.floor(range*(Math.random())) + min
}

function deleteAtIndex(array, index) { //someArray===["apple", "banana", "cheese"]; deleteAtIndex(someArray, 1) => ["apple", "cheese"]
    return array.slice(0, index).concat(array.slice(index + 1, array.length))
}

function makeCountArray(length) { //makeCountArray(4) => [0,1,2,3]
    let returnArray = []
    for (let i=0; i<length; i++) returnArray.push(i)
    return returnArray
}

export default App;

//history
//arm count
//zombie mortality
//vaxx
//start counts