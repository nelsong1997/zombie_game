import React from 'react';
import sick_face from './sick_face.svg';
import smile_face from './smile_face.svg';
// var CanvasJSReact = require('./canvasjs.react');
// var CanvasJSChart = CanvasJSReact.default.CanvasJSChart;

class App extends React.Component {
	constructor() {
        super();
        this.state = {
            roundsCompleted: 0,
            zombieHeadHexes: makeZeroesArray(100),
            humanOccupiedHexes: [],
            zombieOccupiedHexes: [],
            vaccinatedOccupiedHexes: [],
            numZombieArms: 2,
            humanCount: 50,
            vaccinatedCount: 0,
            zombieCount: 1,
            history: [],
            algorithm: "random-head",
            mortality: false,
            mortalityNum: 1,
            vaccination: false,
            vaccineEffectiveness: 80,
            mode: "auto",
            gameStarted: false,
            whoseTurn: "Humans",
            placeHeadOrArm: "head",
            currentHeadHex: 0,
            numArmsRemaining: 0,
            hiddenHumanHexes: [],
            hiddenVaccinatedHexes: [],
            infectedVaccinatedHexes: [],
            theGraph: null
        }
        this.start = this.start.bind(this)
        this.nextRound = this.nextRound.bind(this);
        this.nextRoundHotseat = this.nextRoundHotseat.bind(this);
        this.restart = this.restart.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleHexClick = this.handleHexClick.bind(this);
        this.calcNewInfections = this.calcNewInfections.bind(this);
        this.autofill = this.autofill.bind(this);
        this.autofillZombies = this.autofillZombies.bind(this);
        this.autofillHumans = this.autofillHumans.bind(this);
    }

