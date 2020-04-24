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
            function slideAlgorithmInner() {
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
                        let flag = false
                        
                        function setNextArm(armsLeft) {
                            for (let i=0; i<otherHexes.length; i++) {
                                if (flag===true) return arrangeZombie(currentHexes)
                                if (otherHexes[i]!==currentHexes[numArms - armsLeft]) {
                                    currentHexes[numArms - (armsLeft) + 1] = otherHexes[i]
                                    if (arrangeZombie(currentHexes) && currentHexes.length===(numArms+1)) {
                                        flag = true
                                        return
                                    }
                                }
                                if (armsLeft>1) setNextArm(armsLeft - 1)
                            }
                        }
                        return (setNextArm(numArms))
                    }

                    function selectHex(currentHex, targetHex) {
                        let horizontalDifference = hPosition(targetHex) - hPosition(currentHex)
                        let verticalDifference = vPosition(targetHex) - vPosition(currentHex)
                        let options = []
                        if (horizontalDifference > 0) options.push([currentHex + 10, "right"]) //right
                        else if (horizontalDifference < 0) options.push([currentHex - 10, "left"]) //left
                        if (verticalDifference > 0) options.push([currentHex + 1, "down"]) //down
                        else if (verticalDifference < 0) options.push([currentHex - 1, "up"]) //up
                        console.log("options:", options, "currentHex:", currentHex, "targetHex:", targetHex)
                        if (options.length===0 || options.length > 2) throw "whoops" //should be length 1 or 2; could be 0 if currentHex===targetHex (shouldnt be an input)
                        else if (options.length===1) return options[0]
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
                    slideAlgorithmInner()
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

//history
//arm count
//zombie mortality
//vaxx
//hotseat
//zombie spawn options
//      * random, not full
//      * random predet spawns
//input ver