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
            zombieLifeLength: [false, 3],
            history: []
        }
        this.nextRound = this.nextRound.bind(this);
        this.restart = this.restart.bind(this);

        this.humanStartCount = React.createRef();
        this.zombieStartCount = React.createRef();
        this.numZombieArms = React.createRef();
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
        let historyTable = null
        let historyTableRows = []
        let nextRoundButtonTextColor = "black"
        let inputTextColor = "gray"
        let inputReadOnlyStatus = true
        if (stateObject.humanCount===0) nextRoundButtonTextColor = "gray"
        if (stateObject.roundsCompleted===0) {
            theButtons = <button onClick={this.nextRound}>start</button>
            inputTextColor = "black"
            inputReadOnlyStatus = false
        } else {
            theButtons = [
                <div className="col-item" key="0">
                    <button onClick={this.nextRound} style={{color: nextRoundButtonTextColor}}>next round</button>
                </div>,
                <div className="col-item" key="1">
                    <button onClick={this.restart}>restart</button>
                </div>
            ]
            for (let round in stateObject.history) {
                historyTableRows.push(
                    <tr key={round}>
                        <td>{round}</td>
                        <td>{stateObject.history[round].humanCount}</td>
                        <td>{stateObject.history[round].zombieCount}</td>
                    </tr>
                )
            }
            historyTable = [
                <table key="0">
                    <tbody>
                        <tr>
                            <th>Round #</th>
                            <th>Human Count</th>
                            <th>Zombie Count</th>
                        </tr>
                        {historyTableRows}
                    </tbody>
                </table>
            ]
        }

        return (
            <div id="controls">
                <div id="col-0" className="column"> {/* buttons*/}
                    {theButtons}
                </div>
                <div id="col-1" className="column"> {/*initial condition settings*/}
                    <div className="col-item" key="0">  {/* initial condition settings*/}
                        <label>Human Start Count</label>
                        <input
                            type="number" className="num-input" id="human-start-count" style={{color: inputTextColor}}
                            defaultValue="50" ref={this.humanStartCount} readOnly={inputReadOnlyStatus}
                        />
                    </div>
                    <div className="col-item" key="1">
                        <label>Zombie Start Count</label>
                        <input
                            type="number" className="num-input" id="zombie-start-count" style={{color: inputTextColor}}
                            defaultValue="1" ref={this.zombieStartCount} readOnly={inputReadOnlyStatus}
                        />
                    </div>
                    <div className="col-item" key="2">
                        <label># of Zombie Arms</label>
                        <input
                            type="number" className="num-input" id="num-zombie-arms" style={{color: inputTextColor}}
                            defaultValue="2" ref={this.numZombieArms} readOnly={inputReadOnlyStatus}
                        />
                    </div>
                </div>
                <div id="col-2" className="column">   {/* status*/}
                    {historyTable}
                </div>
            </div>
        )
    }

    nextRound() {
        let stateObject = this.state
        if (stateObject.humanCount===0) return
        let humanCount = stateObject.humanCount
        let zombieCount = stateObject.zombieCount
        let numZombieArms = stateObject.numZombieArms
        let history = this.state.history
        if (stateObject.roundsCompleted===0) {
            humanCount = Number(this.humanStartCount.current.value)
            zombieCount = Number(this.zombieStartCount.current.value)
            numZombieArms = Number(this.numZombieArms.current.value)
            history.push(
                {
                    humanCount: humanCount,
                    zombieCount: zombieCount
                }
            )
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
            //   two random arms. Zombies in between each arm and the head are progressively moved out of the way so that the arm hexes can move
            //   into contact with the head until they are adjacent.
            // * Once the arm hexes and head hex are adjacent, the new zombie is placed.
            // Importantly, zombies can always be slid out of the way if their arm count is less than 3. With 3 or more arms, the algorithm will not always work
            // and therefore shouldn't be used (zombies with more arms sometimes can't slide cleanly out of the way without disrupting other zombies).

            let suboptimalHexes = []
            let breakFlag = false
            function slideAlgorithmInner() {
                if (zombieUnoccupiedHexes.length>0) {
                    //Choose head hex
                    let chosenIndex = randomInteger(0, zombieUnoccupiedHexes.length-1)
                    let chosenHex = zombieUnoccupiedHexes[chosenIndex]
                    
                    //identify surrounding hexes
                    let surroundingHexes = findSurroundingHexes(chosenHex)
                    let armOptions = []
                    for (let hex of surroundingHexes) {
                        if (!zombieOccupiedHexes.includes(hex)) armOptions.push(hex)
                    }
    
                    if (armOptions.length < numZombieArms) {
                        suboptimalHexes.push(chosenHex)
                        zombieUnoccupiedHexes = deleteAtIndex(
                            zombieUnoccupiedHexes,
                            zombieUnoccupiedHexes.findIndex(element => element===chosenHex)
                        )
                        slideAlgorithmInner() //start over trying to find a spot for this zombie
                    } else {
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

                } else if (suboptimalHexes.length > 0) { //the only hexes left are suboptimal
                    console.log("trying to move hexes together...")
                    //move the hexes together
                    //Choose head hex
                    let chosenIndex = randomInteger(0, suboptimalHexes.length-1)
                    let chosenHex = suboptimalHexes[chosenIndex]
                    let theArmHexes = []
                    //consider checking to see if there are any free spaces around the head
                    suboptimalHexes = deleteAtIndex(suboptimalHexes, chosenIndex)
                    for (let j = 0; j<numZombieArms; j++) {            //randomly choose new arms
                        if (suboptimalHexes.length>0) { //esc if there aren't enough remaining hexes
                            let chosenArmIndex = randomInteger(0, suboptimalHexes.length - 1)
                            theArmHexes.push(suboptimalHexes[chosenArmIndex])
                            suboptimalHexes = deleteAtIndex(suboptimalHexes, chosenArmIndex) //the chosen arm hexes aren't "empty" anymore
                        } else {
                            break;
                        }
                    }
                    let surroundingHexes = findSurroundingHexes(chosenHex)
                    let finalArmHexes = []
                    for (let arm of theArmHexes) {
                        let newArmHex = arm
                        console.log(
                            "trying to connect arm hexes: ",
                            theArmHexes,
                            "to chosen head hex:",
                            chosenHex,
                            "here are the subopt hexes:",
                            suboptimalHexes
                        )
                        let x = 0
                        while (!surroundingHexes.includes(newArmHex) && x<1000) { //until this empty space is adjacent to the chosen head
                            console.log("while loop")
                            if (chosenHex%10 < newArmHex%10) { //select up
                                let selectedHex = newArmHex - 1
                                if (suboptimalHexes.includes(selectedHex)) {
                                    suboptimalHexes.push(newArmHex)
                                    newArmHex = selectedHex //if the hex above is empty, just take that one instead
                                } else {
                                    for (let j=0; j<100; j++) { //check every hex to see which zombie occupies the selected hex (change to not check every hex)
                                        if (zombieHeadHexes[j] && (j===selectedHex || zombieHeadHexes[j].includes(selectedHex))) {
                                            let selectedZombieHexes = zombieHeadHexes[j]
                                            selectedZombieHexes.push(j)
                                            selectedZombieHexes = selectedZombieHexes.sort((a, b) => a%10 - b%10) //put the hexes in order by furthest up to furthest down
                                            zombieHeadHexes[j] = 0 //delete old zombie from zombieheadhexes
                                            //------figure out new zombie
                                            let newZombieHexes = deleteAtIndex(selectedZombieHexes, 0) //the new zombie will occupy everything but the newly chosen empty hex
                                            newZombieHexes.push(newArmHex) //including where the old empty hex used to be
                                            for (let k=0; k<newZombieHexes.length; k++) { //check every hex to see if it is viable for being the new head
                                                let armsCount = 0; //by counting how many arms are adjacent to it (we want this to be equal to numZombieArms)
                                                for (let l=0; l<newZombieHexes.length; l++) { //if the surrounding hexes include everything other than the hex itself
                                                    if (l!==k && findSurroundingHexes(newZombieHexes[k]).includes(newZombieHexes[l])) {
                                                        armsCount++
                                                    }
                                                }
                                                if (armsCount===numZombieArms) {
                                                    zombieHeadHexes[k] = [k, deleteAtIndex(newZombieHexes, k)] //add new zombie to zombieheadhexes
                                                    //make that value of k the new head, the others are the arms
                                                    break;
                                                } else armsCount = 0
                                            }
                                            newArmHex = selectedZombieHexes[0] //our empty hex has moved up (as far up as possible)
                                            break;
                                        }
                                    }
                                }
                            } else if (chosenHex%10 > newArmHex%10) {
                                //select down
                                let selectedHex = newArmHex + 1
                                if (suboptimalHexes.includes(selectedHex)) {
                                    suboptimalHexes.push(newArmHex)
                                    newArmHex = selectedHex //if the hex below is empty, just take that one instead
                                } else {
                                    for (let j=0; j<100; j++) { //check every hex to see which zombie occupies the selected hex (change to not check every hex)
                                        if (zombieHeadHexes[j] && (j===selectedHex || zombieHeadHexes[j].includes(selectedHex))) {
                                            let selectedZombieHexes = zombieHeadHexes[j]
                                            selectedZombieHexes.push(j)
                                            selectedZombieHexes = selectedZombieHexes.sort((a, b) => b%10 - a%10) //put the hexes in order by furthest down to furthest up
                                            zombieHeadHexes[j] = 0 //delete old zombie from zombieheadhexes
                                            //------figure out new zombie
                                            let newZombieHexes = deleteAtIndex(selectedZombieHexes, 0) //the new zombie will occupy everything but the newly chosen empty hex
                                            newZombieHexes.push(newArmHex) //including where the old empty hex used to be
                                            for (let k=0; k<newZombieHexes.length; k++) { //check every hex to see if it is viable for being the new head
                                                let armsCount = 0; //by counting how many arms are adjacent to it (we want this to be equal to numZombieArms)
                                                for (let l=0; l<newZombieHexes.length; l++) { //if the surrounding hexes include everything other than the hex itself
                                                    if (l!==k && findSurroundingHexes(newZombieHexes[k]).includes(newZombieHexes[l])) {
                                                        armsCount++
                                                    }
                                                }
                                                if (armsCount===numZombieArms) {
                                                    zombieHeadHexes[k] = [k, deleteAtIndex(newZombieHexes, k)] //add new zombie to zombieheadhexes
                                                    //make that value of k the new head, the others are the arms
                                                    break;
                                                } else armsCount = 0
                                            }
                                            newArmHex = selectedZombieHexes[0] //our empty hex has moved down (as far up as possible)
                                            break;
                                        }
                                    }
                                }
                            }
                            if (surroundingHexes.includes(newArmHex)) break; //if after we move up or down we are adjacent, stop moving
                            if ((chosenHex - chosenHex%10)/10 < (newArmHex - newArmHex%10)/10) {
                                //select left
                                let selectedHex = newArmHex - 10
                                if (suboptimalHexes.includes(selectedHex)) {
                                    suboptimalHexes.push(newArmHex)
                                    newArmHex = selectedHex //if the hex to the left is empty, just take that one instead
                                } else {
                                    for (let j=0; j<100; j++) { //check every hex to see which zombie occupies the selected hex (change to not check every hex)
                                        if (zombieHeadHexes[j] && (j===selectedHex || zombieHeadHexes[j].includes(selectedHex))) {
                                            let selectedZombieHexes = zombieHeadHexes[j]
                                            selectedZombieHexes.push(j)
                                            selectedZombieHexes = selectedZombieHexes.sort((a, b) => a - b) //put the hexes in order by furthest left to furthest right,
                                                                                                            //then furthest up to furthest down (this prevents choosing a middle hex,
                                                                                                            // which can lead to an exception--no possible zombie)
                                            zombieHeadHexes[j] = 0 //delete old zombie from zombieheadhexes
                                            //------figure out new zombie
                                            let newZombieHexes = deleteAtIndex(selectedZombieHexes, 0) //the new zombie will occupy everything but the newly chosen empty hex
                                            newZombieHexes.push(newArmHex) //including where the old empty hex used to be
                                            for (let k=0; k<newZombieHexes.length; k++) { //check every hex to see if it is viable for being the new head
                                                let armsCount = 0; //by counting how many arms are adjacent to it (we want this to be equal to numZombieArms)
                                                for (let l=0; l<newZombieHexes.length; l++) { //if the surrounding hexes include everything other than the hex itself
                                                    if (l!==k && findSurroundingHexes(newZombieHexes[k]).includes(newZombieHexes[l])) {
                                                        armsCount++
                                                    }
                                                }
                                                if (armsCount===numZombieArms) {
                                                    zombieHeadHexes[k] = [k, deleteAtIndex(newZombieHexes, k)] //add new zombie to zombieheadhexes
                                                    //make that value of k the new head, the others are the arms
                                                    break;
                                                } else armsCount = 0
                                            }
                                            newArmHex = selectedZombieHexes[0] //our empty hex has moved left (if >1 hexes are equally far left, it chooses higher hexes)
                                            break;
                                        }
                                    }
                                }
                            } else if ((chosenHex - chosenHex%10)/10 > (newArmHex - newArmHex%10)/10) {
                                //select right
                                let selectedHex = newArmHex + 10
                                if (suboptimalHexes.includes(selectedHex)) {
                                    suboptimalHexes.push(newArmHex)
                                    newArmHex = selectedHex //if the hex to the right is empty, just take that one instead
                                } else {
                                    for (let j=0; j<100; j++) { //check every hex to see which zombie occupies the selected hex (change to not check every hex)
                                        if (zombieHeadHexes[j] && (j===selectedHex || zombieHeadHexes[j].includes(selectedHex))) {
                                            let selectedZombieHexes = zombieHeadHexes[j]
                                            selectedZombieHexes.push(j)
                                            selectedZombieHexes = selectedZombieHexes.sort((a, b) => b - a) //put the hexes in order by furthest right to furthest left,
                                                                                                            //then furthest down to furthest up (this prevents choosing a middle hex,
                                                                                                            // which can lead to an exception--no possible zombie)
                                            zombieHeadHexes[j] = 0 //delete old zombie from zombieheadhexes
                                            //------figure out new zombie
                                            let newZombieHexes = deleteAtIndex(selectedZombieHexes, 0) //the new zombie will occupy everything but the newly chosen empty hex
                                            newZombieHexes.push(newArmHex) //including where the old empty hex used to be
                                            for (let k=0; k<newZombieHexes.length; k++) { //check every hex to see if it is viable for being the new head
                                                let armsCount = 0; //by counting how many arms are adjacent to it (we want this to be equal to numZombieArms)
                                                for (let l=0; l<newZombieHexes.length; l++) { //if the surrounding hexes include everything other than the hex itself
                                                    if (l!==k && findSurroundingHexes(newZombieHexes[k]).includes(newZombieHexes[l])) {
                                                        armsCount++
                                                    }
                                                }
                                                if (armsCount===numZombieArms) {
                                                    zombieHeadHexes[k] = [k, deleteAtIndex(newZombieHexes, k)] //add new zombie to zombieheadhexes
                                                    //make that value of k the new head, the others are the arms
                                                    break;
                                                } else armsCount = 0
                                            }
                                            newArmHex = selectedZombieHexes[0] //our empty hex has moved right (if >1 hexes are equally far right, it chooses lower hexes)
                                            break;
                                        }
                                    }
                                }
                            }
                            x++
                        }
                        if (x>=1000) {console.log("failure. i was trying to connect stuff but i could not connect arm hex", newArmHex, "to chosen hex", chosenHex); breakFlag = true; break; }
                        console.log("nice, we add this arm placement now:", newArmHex)
                        finalArmHexes.push(newArmHex)
                    }
                    console.log("so our new zombie is at hex", chosenHex, "with arms at", finalArmHexes)
                    // zombieHeadHexes[chosenHex] = finalArmHexes
                } else {
                    breakFlag = true
                }
            }

            for (let i=0; i<zombieCount; i++) {
                if (!breakFlag) {
                    slideAlgorithmInner()
                } else {
                    break;
                }
            }
        }
        //------//
        slideAlgorithm()

        //---//
        let newInfections = 0
        for (let hex of zombieOccupiedHexes) {
            if (humanOccupiedHexes.includes(hex)) newInfections++
        }
        humanCount = humanCount - newInfections
        zombieCount = zombieCount + newInfections
        history.push(
            {
                humanCount: humanCount,
                zombieCount: zombieCount,
                newInfections: newInfections
            }
        )

        this.setState(
            {
                humanOccupiedHexes: humanOccupiedHexes.sort((a, b) => a-b),
                zombieHeadHexes: zombieHeadHexes,
                roundsCompleted: stateObject.roundsCompleted + 1,
                zombieCount: zombieCount,
                humanCount: humanCount,
                numZombieArms: numZombieArms,
                history: history
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
                zombieCount: 1,
                history: []
            }
        )
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
        if (anotherHex) {
            returnArray.push(anotherHex)
        }
    }
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