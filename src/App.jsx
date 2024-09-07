import './App.css'
import Dialog from "./components/dialog/Dialog.jsx";
import Screen from "./components/screen/Screen.jsx";
import Manager from "./core/manager.jsx";
import InputBox from "./components/input-box/InputBox.jsx";

function App() {
    const manager = new Manager()

    return <>
        <div class="flex h-screen">
            {/*left*/}
            <div class="flex flex-1 flex-col justify-between min-h-96 min-w-96">
                {/*left top*/}
                <div class="flex-1 overflow-hidden">
                    <Dialog
                        messages={manager.messages()}
                        viewIndex={manager.viewIndex()}
                        setViewIndex={manager.setViewIndex}
                        scrollDownTrigger={manager.scrollDownTrigger()}
                    ></Dialog>
                </div>


                {/*left bottom*/}
                <div class="flex-none">
                    <InputBox send={(content) => manager.addUserMessage(content)}></InputBox>
                </div>
            </div>

            {/*right*/}
            <div class="h-screen w-96 flex-none">
                <Screen
                    content={manager.viewIndex() !== -1 ? manager.messages()[manager.viewIndex()].content : ''}
                    newSession={() => manager.addUserNewSessionMessage()}
                    display={(sid) => manager.addUserDisplayMessage(sid)}
                    execute={(sid, actions) => manager.addUserExecuteMessage(sid, actions)}
                >
                </Screen>
            </div>
        </div>
    </>
}

export default App
