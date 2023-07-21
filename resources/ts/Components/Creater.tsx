export function CreaterUsingButton(){
    return (
    <div className="cr-create-btn">
        <div>+</div>
    </div>
    )
}
function CreaterWindow(){
    return(
        <div className="cr-backwindow">
            <div className="cr-window">
                <div>
                    <h3>Senders</h3>
                    <div></div>
                    <button>Criar novo Sender</button>
                </div>
            </div>
        </div>
    )
}
function L_Reminder(){
    return (
        <div>
            <input type="text" name="url"/>
            <select name="method" id="">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
            </select>
        </div>
    )
}
function Sender(){
    return (
        <div>

        </div>
    )
}
export default function Creater(){

    return (
        <div>
            <CreaterWindow/>
            <CreaterUsingButton/>
        </div>
    )
}