    displayBoard(stateObject) {
        let theHexagons = []
        let theHumans = []
        let theVaccinated = []
        let theZombies = []
        let moreShapes = []
        let faces = []
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
                        id={"hex-" + j + "" + i} points={pointsString} key={1000*j + 100*i} //1
                        style={{fill: "white", stroke: "black", strokeWidth: ".02"}} onClick={this.handleHexClick}
                    />
                )
                if (stateObject.humanOccupiedHexes.includes(10*j + i)) {
                    theHumans.push(
                        <text
                            x={1.5*j + .55} y={k+1.3} id={10*j+i} onClick={this.handleHexClick} //2
                            fontFamily="Arial" fontSize="1.75px" fill="blue" key={1000*j+100*i + 1}>x
                        </text>
                    )
                }
                if (stateObject.vaccinatedOccupiedHexes.includes(10*j + i)) {
                    theVaccinated.push(
                        <text
                            x={1.5*j + .55} y={k+1.3} id={10*j+i} onClick={this.handleHexClick} //3
                            fontFamily="Arial" fontSize="1.75px" fill="lime" key={1000*j+100*i + 2}>x
                        </text>
                    )
                    if (stateObject.infectedVaccinatedHexes.includes(10*j + i) && stateObject.zombieOccupiedHexes.includes(10*j + i)) {
                        faces.push(<img src={sick_face} alt="sick" style={{left: (1.5*j + 1.55)*43.226, top: (k+1.3 - .55)*43.226}}></img>)
                    } else if (!stateObject.infectedVaccinatedHexes.includes(10*j + i) && stateObject.zombieOccupiedHexes.includes(10*j + i)) {
                        faces.push(<img src={smile_face} alt="healthy" style={{left: (1.5*j + 1.55)*43.226, top: (k+1.3 - .55)*43.226}}></img>)
                    }
                }
                if (stateObject.zombieHeadHexes[(10*j + i)]) {
                    for (let x=0; x<stateObject.zombieHeadHexes[(10*j + i)].length; x++) { //4-15
                        let arm = stateObject.zombieHeadHexes[(10*j + i)][x]
                        let h2 = 0
                        if (((arm - arm%10)/10)%2) h2 = Math.sqrt(3)/2
                        let k2 = (arm%10)*Math.sqrt(3) + h2
                        moreShapes.push(
                            <line
                                x1={1.5*j + .99} y1={k+.87} x2={1.5*((arm - arm%10)/10) + .99} y2={k2+.87} onClick={this.handleHexClick}
                                style={{stroke: "red", strokeWidth: ".25"}} key={1000*j + 100*i + 2*x + 3} opacity="1" id={10*j+i}
                            />,
                            <circle
                                cx={1.5*((arm - arm%10)/10) + .99} cy={k2+.87} r=".4" id={10*j+i} onClick={this.handleHexClick}
                                stroke="red" strokeWidth=".01" fill="red" opacity="1" key={1000*j + 100*i + 2*x + 4}
                            />
                        )
                    }
                    theZombies.push(
                        <circle
                            cx={1.5*j + .99} cy={k+.87} r=".4" stroke="red" strokeWidth=".01" onClick={this.handleHexClick}
                            fill="red" opacity="1" key={1000*j + 100*i + 16} id={10*j+i}
                        /> //16
                    )
                }
            }
        }
        return (
            <div>
                <svg viewBox="0 0 15.5 18.5">
                    {theHexagons}
                    {theZombies}
                    {moreShapes}
                    {theHumans}
                    {theVaccinated}
                </svg>
                {faces}
            </div>
        )
    }

    displayControls(stateObject) {
        let theButtons = []
        let theNumInputs = []
        let nextRoundButtonTextColor = "black"
        if ((stateObject.humanCount===0 && stateObject.vaccinatedCount===0) || stateObject.zombieCount===0) {
            nextRoundButtonTextColor = "gray"
        }
        let slideButtonColor = "black"
        if (stateObject.numZombieArms>2) slideButtonColor = "gray"
        let slotsButtonColor = "black"
        if (stateObject.numZombieArms>4) slotsButtonColor = "gray"
        let mortalityNumInput = null
        let vaccinationNumInputs = null
        let otherOptions = null
        if (!stateObject.gameStarted) { //game not started
            if (stateObject.mortality) { 
                mortalityNumInput = [
                    <input
                        type="number" className="num-input" id="mortality-num" key="0" min="1"
                        value={stateObject.mortalityNum} name="mortalityNum" onChange={this.handleInputChange}
                    />
                ]
            }
            if (stateObject.vaccination) { 
                vaccinationNumInputs = [
                    <input
                        type="number" className="num-input" id="vaccinated-start-count" key="0" min="0" max={100-stateObject.humanCount}
                        value={stateObject.vaccinatedCount} name="vaccinatedCount" onChange={this.handleInputChange}
                    />,
                    <input
                        type="number" className="num-input" id="vaccine-effectiveness" key="0" min="0" max="100"
                        value={stateObject.vaccineEffectiveness} name="vaccineEffectiveness" onChange={this.handleInputChange}
                    />
                ]
            }
            theButtons = <button onClick={this.start}>start</button>
            theNumInputs = [
                <input
                    type="number" className="num-input" id="human-start-count" key="0" min="0" max={100-stateObject.vaccinatedCount}
                    value={stateObject.humanCount} name="humanCount" onChange={this.handleInputChange}
                />,
                <input
                    type="number" className="num-input" id="zombie-start-count" key="1" min="1" max="100"
                    value={stateObject.zombieCount} name="zombieCount" onChange={this.handleInputChange}
                />,
                <input
                    type="number" className="num-input" id="num-zombie-arms" key="2" min="0" max="6"
                    value={stateObject.numZombieArms} name="numZombieArms" onChange={this.handleInputChange}
                />
            ]
            otherOptions = [
                <div className="col-item" key="7">
                    <label>Other Options</label>
                    <div id="other-options">
                        <div>
                            <label>
                                <input
                                    type="checkbox" value={!stateObject.mortality} checked={stateObject.mortality} 
                                    name="mortality" onChange={this.handleInputChange}
                                />Zombie Mortality
                            </label>
                        </div>
                        <div>
                            <label>
                                <input 
                                    type="checkbox" value={!stateObject.vaccination} checked={stateObject.vaccination} 
                                    name="vaccination" onChange={this.handleInputChange}
                                />Vaccination
                            </label>
                        </div>
                    </div>
                </div>,
                <div className="col-item" key="8">
                    <label>Mode</label>
                    <div id="mode-select">
                        <div>
                            <label>
                                <input
                                    type="radio" value="auto" checked={stateObject.mode==="auto"} 
                                    name="mode" onChange={this.handleInputChange}
                                />Auto
                            </label>
                        </div>
                        <div>
                            <label>
                                <input 
                                    type="radio" value="hotseat" checked={stateObject.mode==="hotseat"} 
                                    name="mode" onChange={this.handleInputChange}
                                />Hotseat
                            </label>
                        </div>
                    </div>
                </div>
            ]
        } else { //game started
            if (stateObject.mortality) { 
                mortalityNumInput = [<label key="0"><strong>{stateObject.mortalityNum}</strong></label>]
            }
            if (stateObject.vaccination) { 
                vaccinationNumInputs = [
                    <label key="0"><strong>{stateObject.history[0].vaccinatedCount}</strong></label>,
                    <label key="1"><strong>{stateObject.vaccineEffectiveness}</strong></label>
                ]
            }
            if (stateObject.mode==="auto") {
                theButtons[0] = [
                    <div className="col-item" key="0">
                        <button onClick={this.nextRound} style={{color: nextRoundButtonTextColor}}>next round</button>
                    </div>
                ]
            } else if (stateObject.whoseTurn==="wait") {
                theButtons[0] = [
                    <div className="col-item" key="0">
                        <button onClick={this.nextRoundHotseat} style={{color: nextRoundButtonTextColor}}>next round</button>
                    </div>
                ]
            } else if (stateObject.mode==="hotseat") {
                theButtons[0] = [
                    <div className="col-item" key="0">
                        <button onClick={this.autofill}>autofill</button>
                    </div>
                ]
            }
            theButtons[1] = [
                <div className="col-item" key="1">
                    <button onClick={this.restart}>restart</button>
                </div>
            ]
            theNumInputs = [
                <label key="0"><strong>{stateObject.history[0].humanCount}</strong></label>,
                <label key="1"><strong>{stateObject.history[0].zombieCount}</strong></label>,
                <label key="2"><strong>{stateObject.numZombieArms}</strong></label>
            ]
        }
        let mortalityColItem = null
        if (stateObject.mortality) {
            mortalityColItem = [
                <div className="col-item" key="3">
                    <label>Zombie Lifespan (days)</label>
                    {mortalityNumInput}
                </div>
            ]
        }
        let vaccinationColItems = null
        if (stateObject.vaccination) {
            vaccinationColItems = [
                <div className="col-item" key="4">
                    <label>Vaccinated Human Start Count</label>
                    {vaccinationNumInputs[0]}
                </div>,
                <div className="col-item" key="5">
                    <label>% Vaccine Effectiveness</label>
                    {vaccinationNumInputs[1]}
                </div>
            ]
        }

        return (
            <div id="controls">
                <div id="col-0" className="column"> {/* buttons*/}
                    {theButtons}
                </div>
                <div id="col-1" className="column"> {/*initial condition settings*/}
                    <div className="col-item" key="0">
                        <label>Human Start Count</label>
                        {theNumInputs[0]}
                    </div>
                    <div className="col-item" key="1">
                        <label>Zombie Start Count</label>
                        {theNumInputs[1]}
                    </div>
                    <div className="col-item" key="2">
                        <label># of Zombie Arms</label>
                        {theNumInputs[2]}
                    </div>
                    {mortalityColItem}
                    {vaccinationColItems}
                    <div className="col-item" key="6">
                        <label>Algorithm</label>
                        <div id="algorithm-select">
                            <div>
                                <label>
                                    <input
                                        type="radio" value="random-head" checked={stateObject.algorithm==='random-head'} 
                                        name="algorithm" onChange={this.handleInputChange}
                                    />Random Head
                                </label>
                            </div>
                            <div>
                                <label style={{color: slideButtonColor}}>
                                    <input 
                                        type="radio" value="slide" checked={stateObject.algorithm==='slide'} 
                                        name="algorithm" onChange={this.handleInputChange}
                                    />Slide
                                </label>
                            </div>
                            <div>
                                <label style={{color: slotsButtonColor}}>
                                    <input 
                                        type="radio" value="slots" checked={stateObject.algorithm==='slots'}
                                        name="algorithm" onChange={this.handleInputChange}
                                    />Slots
                                </label>
                            </div>
                        </div>
                    </div>
                    {otherOptions}
                </div>
            </div>
        )
    }

    displayStatusInfo(stateObject) {
        if (!stateObject.gameStarted) return null
        if (stateObject.whoseTurn==="Humans" || stateObject.whoseTurn==="Zombies") {
            let whoseTurnTextColor;
            let currentlyPlacingTypeColor;
            let currentlyPlacingType;
            let headOrArmInfo = null;
            if (stateObject.whoseTurn==="Humans") {
                whoseTurnTextColor = "blue"
                if (stateObject.humanCount>0) {
                   currentlyPlacingType = "human"
                   currentlyPlacingTypeColor = "blue"
                } else if (stateObject.vaccinatedCount>0) {
                    currentlyPlacingType = "vaccinated human"
                    currentlyPlacingTypeColor = "lime"
                } else {
                    return (
                        <div id="status-info" className="column">
                            <p><strong>Switch players!</strong></p>
                        </div>
                    )
                }
            } else if (stateObject.whoseTurn==="Zombies") {
                whoseTurnTextColor = "red"
                if (stateObject.zombieCount>0) {
                    currentlyPlacingType = "zombie"
                    currentlyPlacingTypeColor = "red"
                    if (stateObject.placeHeadOrArm==="head") {
                        headOrArmInfo = "the head of "
                    } else if (stateObject.placeHeadOrArm==="arm") {
                        headOrArmInfo = `arm #${stateObject.numZombieArms-stateObject.numArmsRemaining + 1} of `
                    }
                }
            }
            let currentlyPlacingName = currentlyPlacingType + "Count"
            currentlyPlacingName = currentlyPlacingName.split(" human").join("") //"zombieCount" => "zombieCount"; "vaccinated humanCount" => "vaccinatedCount"
            let currentlyPlacingNum = stateObject[currentlyPlacingName]
            return (
                <div id="status-info" className="column">
                    <p><strong style={{color: whoseTurnTextColor}}>{stateObject.whoseTurn}'</strong> turn!</p>
                    <p>Currently placing {headOrArmInfo}<strong style={{color: currentlyPlacingTypeColor}}>
                        {currentlyPlacingType} #{stateObject.history[stateObject.roundsCompleted][currentlyPlacingName] - currentlyPlacingNum + 1}
                        </strong>!</p>
                    <p>
                        You have {currentlyPlacingNum} <strong style={{color: currentlyPlacingTypeColor}}>
                            {currentlyPlacingType + ((currentlyPlacingNum===1 && " ") || "s")}
                        </strong> left to place.
                    </p>
                </div>
            )
        } else if (stateObject.whoseTurn==="wait") {
            let waitEndMessage = [<p key="0"><strong>Switch players!</strong></p>]
            if (stateObject.humanCount===0 && stateObject.vaccinatedCount===0) {
                waitEndMessage = [<p key="0"><strong style={{color: "red"}}>The Zombies win!</strong></p>]
            } else if (stateObject.zombieCount===0) {
                waitEndMessage = [<p key="0"><strong style={{color: "blue"}}>The Humans win!</strong></p>]
            } else if (stateObject.mode==="auto") waitEndMessage = null
            let normalInfections = (
                stateObject.history[stateObject.roundsCompleted].newInfections -
                stateObject.infectedVaccinatedHexes.length
            )
            let vaccinatedInfections = stateObject.infectedVaccinatedHexes.length
            let string0 = "humans were"
            if (normalInfections===1) string0 = "human was"
            let string1 = "humans were"
            if (vaccinatedInfections===1) string1 = "human was"
            let vaccinationPart = ""
            if (stateObject.vaccination) {
                vaccinationPart = ` and ${stateObject.infectedVaccinatedHexes.length} vaccinated ${string1} infected`
            }

            return (
                <div id="status-info" className="column">
                    <p>Round ended. {normalInfections} normal {string0} infected{vaccinationPart}.
                    </p>
                    {waitEndMessage}
                </div>
            )
        }
    }

    displayHistoryTable(history, gameStarted) {
        if (gameStarted) {
            let historyTableRows = []
            for (let round in history) {
                let vaccinatedCountData = null
                if (this.state.vaccination) vaccinatedCountData = [
                    <td key={round}>{history[round].vaccinatedCount}</td>
                ]
                let removedCountData = null
                if (this.state.mortality) {
                    let totalPopulation = history[0].zombieCount + history[0].humanCount + history[0].vaccinatedCount
                    let currentOtherPop = history[round].zombieCount + history[round].humanCount + history[round].vaccinatedCount
                    let removedNum = totalPopulation - currentOtherPop
                    removedCountData = [
                        <td key={round}>{removedNum}</td>
                    ]
                }
                historyTableRows.push(
                    <tr key={round}>
                        <td>{round}</td>
                        <td>{history[round].humanCount}</td>
                        {vaccinatedCountData}
                        <td>{history[round].zombieCount}</td>
                        {removedCountData}
                        <td>{history[round].newInfections}</td>
                    </tr>
                )
            }
            let vaccinatedTableHeader = null
            if (this.state.vaccination) vaccinatedTableHeader = [<th key="0"># Vaccinated</th>]
            let removedTableHeader = null
            if (this.state.mortality) removedTableHeader = [<th key="0"># Removed</th>]
            let historyTable = [
                <table key="0">
                    <tbody>
                        <tr>
                            <th>Round #</th>
                            <th># Humans</th>
                            {vaccinatedTableHeader}
                            <th># Zombies</th>
                            {removedTableHeader}
                            <th>New Infections</th>
                        </tr>
                        {historyTableRows}
                    </tbody>
                </table>
            ]
            return historyTable
        } else return null
    }

    // createGraph(history, gameStarted, vaccination, mortality) {
    //     let theData = []
    //     theData[0] = {
    //         name: "Human Count",
    //         color: "blue",
    //         showInLegend: true,
    //         type: "line",
    //         toolTipContent: "Round {x}: {y}",
    //         dataPoints: []
    //     }
    //     for (let round in history) { //humanCounts
    //         theData[0].dataPoints.push({x: round, y: history[round].humanCount})
    //     }
    //     theData[1] = {
    //         name: "Zombie Count",
    //         color: "red",
    //         showInLegend: true,
    //         type: "line",
    //         toolTipContent: "Round {x}: {y}",
    //         dataPoints: []
    //     }
    //     for (let round in history) { //zombieCounts
    //         theData[1].dataPoints.push({x: round, y: history[round].zombieCount})
    //     }
    //     if (vaccination) {
    //         theData[2] = {
    //             name: "Vaccinated Count",
    //             color: "lime",
    //             showInLegend: true,
    //             type: "line",
    //             toolTipContent: "Round {x}: {y}",
    //             dataPoints: []
    //         }
    //         for (let round in history) { //vaccinatedCounts
    //             theData[2].dataPoints.push({x: round, y: history[round].vaccinatedCount})
    //         }
    //     }
    //     if (mortality) {
    //         theData[3] = {
    //             name: "Removed Count",
    //             color: "purple",
    //             showInLegend: true,
    //             type: "line",
    //             toolTipContent: "Round {x}: {y}",
    //             dataPoints: []
    //         }
    //         let totalPopulation = history[0].zombieCount + history[0].humanCount + history[0].vaccinatedCount
    //         for (let round in history) { //removed
    //             let currentOtherPop = history[round].zombieCount + history[round].humanCount + history[round].vaccinatedCount
    //             let theNumber = totalPopulation - currentOtherPop
    //             theData[3].dataPoints.push({x: round, y: theNumber})
    //         }
    //     }
    //     const options = {
    //         animationEnabled: false,
    //         exportEnabled: false,
    //         theme: "light2", // "light1", "dark1", "dark2"
    //         axisY: {
    //             title: "Population Count",
    //             includeZero: true,
    //             suffix: ""
    //         },
    //         axisX: {
    //             title: "Round",
    //             prefix: "",
    //             interval: 1,
    //             maximum: history.length
    //         },
    //         data: theData
    //     }
    //     return ( 
    //         [ 
    //             <div id="graph">
    //                 <CanvasJSChart options = {options}/>
    //             </div>

    //         ]
    //     )   
    // }

    handleInputChange(e) {
        let property = e.target.name
        let value = e.target.value
        if (e.target.type==="number") { 
            value = Number(value)                                        //if it's a number we don't want it to be a string
            if (property!=="vaccineEffectiveness") value = value-value%1 //the effectiveness can be a decimal
            if (value<e.target.min) value = Number(e.target.min)         //don't let it go below min
            else if (e.target.max && value>e.target.max) value = Number(e.target.max) //or above max
        }
        if (e.target.type==="checkbox") {
            value = (value==="true")
            if (property==="vaccination" && value) { //revert human count if it's too high
                this.setState({vaccinatedCount: 25})
                if (this.state.humanCount>75) this.setState({humanCount: 75})
            } else if (property==="vaccination" && !value) this.setState({vaccinatedCount: 0})
        }
        this.setState({[property]: value})
    }

    componentDidUpdate() { //verifies some settings and inputs
        let stateObject = this.state
        if (
            (stateObject.numZombieArms>4 && stateObject.algorithm!=="random-head") ||
            (stateObject.numZombieArms>2 && stateObject.algorithm==="slide")
        ) this.setState({algorithm: "random-head"})
    }

    handleHexClick(e) {
        let stateObject = this.state
        if (!stateObject.gameStarted || stateObject.mode==="auto") return
        let selectedHex = Number(e.target.id.slice(-2))
        if (
            stateObject.whoseTurn==="Humans" &&
            !stateObject.humanOccupiedHexes.includes(selectedHex) &&
            !stateObject.vaccinatedOccupiedHexes.includes(selectedHex)
            ) {
                if (stateObject.humanCount > 0) {
                    let humanOccupiedHexes = stateObject.humanOccupiedHexes
                    humanOccupiedHexes.push(selectedHex)
                    this.setState(
                        {
                            humanOccupiedHexes: humanOccupiedHexes.sort((a,b) => a-b),
                            humanCount: stateObject.humanCount - 1
                        }
                    )
                } else if (stateObject.vaccinatedCount > 0) {
                    let vaccinatedOccupiedHexes = stateObject.vaccinatedOccupiedHexes
                    vaccinatedOccupiedHexes.push(selectedHex)
                    this.setState(
                        {
                            vaccinatedOccupiedHexes: vaccinatedOccupiedHexes.sort((a,b) => a-b),
                            vaccinatedCount: stateObject.vaccinatedCount - 1
                        }
                    )
                }
                if (stateObject.humanCount + stateObject.vaccinatedCount===1) { //this means we just placed our last human
                    setTimeout(() => {
                            this.setState(
                                {
                                    whoseTurn: "Zombies",
                                    hiddenHumanHexes: stateObject.humanOccupiedHexes,
                                    hiddenVaccinatedHexes: stateObject.vaccinatedOccupiedHexes,
                                    humanOccupiedHexes: [],
                                    vaccinatedOccupiedHexes: []
                                }
                            )

                        }, 1500
                    )
                }
        } else if (
            stateObject.whoseTurn==="Zombies" &&
            !stateObject.zombieOccupiedHexes.includes(selectedHex)
            ) {
                let zombieCount = stateObject.zombieCount
                if (stateObject.placeHeadOrArm==="head") {
                    let zombieOccupiedHexes = stateObject.zombieOccupiedHexes
                    let zombieHeadHexes = stateObject.zombieHeadHexes
                    zombieOccupiedHexes.push(selectedHex)
                    zombieHeadHexes[selectedHex] = []

                    //calculate how many arm opts there are
                    let theSurroundingHexes = findSurroundingHexes(selectedHex)
                    let numArmOptions = 0
                    for (let hex of theSurroundingHexes) {
                        if (!zombieOccupiedHexes.includes(hex)) numArmOptions++
                    }
                    let placeHeadOrArm = "arm"
                    if (numArmOptions===0 || stateObject.numZombieArms===0) {
                        placeHeadOrArm = "head"
                        zombieCount--
                    }

                    this.setState(
                        {
                            zombieOccupiedHexes: zombieOccupiedHexes.sort((a,b) => a-b),
                            zombieHeadHexes: zombieHeadHexes,
                            zombieCount: zombieCount,
                            placeHeadOrArm: placeHeadOrArm,
                            numArmsRemaining: stateObject.numZombieArms,
                            currentHeadHex: selectedHex
                        }
                    )
                } else if (stateObject.placeHeadOrArm==="arm") {
                    let zombieOccupiedHexes = stateObject.zombieOccupiedHexes
                    let zombieHeadHexes = stateObject.zombieHeadHexes
                    let currentHeadHex = stateObject.currentHeadHex
                    let numArmsRemaining = stateObject.numArmsRemaining

                    if (!findSurroundingHexes(currentHeadHex).includes(selectedHex)) return

                    zombieOccupiedHexes.push(selectedHex)
                    zombieHeadHexes[currentHeadHex].push(selectedHex)
                    numArmsRemaining--

                    //calculate how many arm opts there are
                    let theSurroundingHexes = findSurroundingHexes(currentHeadHex)
                    let numArmOptions = 0
                    for (let hex of theSurroundingHexes) {
                        if (!zombieOccupiedHexes.includes(hex)) numArmOptions++
                    }
                    let placeHeadOrArm = "arm"
                    if (numArmOptions===0 || numArmsRemaining===0) {
                        placeHeadOrArm = "head"
                        zombieCount--
                    }

                    this.setState(
                        {
                            zombieOccupiedHexes: zombieOccupiedHexes.sort((a,b) => a-b),
                            zombieHeadHexes: zombieHeadHexes,
                            zombieCount: zombieCount,
                            placeHeadOrArm: placeHeadOrArm,
                            numArmsRemaining: numArmsRemaining
                        }
                    )
                }
                if (zombieCount===0) {
                    this.setState(
                        {
                            whoseTurn: "wait",
                            humanOccupiedHexes: stateObject.hiddenHumanHexes,
                            vaccinatedOccupiedHexes: stateObject.hiddenVaccinatedHexes
                        }
                    )
                    this.calcNewInfections(this.state)
                }
        } else if (stateObject.whoseTurn==="Humans") { //deleting a human
            if (stateObject.humanCount===0 && stateObject.vaccinatedCount===0) return
            if (stateObject.humanOccupiedHexes.includes(selectedHex)) {
                let humanOccupiedHexes = stateObject.humanOccupiedHexes
                humanOccupiedHexes = deleteAtIndex(
                    humanOccupiedHexes, 
                    humanOccupiedHexes.findIndex(element => element===selectedHex)
                )
                this.setState(
                    {
                        humanCount: stateObject.humanCount + 1,
                        humanOccupiedHexes: humanOccupiedHexes
                    }
                )
            } else if (stateObject.vaccinatedOccupiedHexes.includes(selectedHex)) {
                let vaccinatedOccupiedHexes = stateObject.vaccinatedOccupiedHexes
                vaccinatedOccupiedHexes = deleteAtIndex(
                    vaccinatedOccupiedHexes, 
                    vaccinatedOccupiedHexes.findIndex(element => element===selectedHex)
                )
                this.setState(
                    {
                        vaccinatedCount: stateObject.vaccinatedCount + 1,
                        vaccinatedOccupiedHexes: vaccinatedOccupiedHexes
                    }
                )
            }
        } else if (stateObject.whoseTurn==="Zombies") { //deleting a zombie
            let zombieHeadHexes = stateObject.zombieHeadHexes
            let zombieOccupiedHexes = stateObject.zombieOccupiedHexes
            if (zombieOccupiedHexes.includes(selectedHex) && zombieHeadHexes[selectedHex]) {
                zombieOccupiedHexes = deleteAtIndex(
                    zombieOccupiedHexes, 
                    zombieOccupiedHexes.findIndex(element => element===selectedHex)
                )
                for (let arm of zombieHeadHexes[selectedHex]) {
                    zombieOccupiedHexes = deleteAtIndex(
                        zombieOccupiedHexes, 
                        zombieOccupiedHexes.findIndex(element => element===arm)
                    )
                }
                zombieHeadHexes[selectedHex] = 0
                let zombieCount = stateObject.zombieCount
                let placeHeadOrArm = stateObject.placeHeadOrArm
                if (selectedHex===stateObject.currentHeadHex) placeHeadOrArm = "head"
                else zombieCount++
                this.setState(
                    {
                        zombieCount: zombieCount,
                        zombieHeadHexes: zombieHeadHexes,
                        zombieOccupiedHexes: zombieOccupiedHexes,
                        placeHeadOrArm: placeHeadOrArm
                    }
                )
            }
        }   
    }

    start() {
        let stateObject = this.state
        let vaccinatedCount = stateObject.vaccinatedCount
        let humanCount = stateObject.humanCount
        let zombieCount = stateObject.zombieCount
        let history = []
        history[0] = {
                humanCount: humanCount,
                vaccinatedCount: vaccinatedCount,
                zombieCount: zombieCount,
                newInfections: zombieCount
            }

        this.setState({history: history, gameStarted: true})

        if (stateObject.mode==="auto") {
            this.nextRound(history, true)
            this.setState({whoseTurn: "wait"})
        }
    }

    nextRound(startHistory) {
        let stateObject = this.state
        if ((stateObject.humanCount===0 && stateObject.vaccinatedCount===0) || stateObject.zombieCount===0) return
        let humanCount = stateObject.humanCount
        let zombieCount = stateObject.zombieCount
        let vaccinatedCount = stateObject.vaccinatedCount
        let history = stateObject.history
        if (history.length===0) history = startHistory

        let autofillHumans = this.autofillHumans(
            humanCount,
            vaccinatedCount,
            [],
            [],
            makeCountArray(100)
        )
        let humanOccupiedHexes = autofillHumans.humanOccupiedHexes
        let vaccinatedOccupiedHexes = autofillHumans.vaccinatedOccupiedHexes

        let autofillZombies = this.autofillZombies(
            zombieCount,
            [],
            makeZeroesArray(100),
            makeCountArray(100)
        )
        let zombieOccupiedHexes = autofillZombies.zombieOccupiedHexes
        let zombieHeadHexes = autofillZombies.zombieHeadHexes

        this.calcNewInfections(
            {
                humanCount: humanCount,
                vaccinatedCount: vaccinatedCount,
                zombieCount: zombieCount,
                humanOccupiedHexes: humanOccupiedHexes,
                vaccinatedOccupiedHexes: vaccinatedOccupiedHexes,
                zombieOccupiedHexes: zombieOccupiedHexes,
                history: history,
            }
        )

        this.setState(
            {
                humanOccupiedHexes: humanOccupiedHexes.sort((a, b) => a-b),
                vaccinatedOccupiedHexes: vaccinatedOccupiedHexes,
                zombieHeadHexes: zombieHeadHexes,
                zombieOccupiedHexes: zombieOccupiedHexes
            }
        )
    }

    autofill() {
        let stateObject = this.state
        let whoseTurn = stateObject.whoseTurn
        if (whoseTurn==="Humans") {
            let humanUnoccupiedHexes = []
            for (let i=0; i<100; i++) {
                if (!stateObject.humanOccupiedHexes.includes(i) && !stateObject.vaccinatedOccupiedHexes.includes(i)) {
                    humanUnoccupiedHexes.push(i)
                }
            }
            this.autofillHumans(
                stateObject.humanCount,
                stateObject.vaccinatedCount,
                stateObject.humanOccupiedHexes,
                stateObject.vaccinatedOccupiedHexes,
                humanUnoccupiedHexes
            )
        } else if (whoseTurn==="Zombies") {
            let zombieUnoccupiedHexes = []
            for (let i=0; i<100; i++) {
                if (!stateObject.zombieOccupiedHexes.includes(i)) {
                    zombieUnoccupiedHexes.push(i)
                }
            }
            this.autofillZombies(
                stateObject.zombieCount,
                stateObject.zombieOccupiedHexes,
                stateObject.zombieHeadHexes,
                zombieUnoccupiedHexes
            )
        }
    }

    autofillHumans(startHumans, startVaccinated, startHumanHexes, startVaccinatedHexes, startUnoccupied) {
        let stateObject = this.state
        let humanCount = startHumans
        let vaccinatedCount = startVaccinated
        let humanOccupiedHexes = startHumanHexes
        let vaccinatedOccupiedHexes = startVaccinatedHexes
        let humanUnoccupiedHexes = startUnoccupied

        for (let i=0; i<humanCount; i++) {
            let chosenIndex = randomInteger(0, humanUnoccupiedHexes.length - 1)
            let chosenHex = humanUnoccupiedHexes[chosenIndex]
            humanOccupiedHexes.push(chosenHex)
            humanUnoccupiedHexes = deleteAtIndex(humanUnoccupiedHexes, chosenIndex)
        }
        if (stateObject.vaccination) {
            for (let i=0; i<vaccinatedCount; i++) {
                let chosenIndex = randomInteger(0, humanUnoccupiedHexes.length - 1)
                let chosenHex = humanUnoccupiedHexes[chosenIndex]
                vaccinatedOccupiedHexes.push(chosenHex)
                humanUnoccupiedHexes = deleteAtIndex(humanUnoccupiedHexes, chosenIndex)
            }
        }
        if (stateObject.mode==="hotseat") {
            humanCount = 0
            this.setState(
                {
                    humanOccupiedHexes: humanOccupiedHexes,
                    vaccinatedOccupiedHexes: vaccinatedOccupiedHexes,
                    humanCount: humanCount
                }
            )
            setTimeout(() => {
                    this.setState(
                        {
                            whoseTurn: "Zombies",
                            hiddenHumanHexes: stateObject.humanOccupiedHexes,
                            hiddenVaccinatedHexes: stateObject.vaccinatedOccupiedHexes,
                            humanOccupiedHexes: [],
                            vaccinatedOccupiedHexes: []
                        }
                    )
                }, 1500
            )
        }
        return {
            humanOccupiedHexes: humanOccupiedHexes,
            vaccinatedOccupiedHexes: vaccinatedOccupiedHexes
        }
    }

    autofillZombies(startZombies, startZombieHexes, startZombieHeads, startUnoccupied) {
        let stateObject = this.state
        let zombieCount = startZombies
        let numZombieArms = stateObject.numZombieArms
        let zombieOccupiedHexes = startZombieHexes
        let zombieUnoccupiedHexes = startUnoccupied
        let zombieHeadHexes = startZombieHeads

        function randomHeadAlgorithm() {
            //This is the first algorithm for deciding where to put the zombies.
            //For each zombie:
            //1. A hex is randomly chosen from the set of hexes which are currently unoccupied by other zombies (including their arms).
            //2. Unoccupied hexes which surround the chosen head hex are identified.
            //3. The hexes which will be occupied by the zombie's arms are randomly chosen out of the available surrounding hexes.
            //4. Lists containing information about where zombies are located are updated.
            //Importantly, each zombie can only claim *available hexes* around it. If a zombie runs out of available hexes, it will simply have less (or even zero) arms.
            //This means that sometimes zombies will have less than the selected number of arms when there are no more available spaces around the chosen head.

            for (let i=0; i<zombieCount; i++) {
                if (zombieUnoccupiedHexes.length===0) break;
                let chosenIndex = randomInteger(0, zombieUnoccupiedHexes.length-1)
                let chosenHex = zombieUnoccupiedHexes[chosenIndex]
    
                let surroundingHexes = findSurroundingHexes(chosenHex)
                let armOptions = []
                for (let hex of surroundingHexes) {
                    if (!zombieOccupiedHexes.includes(hex)) armOptions.push(hex)
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
                zombieUnoccupiedHexes = deleteAtIndex(
                    zombieUnoccupiedHexes,
                    zombieUnoccupiedHexes.findIndex(element => element===chosenHex)
                )
            }
        }

        function slideAlgorithm() {
            //This algorithm works similarly to the random head algorithm, with some changes that slow it down,
            //but enable zombies to always have the maximum number of arms, so long as the selected number of arms is 0-2.
            //Differences:
            // * Once a spot for a head is chosen, if there is not a sufficient number of surrounding hexes available,
            //   that hex is added to a new list of suboptimal hexes. A new head hex is chosen randomly that is neither occupied
            //   nor on this new list.
            // * Eventually, unoccupied hexes that are not on the suboptimal list will run out. at that point, a head is chosen along with
            //   two random arms from the list of suboptimal hexes. Zombies in between each arm and the head are progressively moved out of the way so
            //   that the arm hexes can move into contact with the head until they are adjacent.
            // * Once the arm hexes and head hex are adjacent, the new zombie is placed.
            // Importantly, zombies can always be slid out of the way if their arm count is less than 3. With 3 or more arms, the algorithm will not always work
            // and therefore shouldn't be used (zombies with more arms sometimes can't slide cleanly out of the way without disrupting other zombies).

            let suboptimalHexes = []
            let breakFlag = false
            function placeZombie() {
                if (zombieUnoccupiedHexes.length>0) { //optimal only phase
                    //Choose head hex
                    let chosenIndex = randomInteger(0, zombieUnoccupiedHexes.length-1)
                    let chosenHex = zombieUnoccupiedHexes[chosenIndex]
                    
                    //identify surrounding hexes
                    let surroundingHexes = findSurroundingHexes(chosenHex)
                    let armOptions = []
                    for (let hex of surroundingHexes) {
                        if (!zombieOccupiedHexes.includes(hex)) armOptions.push(hex)
                    }
    
                    if (armOptions.length < numZombieArms) { //if chosenHex is subopt
                        suboptimalHexes.push(chosenHex)
                        zombieUnoccupiedHexes = deleteAtIndex(
                            zombieUnoccupiedHexes,
                            zombieUnoccupiedHexes.findIndex(element => element===chosenHex)
                        )
                        placeZombie() //start over trying to find a spot for this zombie
                    } else {
                        let theArmIndices = []
                        let theArmHexes = []
                        for (let j=0; j<numZombieArms; j++) {
                            if (armOptions.length===0) break;
                            theArmIndices[j] = randomInteger(0, armOptions.length - 1)
                            theArmHexes[j] = armOptions[theArmIndices[j]]
                            armOptions = deleteAtIndex(armOptions, theArmIndices[j])
                        }
            
                        zombieHeadHexes[chosenHex] = theArmHexes
                        zombieOccupiedHexes.push(chosenHex)
                        for (let j=0; j<theArmHexes.length; j++) {
                            zombieOccupiedHexes.push(theArmHexes[j])
                            if (zombieUnoccupiedHexes.includes(theArmHexes[j])) {
                                zombieUnoccupiedHexes = deleteAtIndex(
                                    zombieUnoccupiedHexes,
                                    zombieUnoccupiedHexes.findIndex(element => element===theArmHexes[j])
                                )
                            } else if (suboptimalHexes.includes(theArmHexes[j])) {
                                suboptimalHexes = deleteAtIndex(
                                    suboptimalHexes,
                                    suboptimalHexes.findIndex(element => element===theArmHexes[j])
                                )
                            }
                        }
                        zombieUnoccupiedHexes = deleteAtIndex(
                            zombieUnoccupiedHexes,
                            zombieUnoccupiedHexes.findIndex(element => element===chosenHex)
                        )
                    }

                } else if (suboptimalHexes.length > 0) { //the only hexes left are suboptimal
                    console.log("Ran out of optimal hexes. trying to move these hexes together:", suboptimalHexes)
                    //move the hexes together
                    //Choose head hex
                    let chosenIndex = randomInteger(0, suboptimalHexes.length-1)
                    let chosenHex = suboptimalHexes[chosenIndex]
                    let chosenArmHexes = []
                    suboptimalHexes = deleteAtIndex(suboptimalHexes, chosenIndex)
                    for (let j = 0; j<numZombieArms; j++) {            //randomly choose new arms
                        if (suboptimalHexes.length>0) { //esc if there aren't enough remaining hexes
                            let chosenArmIndex = randomInteger(0, suboptimalHexes.length - 1)
                            chosenArmHexes.push(suboptimalHexes[chosenArmIndex])
                            suboptimalHexes = deleteAtIndex(suboptimalHexes, chosenArmIndex) //the chosen arm hexes aren't "empty" anymore
                        } else {
                            break;
                        }
                    }

                    function arrangeZombie(hexArray) { //takes adjacent hexes and outputs the loc of head and arms.
                        let numArms = hexArray.length - 1
                    
                        let count = 0
                        let newArms = []
                        for (let hex of hexArray) {
                            count = 0
                            newArms = []
                            let theSurroundingHexes = findSurroundingHexes(hex)
                            for (let otherHex of hexArray) {
                                if (hex!==otherHex && theSurroundingHexes.includes(otherHex)) {
                                    count++
                                    newArms.push(otherHex)
                                }
                            }
                            if (count===numArms) {
                                return [hex, newArms]
                            }
                        }
                        return false //the hexes are non-adjacent
                    }

                    function findViableZombie(reqHex, otherHexes, numArms) { //reqHex must be a part of the final zombie (the old hex that should be left behind)
                        let currentHexes = [reqHex]
                        let returnThis;
                        let breakFlag = false
                        
                        function setNextArm(armsLeft) {
                            for (let i=0; i<otherHexes.length; i++) {
                                if (otherHexes[i]!==currentHexes[numArms - armsLeft] && !breakFlag) {
                                    currentHexes[numArms - (armsLeft) + 1] = otherHexes[i]
                                    console.log(currentHexes, arrangeZombie(currentHexes), currentHexes.length===(numArms+1))
                                    if (arrangeZombie(currentHexes) && currentHexes.length===(numArms+1)) {
                                        returnThis = arrangeZombie(currentHexes)
                                        breakFlag = true
                                        break;
                                    }
                                }
                                if (armsLeft>1) setNextArm(armsLeft - 1)
                            }
                        }
                        setNextArm(numArms)
                        return returnThis
                    }

                    function selectHex(currentHex, targetHex) {
                        let horizontalDifference = hPosition(targetHex) - hPosition(currentHex)
                        let verticalDifference = vPosition(targetHex) - vPosition(currentHex)
                        let options = []
                        if (horizontalDifference > 0) options.push([currentHex + 10, "right"]) //right
                        else if (horizontalDifference < 0) options.push([currentHex - 10, "left"]) //left
                        if (verticalDifference > 0) options.push([currentHex + 1, "down"]) //down
                        else if (verticalDifference < 0) options.push([currentHex - 1, "up"]) //up
                        console.log("currentHex:", currentHex, "targetHex:", targetHex)
                        if (options.length===1) return options[0]
                        else if (options.length===2) {
                            if (Math.abs(horizontalDifference) > Math.abs(verticalDifference)) return options[0]
                            else if (Math.abs(horizontalDifference) < Math.abs(verticalDifference)) return options[1]
                            else return options[randomInteger(0, 1)] // to make the code zany and whacky, if two options seem equally viable we'll choose randomly between them
                                                                    //the actual reason is randomness can help prevent some inf loops
                        }
                    }

                    function moveHex(currentHex, targetHex, suboptHexes, zombiePositions, currentArms) { //start, target, suboptimalHexes, zombieHeadHexes
                        let returnObject = {
                            suboptimalHexes: suboptHexes,
                            zombieHeadHexes: zombiePositions,
                            newHexPosition: currentHex,
                            currentArmHexes: currentArms
                        }
                        let selectedHexResult = selectHex(currentHex, targetHex)
                        let selectedHex = selectedHexResult[0]
                        let direction = selectedHexResult[1]
                        console.log("starting hex:", currentHex, "target hex:", targetHex, "selected hex:", selectedHex, "direction:", direction)

                        if (suboptHexes.includes(selectedHex)) { //if the hex in the direction is empty, just take that one instead
                            returnObject.suboptimalHexes.push(currentHex)
                            returnObject.newHexPosition = selectedHex 
                            returnObject.suboptimalHexes = deleteAtIndex(
                                returnObject.suboptimalHexes, returnObject.suboptimalHexes.findIndex(element => element===selectedHex)
                            )
                            console.log("(hex was free)")
                        } else if (currentArms.includes(selectedHex)) { //if the selected hex is an arm
                            //swap them
                            returnObject.newHexPosition = selectedHex
                            let armIndex = returnObject.currentArmHexes.findIndex(element => element===selectedHex)
                            returnObject.currentArmHexes[armIndex] = currentHex
                            console.log("encountered an arm. now the arms are:", returnObject.currentArmHexes)
                        } else {
                            let aroundSelectedHex = findSurroundingHexes(selectedHex); aroundSelectedHex.push(selectedHex)
                            for (let headHex of aroundSelectedHex) { //check hexes around the selected hex to look for the head of the selected zombie
                                if (zombiePositions[headHex] && (headHex===selectedHex || zombiePositions[headHex].includes(selectedHex))) {
                                    console.log("selected zombie head:", headHex, "arms:", zombiePositions[headHex])
                                    let selectedZombieHexes = arrayCopy(zombiePositions[headHex])
                                    selectedZombieHexes.push(headHex)
                                    if (direction==="up") selectedZombieHexes = selectedZombieHexes.sort((a, b) => a%10 - b%10)
                                    else if (direction==="down") selectedZombieHexes = selectedZombieHexes.sort((a, b) => b%10 - a%10)
                                    else if (direction==="left") selectedZombieHexes = selectedZombieHexes.sort((a, b) => a - b)
                                    else if (direction==="right") selectedZombieHexes = selectedZombieHexes.sort((a, b) => b - a)
                                    returnObject.zombieHeadHexes[headHex] = 0 //delete old zombie from zombieheadhexes
                                    //------figure out new zombie--------//
                                    let newZombieHexes = deleteAtIndex(selectedZombieHexes, 0) //the new zombie will occupy everything but the newly chosen empty hex
                                    newZombieHexes.push(currentHex) //including where the old empty hex used to be
                                    console.log("selectedZombieHexes:", selectedZombieHexes, "newZombieHexes:", newZombieHexes)
                                    let newHeadResult = arrangeZombie(newZombieHexes)
                                    if (!newHeadResult) {
                                        console.log("couldn't arrange, trying to findViableZombie...")
                                        let viableZombie = findViableZombie(currentHex, selectedZombieHexes, numZombieArms)
                                        returnObject.zombieHeadHexes[viableZombie[0]] = viableZombie[1]
                                        for (let hex of selectedZombieHexes) {
                                            if (viableZombie[0]!==hex && !viableZombie[1].includes(hex)) {
                                                returnObject.newHexPosition = hex
                                                break;
                                            }
                                        }
                                        console.log("the new zombie has head", viableZombie[0], "and arms", viableZombie[1])
                                    } else {
                                        returnObject.zombieHeadHexes[newHeadResult[0]] = newHeadResult[1]
                                        returnObject.newHexPosition = selectedZombieHexes[0] //our empty hex has moved
                                    }

                                    console.log("newHexPosition:", returnObject.newHexPosition, "suboptimalHexes:", returnObject.suboptimalHexes)
                                    break;
                                }
                            }
                        }
                        return returnObject
                    }

                    console.log(
                        "//-----------------//------------------//",
                        "trying to connect arm hexes: ",
                        chosenArmHexes,
                        "to chosen head hex:",
                        chosenHex,
                        "here are the subopt hexes:",
                        suboptimalHexes
                        )
                        
                    let currentHeadHex = chosenHex
                    let currentArmHexes = chosenArmHexes
                    let surroundingHexes = findSurroundingHexes(chosenHex)
                    let targetForHead = chosenArmHexes[0]
                    let allZombieHexes = arrayCopy(chosenArmHexes); allZombieHexes.push(chosenHex)


                    let x = 0
                    while (!arrangeZombie(allZombieHexes) && x<1000) { //until
                        console.log("moving the head...")
                        let moveHeadResult = moveHex(currentHeadHex, targetForHead, suboptimalHexes, zombieHeadHexes, currentArmHexes)
                        suboptimalHexes = moveHeadResult.suboptimalHexes
                        zombieHeadHexes = moveHeadResult.zombieHeadHexes
                        currentHeadHex = moveHeadResult.newHexPosition
                        surroundingHexes = findSurroundingHexes(currentHeadHex)
                        allZombieHexes = arrayCopy(currentArmHexes); allZombieHexes.push(currentHeadHex)
                        if (arrangeZombie(allZombieHexes)) break
                        for (let i_=0; i_<currentArmHexes.length; i_++) {
                            console.log("moving arm #", i_, "which is hex#:", currentArmHexes[i_], "toward currentHeadHex", currentHeadHex)
                            if (!surroundingHexes.includes(currentArmHexes[i_])) {
                                let moveArmResult = moveHex(currentArmHexes[i_], currentHeadHex, suboptimalHexes, zombieHeadHexes, currentArmHexes)
                                suboptimalHexes = moveArmResult.suboptimalHexes
                                zombieHeadHexes = moveArmResult.zombieHeadHexes
                                currentArmHexes[i_] = moveArmResult.newHexPosition
                                allZombieHexes = arrayCopy(currentArmHexes); allZombieHexes.push(currentHeadHex)
                                if (arrangeZombie(allZombieHexes)) break
                            }
                        }
                        targetForHead = currentArmHexes[0]
                        if (surroundingHexes.includes(targetForHead)) { //if the head has reached its target, change the target by cycling the arms
                            console.log("head hex", currentHeadHex, "is adjacent to old target ", targetForHead)
                            currentArmHexes.push(currentArmHexes[0])
                            currentArmHexes = currentArmHexes.slice(1, currentArmHexes.length)
                        }
                        console.log("new targetForHead:", targetForHead)
                        x++
                    }
                    if (x>=1000) {
                        console.log("inf loop failure. could not connect arm hexes", currentArmHexes, "to current head hex", currentHeadHex)
                        breakFlag = true
                    } else {
                        if (!isASubset(currentArmHexes, surroundingHexes)) {
                            let arrangeZombieResult = arrangeZombie(allZombieHexes)
                            currentHeadHex = arrangeZombieResult[0]
                            currentArmHexes = arrangeZombieResult[1]
                        }
                        console.log("success! our new zombie is at hex", currentHeadHex, "with arms at", currentArmHexes)
                        zombieHeadHexes[currentHeadHex] = currentArmHexes
                    }
                } else {
                    breakFlag = true
                }
            }

            for (let i=0; i<zombieCount; i++) {
                if (!breakFlag) {
                    placeZombie()
                } else {
                    break;
                }
            }
            zombieOccupiedHexes = []
            for (let i=0; i<100; i++) {
                if (zombieHeadHexes[i]) {
                    zombieOccupiedHexes.push(i)
                    zombieOccupiedHexes = zombieOccupiedHexes.concat(zombieHeadHexes[i])
                }
            }
        }

        function slotsAlgorithm() {
            //This is the third algorithm for deciding where to put the zombies.
            //Each number of zombie arms has its own set of slots. Each zombie occupies one slot.
            //For each zombie:
            //1. A slot is randomly chosen from the set of unoccupied slots with the current maximum number of hexes.
            //2. repeat
            let slotArray = [
                [ //0 arms
                    []      //slot set 0
                ],
                [[]], //1 arm
                [ //2 arms
                    [   // slot set 0 (2 arms)
                        [19, [9, 29]],
                        [49, [39, 59]],
                        [79, [69, 89]]
                    ],      
                    [  //slot set 1 (0 arms)         
                        [99, []]
                    ] 
                ],
                [[]], //3 arms
                [[]], //4 arms
            ]
            //building the sets of slots
            let headPosition;
            if (numZombieArms===0) {
                for (let i=0; i<100; i++) {
                    slotArray[0][0][i] = [i, []]
                }
            } else if (numZombieArms===1) {
                for (let i=0; i<50; i++) {
                    slotArray[1][0][i] = [2*i, [2*i+1]]
                }
            } else if (numZombieArms===2) {
                headPosition = 1
                for (let i=0; i<30; i++) {
                    slotArray[2][0][i+3] = [headPosition, [headPosition-1, headPosition+1]]
                    headPosition += 3
                    if (headPosition%10===0) headPosition++
                }
            } else if (numZombieArms===3) {
                headPosition = 1
                for (let i=0; i<25; i++) {
                    slotArray[3][0][i] = [headPosition, [headPosition-1, headPosition+9, headPosition+10]]
                    headPosition += 2
                    if (((headPosition - headPosition%10)/10)%2) headPosition += 10
                }
            } else if (numZombieArms===4) {
                headPosition = 1
                for (let i=0; i<20; i++) {
                    if (i<10) {
                        slotArray[4][0][i] = 
                            [
                                headPosition,
                                [headPosition-1, headPosition+9, headPosition+10, headPosition+1]
                            ]
                        headPosition += 5
                        if (((headPosition - headPosition%10)/10)%2) headPosition += 10
                    } else {
                        if (i===10) headPosition = 13
                        slotArray[4][0][i] = 
                            [
                                headPosition,
                                [headPosition-1, headPosition-10, headPosition-9, headPosition+1]
                            ]
                        headPosition += 5
                        if (!(((headPosition - headPosition%10)/10)%2)) headPosition += 10
                    }
                }
            }
            
            let currentSlots = arrayCopy(slotArray[numZombieArms][0])
            for (let i=0; i<zombieCount; i++) {
                console.log("placing zombie #", i)
                if (currentSlots.length===0 && !slotArray[numZombieArms][1]) break;
                else if (currentSlots.length===0) currentSlots = slotArray[numZombieArms][1]
                let chosenIndex = randomInteger(0, currentSlots.length - 1)
                let chosenSlot = currentSlots[chosenIndex]
                console.log("chosen zombie:", chosenSlot)
                let chosenHead = chosenSlot[0]
                let chosenArms = chosenSlot[1]
    
                zombieHeadHexes[chosenHead] = chosenArms
                zombieOccupiedHexes.push(chosenHead)
                zombieOccupiedHexes = zombieOccupiedHexes.concat(chosenArms)
                currentSlots = deleteAtIndex(currentSlots, chosenIndex)
            }
        }

        //------//

        if (stateObject.algorithm==="random-head") randomHeadAlgorithm()
        else if (stateObject.algorithm==="slide") slideAlgorithm()
        else if (stateObject.algorithm==="slots") slotsAlgorithm()

        //-----//

        if (stateObject.mode==="hotseat") { 
            // zombieCount = 0 ?
            this.setState(
                {
                    whoseTurn: "wait",
                    humanOccupiedHexes: stateObject.hiddenHumanHexes,
                    vaccinatedOccupiedHexes: stateObject.hiddenVaccinatedHexes
                }
            )
            this.calcNewInfections(this.state)
        }

        this.setState(
            {
                zombieHeadHexes: zombieHeadHexes,
                zombieOccupiedHexes: zombieOccupiedHexes,
                zombieCount: zombieCount

            }
        )

        return {
            zombieHeadHexes: zombieHeadHexes,
            zombieOccupiedHexes: zombieOccupiedHexes
        }
    }

    nextRoundHotseat() {
        if ((this.state.humanCount===0 && this.state.vaccinatedCount===0) || this.state.zombieCount===0) return
        this.setState(
            {
                whoseTurn: "Humans",
                humanOccupiedHexes: [],
                vaccinatedOccupiedHexes: [],
                zombieOccupiedHexes: [],
                zombieHeadHexes: []
            }
        )
    }

    calcNewInfections(inputObject) {
        let stateObject = this.state
        let roundsCompleted = stateObject.roundsCompleted
        let vaccineEffectiveness = stateObject.vaccineEffectiveness
        let mortality = stateObject.mortality
        let mortalityNum = stateObject.mortalityNum

        let history = inputObject.history
        let humanCount = history[roundsCompleted].humanCount
        let vaccinatedCount = history[roundsCompleted].vaccinatedCount
        let zombieCount = history[roundsCompleted].zombieCount
        let humanOccupiedHexes = inputObject.humanOccupiedHexes
        let vaccinatedOccupiedHexes = inputObject.vaccinatedOccupiedHexes
        if (stateObject.mode==="hotseat") {
            humanOccupiedHexes = stateObject.hiddenHumanHexes
            vaccinatedOccupiedHexes = stateObject.hiddenVaccinatedHexes
        }
        let zombieOccupiedHexes = inputObject.zombieOccupiedHexes

        if (mortality && roundsCompleted >= mortalityNum) {
            zombieCount -= history[roundsCompleted - mortalityNum].newInfections
        }

        let infectedVaccinatedHexes = []
        let newInfections = 0
        let newVaccinatedInfections = 0
        for (let hex of zombieOccupiedHexes) {
            if (humanOccupiedHexes.includes(hex)) newInfections++
            if (vaccinatedOccupiedHexes.includes(hex)) {
                let roll = Math.random()
                if (roll>=(vaccineEffectiveness/100)) {
                    newVaccinatedInfections++
                    infectedVaccinatedHexes.push(hex)
                }
            }
        }
        humanCount -= newInfections
        vaccinatedCount -= newVaccinatedInfections
        zombieCount += (newInfections + newVaccinatedInfections)
        roundsCompleted++
        history[roundsCompleted] = 
            {
                humanCount: humanCount,
                zombieCount: zombieCount,
                newInfections: newInfections + newVaccinatedInfections,
                vaccinatedCount: vaccinatedCount
            }
        if (mortality && roundsCompleted >= mortalityNum) { //we have to do this twice because the
                //first time took from history, which is before we subtracted
            zombieCount -= history[roundsCompleted - mortalityNum].newInfections
            if (zombieCount===0) {
                history.push(
                    {
                        humanCount: humanCount,
                        zombieCount: 0,
                        newInfections: 0,
                        vaccinatedCount: vaccinatedCount
                    }
                )
            }
        }
        this.setState(
            {
                zombieCount: zombieCount,
                humanCount: humanCount,
                vaccinatedCount: vaccinatedCount,
                roundsCompleted: roundsCompleted,
                history: history,
                infectedVaccinatedHexes: infectedVaccinatedHexes,
                // theGraph: this.createGraph(
                //     history,
                //     stateObject.vaccination,
                //     mortality
                // )
            }
        )
    }

    restart() {
        this.setState(
            {
                roundsCompleted: 0,
                humanOccupiedHexes: [],
                zombieOccupiedHexes: [],
                vaccinatedOccupiedHexes: [],
                zombieHeadHexes: makeZeroesArray(100),
                humanCount: this.state.history[0].humanCount || 50,
                vaccinatedCount: this.state.history[0].vaccinatedCount || 0,
                zombieCount: this.state.history[0].zombieCount || 1,
                history: [],
                gameStarted: false,
                whoseTurn: "Humans",
                placeHeadOrArm: "head",
                currentHeadHex: 0,
                numArmsRemaining: 0,
                theGraph: null
            }
        )
    }

//------------------------------------------------------------------------------------------------------------------------//

//------------------------------------------------------------------------------------------------------------------------//

    render() {
        return (
            <div id="outer">
                <div id="main">
                    {this.displayBoard(this.state)}
                    <div id="middle-div">
                        {this.displayControls(this.state)}
                        {this.displayStatusInfo(this.state)}
                    </div>
                    <div id="data">
                        {this.displayHistoryTable(this.state.history, this.state.gameStarted)}
                        {/* {this.state.theGraph} */}
                    </div>
                </div>
                <label id="reference">
                    Based on a game concept by Jim Powell and Matt Lewis: <a href=
                    "https://digitalcommons.usu.edu/lemb/1/">https://digitalcommons.usu.edu/lemb/1/</a>.
                </label>
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
    if (index>=array.length || index<0) throw ("error", array, index)
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

function findSurroundingHexes(hex) {
    let surroundingHexes;
    if (((hex-hex%10)/10)%2) {//if it's an odd column
        surroundingHexes = [hex-1, hex+10, hex+11, hex+1, hex-9, hex-10]
    } else {                                //even column
        surroundingHexes = [hex-1, hex+9, hex+10, hex+1, hex-10, hex-11]
    }
    if (hex%10===0) { //if it's on the top (get rid of stuff above)
        surroundingHexes[0] = null
        if (!(((hex-hex%10)/10)%2)) {  //if it's an even column
            surroundingHexes[1] = null
            surroundingHexes[5] = null
        }   
    } else if (hex%10===9) { //if it's on the bottom (get rid of stuff below)
        surroundingHexes[3] = null
        if (((hex-hex%10)/10)%2) { //odd column
            surroundingHexes[2] = null
            surroundingHexes[4] = null
        }
    }
    if (hex<10) { //left side (get rid of stuff on the left)
        surroundingHexes[4] = null
        surroundingHexes[5] = null
    } else if (hex>=90) { //right side (get rid of stuff on the right)
        surroundingHexes[1] = null
        surroundingHexes[2] = null
    }

    let returnArray = []
    for (let anotherHex of surroundingHexes) {
        if (anotherHex!==null) {
            returnArray.push(anotherHex)
        }
    }
    return returnArray
}

function arrayCopy(array) {
    let returnArray = []
    for (let element of array) {
        returnArray.push(element)
    }
    return returnArray
}

function hPosition(hex) {
    return (hex - hex%10)/10
}

function vPosition(hex) {
    return hex%10
}

function isASubset(smallArray, bigArray) {
    for (let value of smallArray) {
        if (!bigArray.includes(value)) return false
    }
    return true
}

export default App;

//graph