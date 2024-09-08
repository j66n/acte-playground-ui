import {createMemo, Show} from "solid-js";

function Screen(props) {
    const parser = new DOMParser()

    const screenObj = createMemo(() => {
        if (!props.content) {
            return {}
        }

        const obj = JSON.parse(props.content)

        const doc = parser.parseFromString(obj.screen, "text/html")

        return {
            session_id: obj.session_id,
            screen: build(doc.body, screenObj)
        }
    })

    const build = (bodyDom) => {
        const newDiv = <div class="text-left"></div>

        _buildChildren(newDiv, bodyDom.childNodes)

        return newDiv
    }

    const _buildChildren = (newParent, children) => {
        for (let child of children) {
            switch (child.nodeName) {
                case "DIV":
                    newParent.appendChild(_buildDiv(child))
                    _buildDiv(child)
                    break
                case "INPUT":
                    newParent.appendChild(_buildInput(child, screenObj))
                    break
                case "BUTTON":
                    newParent.appendChild(buildButton(child, screenObj))
                    break
                case "SPAN":
                    newParent.appendChild(buildText(child))
                    break
            }
        }
    }

    const _buildDiv = (divDom) => {
        const newDiv = <div class="my-6 rounded-xl border-2 border-dotted border-gray-500 px-4 py-2"></div>

        _buildChildren(newDiv, divDom.childNodes)

        return newDiv
    }

    const buildText = (textDom) => {
        return <span
            class="inline-block min-h-10 max-w-full p-2 m-1 text-base rounded-xl text-gray-800 whitespace-pre-wrap bg-gray-100 break-words">
            {textDom.textContent}
        </span>
    }


    const buildButton = (buttonDom) => {
        const hint = buttonDom.getAttribute('hint')

        return <div class="relative my-2 inline-block w-full">
            <button
                type="button"
                class="
                bg-[radial-gradient(circle,_#D1D5DB_1px,_transparent_1px)] bg-[size:3px_3px] whitespace-normal break-words
                rounded-xl border-2 border-gray-500 px-3 py-2 text-base hover:bg-gray-300 w-full min-h-12
                "
                onClick={
                    () => props.execute(
                        screenObj().session_id,
                        [{action_type: "press", target_id: buttonDom.id}]
                    )
                }
            >
                <span class="text-gray-800 font-semibold">
                    {buttonDom.innerText}
                </span>

                <Show when={hint != null}>
                    <div class="text-xs text-gray-500">
                        {hint}
                    </div>
                </Show>
            </button>
            <span
                class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-500 bg-white text-xs font-semibold text-gray-800">
                {buttonDom.id}
            </span>
        </div>
    }

    const _buildInput = (inputDom) => {
        let preValue = inputDom.getAttribute('value')

        const hint = inputDom.getAttribute('hint')
        const kind = inputDom.getAttribute('kind')


        return <div class="relative my-2 inline-block w-full text-left">
            <div class="
                px-3 py-2 border-2 border-gray-500 rounded-xl max-h-48 overflow-auto scrollbar-rounded
            ">
                <div class="flex justify-between">
                    <span class="pb-1 text-base font-semibold text-gray-800">
                        {inputDom.name}
                    </span>
                    <span class="text-xs text-gray-500">
                        {kind}
                    </span>
                </div>

                <Show when={hint != null}>
                    <div class="text-xs text-gray-400">
                        {hint}
                    </div>
                </Show>


                <div class="
                    whitespace-pre-wrap
                    border-b-2
                    resize-none outline-none
                    text-base text-gray-800
                    focus:border-gray-500
                    "
                     onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                             e.preventDefault()
                             e.target.blur()
                         }
                     }}
                     onblur={
                         (e) => {
                             const newValue = e.target.textContent

                             if (preValue === newValue) {
                                 return
                             }

                             const actions = []

                             actions.push({
                                 action_type: "fill",
                                 target_id: inputDom.id,
                                 value: newValue
                             })

                             props.execute(
                                 screenObj().session_id,
                                 actions
                             )

                             preValue = newValue
                         }
                     }
                     contenteditable="plaintext-only"
                >{inputDom.getAttribute('value')}</div>

            </div>

            <span
                class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-500 bg-white text-xs font-semibold text-gray-800">
                {inputDom.id}
            </span>
        </div>
    }

    return <>
        <div class="h-full p-4 min-h-96">
            <div class="flex h-full flex-col justify-between rounded-3xl border-2 border-black">
                <div class=" border-b-2 border-black py-4 text-center rounded-t-3xl">
                    <span class="text-2xl font-semibold">Screen</span>
                </div>


                {
                    screenObj().hasOwnProperty('screen') ?
                        <div class="flex-1 overflow-y-auto scrollbar-rounded py-2 px-4 text-center">
                            {screenObj().screen}
                        </div>
                        :
                        <div class="bg-stripes-45 w-full h-full"></div>
                }

                <div class="relative border-t-2 border-black">
                    <div class="flex justify-center py-8 text-center">
                        <button
                            class="w-44 border-r-2 border-white rounded-l-2xl pl-2 py-1 text-lg font-semibold text-white bg-gray-950 hover:bg-gray-600"
                            onClick={props.newSession}
                        >
                            New Session
                        </button>

                        <button
                            class="w-28 border-l-1 border-white rounded-r-2xl py-1 text-lg font-semibold text-white bg-gray-950 hover:bg-gray-600"
                            onClick={() => props.display(screenObj().session_id)}
                        >
                            Display
                        </button>

                    </div>

                    <div class="absolute right-0 bottom-0 left-0 text-center text-xs text-gray-400 pb-0.5">
                        {
                            screenObj().session_id ? `session_id: ${screenObj().session_id}` : ""
                        }
                    </div>
                </div>


            </div>
        </div>
    </>
}


export default Screen
