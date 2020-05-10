import React from 'react'
import zombieArms from './images/zombieArms.png'
import infection from './images/infection.png'
import vaccinationImg from './images/vaccination.png'
import "./style.css"

class Help extends React.Component {
    render() {
        let zombieGame = <strong style={{color: "green"}}>Zombie Game</strong>
        let humans = <strong style={{color: "blue"}}>Humans</strong>
        let human = <strong style={{color: "blue"}}>Human</strong>
        let zombies = <strong style={{color: "red"}}>Zombies</strong>
        let zombie = <strong style={{color: "red"}}>Zombie</strong>
        let removed = <strong style={{color: "purple"}}>Removed</strong>
        let vaccination = <strong style={{color: "lime"}}>Vaccination</strong>
        let vaccinateds = <strong style={{color: "lime"}}>Vaccinated Humans</strong>
        return (
            <div style={{marginLeft: "10px", maxWidth: "750px", display: "flex", flexDirection: "column"}}>
                <p style={{color: "blue", textDecoration: "underline", cursor: "pointer"}} onClick={this.props.changePage}>
                    Go back to the app
                </p>
                <div>
                    <h2>Objective</h2>
                    <p>
                        The {zombieGame} is a simplified representation of how a disease
                        spreads through a population. In this representation, there are two "teams": the {zombies} and the {humans}.
                        The {zombies} win when there are zero {humans} remaining, and the {humans} win when there are zero {zombies} remaining.
                        Note that by default, {zombies} cannot die, so the {humans} will always lose.
                    </p>
                </div>
                <div>
                    <h2>Infection</h2>
                    <p>
                        The {humans} choose which spaces they will occupy, and then the {zombies} choose their spaces without knowledge of where
                        the {humans} are. When the locations of both {humans} and {zombies} are revealed, any {human} covered by a {zombie} is
                        a <strong>New Infection</strong>. This means that next turn, that {human} will no longer be a {human}, and will instead be
                        a {zombie}.
                    </p>
                    <div className="image-box">
                        <img src={infection} alt="infection"></img>
                        <label>A {zombie} with two arms infects one {human}.</label>
                    </div>
                </div>
                <div>
                    <h2>Options</h2>
                    <h3>Start Counts</h3>
                    <p>
                        Every population (except technically {removed}, since it does not affect other populations) has a changeable <strong>
                        Start Count</strong>. This changes how many e.g. {humans} or {zombies} there will be at the beginning of the game. <strong>
                        Start Counts</strong> for {humans} and {zombies} cannot exceed 100.
                    </p>
                    <h3>Number of Zombie Arms</h3>
                    <p>
                        {zombies} have a head and some number of arms between zero and six (inclusive). Each {zombie} occupies the hex where its head is,
                        and then each of its arms occupies a hex around its head. This means that {zombie} with two arms occupies three hexes. 
                        The number of {zombie} arms relates to how infectious the disease is.
                    </p>
                    <div className="image-box">
                        <img src={zombieArms} alt="zombie arms"></img>
                    </div>
                    <h3>Algorithm</h3>
                    <p>
                        When the game decides how to place zombies, it has different ways of making those decisions. To fully understand how they work,
                        you'll have to simply read the code in my <a href="https://github.com/nelsong1997/zombie_game">Github
                        respository</a>, but I will breifly describe them here.
                    </p>
                    <p>
                        The <strong>Random Head</strong> algorithm simply chooses a random open hex to place a given {zombie} head. It then looks for open
                        spaces around that head and randomly places its arms in them. However, if there aren't enough spaces to place all of its arms,
                        the {zombie} gives up and simply doesn't have the specified number of arms.
                    </p>
                    <p>
                        The <strong>Slide</strong> algorithm begins by placing {zombies} randomly in the same way as the <strong>
                        Random Head</strong> algorithm, but if a {zombie} can't place all of its arms, the chosen head hex is added to a list
                        of "<strong>Suboptimal Hexes</strong>" which the algorithm ignores until all of the non-<strong>Suboptimal Hexes</strong> are
                        gone. That's when things get complicated--separated <strong>Suboptimal Hexes</strong> are then joined together by gradually
                        pushing zombies out of the way to get <strong>Suboptimal Hexes</strong> closer together until they are finally touching and
                        a new zombie can be placed. Only usable for arm counts 0-2 (inclusive).
                    </p>
                    <p>
                        The <strong>Slots</strong> algorithm pre-designates "slots," or groups of hexes that {zombies} can occupy. For example, a
                        slot 1 might include hexes 0, 1, and 2, while slot 2 might occupy hexes 3, 4, and 5. If a {zombie} randomly chooses slot 1,
                        it will then occupy hexes 0, 1, and 2. The slots are designed so that zombies will occupy a maximal number of hexes given
                        their number. Only usable for arm counts 0-4 (inclusive).
                    </p>
                    <h3>Vaccination</h3>
                    <p>
                        {vaccination} can help protect {humans} from infection. Enabling {vaccination} creates a new population of {vaccinateds},
                        which have some chance to not get infected when coming into contact with a {zombie}. This chance is determined by the <strong
                        style={{color: "lime"}}>Vaccine Effectiveness</strong> option. When the locations of {zombies} and {humans} are
                        revelaed, {vaccinateds} that did become infected will appear with a sick face emoji next to their "<strong
                        style={{color: "lime"}}>X</strong>," while {vaccinateds} that are still healthy will appear with a smiley face emoji.
                    </p>
                    <div className="image-box">
                        <img src={vaccinationImg} alt="vaccination"></img>
                        <label>A {zombie} encounters two {vaccinateds}, infecting one and not infecting the other.</label>
                    </div>
                    <h3>Zombie Mortality</h3>
                    <p>
                        Sick people don't stay sick forever. This options allows the user to only make {zombies} stick around for some number of days
                        before getting counted as a {removed} person--someone who has either died from the disease, or has recovered and is consequently
                        immune. {removed} people do not appear on the board because they cannot infect others or be infected, but they do appear in the
                        table and graph. This is how {humans} can win!
                    </p>
                </div>
                <div>
                    <h2>Mode</h2>
                    <p>
                        What the heck is a hotseat? Well, it's simply a term for a multiplayer game where different players take turns playing the
                        game, usually switching out who is occupying the seat in front of the computer (hence the term "hotseat"). In other words,
                        in "auto" mode, the computer plays against itself placing randomly, but in "hotseat" mode people can
                        place {humans} and {zombies} where they want. The "autofill" button can be used to play against a computer or if the user
                        doesn't care where the rest of their population is placed.
                    </p>
                </div>
                <p style={{color: "blue", textDecoration: "underline", cursor: "pointer", paddingBottom: "5px"}} onClick={this.props.changePage}>
                    Go back to the app
                </p>
            </div>

        )
    }
}

export default Help