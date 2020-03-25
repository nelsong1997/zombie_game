import React from 'react';

class App extends React.Component {
	constructor() {
        super();
        this.state = {
            roundsCompleted: 0,
            zombieHeadHexes: makeZeroesArray(100),
            humanOccupiedHexes: [],
            numZombieArms: 2,
            humanCount: 50,
            zombieCount: 1,
            humanStartCount: 50,
            zombieStartCount: 1,
            zombieLifeLength: [false, 3]
        }
        this.nextRound = this.nextRound.bind(this);
        this.restart = this.restart.bind(this);
        this.inputChange = this.inputChange.bind(this);
    }

    displayBoard(stateObject) {
        let theHexagons = []
        let theHumans = []
        let theZombies = []
        let moreShapes = []
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
                        id={"hex-" + (10*j + i)} points={pointsString} key={1000*j + 100*i} //1
                        style={{fill: "none", stroke: "black", strokeWidth: ".02"}}
                    />
                )
                if (stateObject.humanOccupiedHexes.includes(10*j + i)) {
                    theHumans.push(
                        <text
                            x={1.5*j + .55} y={k+1.3} //2
                            fontFamily="Arial" fontSize="1.75px" fill="blue" key={1000*j+100*i + 1}>x
                        </text>
                    )
                }
                if (stateObject.zombieHeadHexes[(10*j + i)]) {
                    for (let x=0; x<stateObject.zombieHeadHexes[(10*j + i)].length; x++) { //3-14
                        let arm = stateObject.zombieHeadHexes[(10*j + i)][x]
                        let h2 = 0
                        if (((arm - arm%10)/10)%2) h2 = Math.sqrt(3)/2
                        let k2 = (arm%10)*Math.sqrt(3) + h2
                        moreShapes.push(
                            <circle
                                cx={1.5*((arm - arm%10)/10) + .99} cy={k2+.87} r=".4"
                                stroke="red" strokeWidth=".01" fill="red" opacity=".75" key={1000*j + 100*i + 2*x + 2}
                            />,
                            <line
                                x1={1.5*j + .99} y1={k+.87} x2={1.5*((arm - arm%10)/10) + .99} y2={k2+.87}
                                style={{stroke: "red", strokeWidth: ".25"}} key={1000*j + 100*i + 2*x + 3} opacity=".75"
                            />
                        )
                    }
                    theZombies.push(
                        <circle cx={1.5*j + .99} cy={k+.87} r=".4" stroke="red" strokeWidth=".01" fill="red" opacity=".75" key={1000*j + 100*i + 15}/> //15
                    )
                }
            }
        }
        return (
            <svg viewBox="0 0 15.5 18.5">
                {theHexagons}
                {theHumans}
                {theZombies}
                {moreShapes}
            </svg>
        )
    }

    displayControls(stateObject) {
        let theButtons = []
        let theInputs = []
        let theStatuses = []
        let nextRoundButtonTextColor = "black"
        if (stateObject.humanCount===0) nextRoundButtonTextColor = "gray"
        if (stateObject.roundsCompleted===0) {
            theButtons = <button onClick={this.nextRound}>start</button>
            theInputs = [
                <div className="col-item" key="0">  {/* initial condition settings*/}
                    <label>Human Start Count</label>
                    <input type="number" className="num-input" id="human-start-count" defaultValue="50" onChange={this.inputChange}/>
                </div>,
                <div className="col-item" key="1">
                    <label>Zombie Start Count</label>
                    <input type="number" className="num-input" id="zombie-start-count" defaultValue="1" onChange={this.inputChange}/>
                </div>,
                <div className="col-item" key="2">
                    <label># of Zombie Arms</label>
                    <input type="number" className="num-input" id="num-zombie-arms" defaultValue="2" onChange={this.inputChange}/>
                </div>
            ]
        } else {
            theButtons = [
                <div className="col-item" key="0">
                    <button onClick={this.nextRound} style={{color: nextRoundButtonTextColor}}>next round</button>
                </div>,
                <div className="col-item" key="1">
                    <button onClick={this.restart}>restart</button>
                </div>
            ]
            theInputs = [
                <div className="col-item" key="0">
                        <label>Human Start Count</label>
                        <input type="number" className="num-input" id="human-start-count-final" style={{color: "gray"}} value={stateObject.humanStartCount} readOnly/>
                </div>,
                <div className="col-item" key="1">
                    <label>Zombie Start Count</label>
                    <input type="number" className="num-input" id="zombie-start-count-final" style={{color: "gray"}} value={stateObject.zombieStartCount} readOnly/>
                </div>,
                <div className="col-item" key="2">
                    <label># of Zombie Arms</label>
                    <input type="number" className="num-input" id="num-zombie-arms-final" style={{color: "gray"}} value={stateObject.numZombieArms} readOnly/>
                </div>
            ]
            theStatuses = [
                <div className="col-item" key="0">
                    <label>Human Count: {stateObject.humanCount}</label>
                </div>,
                <div className="col-item" key="1">
                    <label>Zombie Count: {stateObject.zombieCount}</label>
                </div>,
                <div className="col-item" key="2">
                    <label>Round #: {stateObject.roundsCompleted}</label>
                </div>
            ]
        }

        return (
            <div id="controls">
                <div id="col-0" className="column"> {/* buttons*/}
                    {theButtons}
                </div>
                <div id="col-1" className="column"> {/*initial condition settings*/}
                    {theInputs}
                </div>
                <div id="col-2" className="column">   {/* status*/}
                    {theStatuses}
                </div>
            </div>
        )
    }

    nextRound() {
        let stateObject = this.state
        if (stateObject.humanCount===0) return
        let humanCount = stateObject.humanCount
        let zombieCount = stateObject.zombieCount
        if (stateObject.roundsCompleted===0) {
            humanCount = stateObject.humanStartCount
            zombieCount = stateObject.zombieStartCount
        }
        let humanUnoccupiedHexes = makeCountArray(100)
        let zombieUnoccupiedHexes = makeCountArray(100)
        let humanOccupiedHexes = []
        let zombieOccupiedHexes = []
        let zombieHeadHexes = makeZeroesArray(100)
        for (let i=0; i<humanCount; i++) {
            let chosenIndex = randomInteger(0, 99-i)
            let chosenHex = humanUnoccupiedHexes[chosenIndex]
            humanOccupiedHexes.push(chosenHex)
            humanUnoccupiedHexes = deleteAtIndex(humanUnoccupiedHexes, chosenIndex)
        }

        for (let i=0; i<zombieCount; i++) {
            if (zombieUnoccupiedHexes.length===0) break;
            let chosenIndex = randomInteger(0, zombieUnoccupiedHexes.length-1)
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
            let theArmIndices = []
            let theArmHexes = []
            for (let j=0; j<stateObject.numZombieArms; j++) {
                if (armOptions.length===0) break;
                theArmIndices[j] = randomInteger(0, armOptions.length - 1)
                theArmHexes[j] = armOptions[theArmIndices[j]]
                armOptions = deleteAtIndex(armOptions, theArmIndices[j])
            }

            zombieHeadHexes[chosenHex] = theArmHexes
            zombieOccupiedHexes.push(chosenHex)
            for (let j=0; j<theArmHexes.length; j++) {
                zombieOccupiedHexes.push(theArmHexes[j])
                zombieUnoccupiedHexes = deleteAtIndex(
                    zombieUnoccupiedHexes,
                    zombieUnoccupiedHexes.findIndex(element => element===theArmHexes[j])
                )
            }
            console.log(zombieUnoccupiedHexes)
            zombieUnoccupiedHexes = deleteAtIndex(
                zombieUnoccupiedHexes,
                zombieUnoccupiedHexes.findIndex(element => element===chosenHex)
            )
        }

        let newInfections = 0
        for (let hex of zombieOccupiedHexes) {
            if (humanOccupiedHexes.includes(hex)) newInfections++
        }
        humanCount = humanCount - newInfections
        zombieCount = zombieCount + newInfections

        this.setState(
            {
                humanOccupiedHexes: humanOccupiedHexes.sort((a, b) => a-b),
                zombieHeadHexes: zombieHeadHexes,
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
                zombieHeadHexes: makeZeroesArray(100),
                numZombieArms: 2,
                humanCount: 50,
                zombieCount: 1
            }
        )
    }

    inputChange(e) {
        if (e.target.id==="human-start-count") this.setState({humanStartCount: Number(e.target.value)})
        if (e.target.id==="zombie-start-count") this.setState({zombieStartCount: Number(e.target.value)})
        if (e.target.id==="num-zombie-arms") this.setState({numZombieArms: Number(e.target.value)})
    }

    render() {
        return (
            <div id="main">
                {this.displayBoard(this.state)}
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
    for (let i=0; i<length; i++) returnArray[i] = i
    return returnArray
}

function makeZeroesArray(length) { //makeZeroesArray(4) => [null, null, null, null]
    let returnArray = []
    for (let i=0; i<length; i++) returnArray[i] = 0
    return returnArray
}

export default App;

//history
//arm count
//zombie mortality
//vaxx
//hotseat
//zombie spawn options
//      * random, not full
//      * random predet spawns
//input ver