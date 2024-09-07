import {createEffect, createMemo, createSignal, For, onMount} from "solid-js";
import Message from "../message/Message.jsx";

function Dialog(props) {
    let scrollDiv

    createEffect(() => {
        if (props.scrollDownTrigger <= 99) {
            // force
            scrollDiv.scrollTo({
                top: scrollDiv.scrollHeight,
                behavior: 'smooth'
            })
            return
        }

        if (scrollDiv.scrollHeight - scrollDiv.scrollTop <= scrollDiv.clientHeight + 150) {
            scrollDiv.scrollTo({
                top: scrollDiv.scrollHeight,
                behavior: 'smooth'
            })
        }

    })

    const indexedMessageGroups = createMemo(() => {
        const messageGroups = []
        let pre_role = null

        const indexedMessages = props.messages.map((message, index) => {
            return {
                message: message,
                index: index
            }
        })

        for (let message of indexedMessages) {
            switch (message.message.role) {
                case "user":
                    if (pre_role === "user") {
                        messageGroups[messageGroups.length - 1].push(message)
                    } else {
                        messageGroups.push([message])
                        pre_role = "user"
                    }
                    break
                case "assistant":
                    if (pre_role === "assistant") {
                        messageGroups[messageGroups.length - 1].push(message)
                    } else {
                        messageGroups.push([message])
                        pre_role = "assistant"
                    }
                    break
                case "tool":
                    messageGroups[messageGroups.length - 1].push(message)
                    break
            }
        }

        return messageGroups
    })

    const [detail, setDetail] = createSignal(false)

    return <>
        <div class="h-full p-4 min-h-56">
            <div class="flex h-full flex-col rounded-3xl border-2 border-black overflow-hidden">
                <div class="relative border-b-2 border-black py-4 text-center rounded-t-3xl">
                    <span class="text-2xl font-semibold">Dialog</span>


                    <label class="absolute right-2 bottom-1 flex justify-end items-center"
                           onClick={() => {
                               setDetail(!detail())
                           }}>
                        <div class="h-4 w-4 rounded-full ring-2 ring-gray-700 flex justify-center items-center">
                            {
                                detail() ? <div class="h-2 w-2 rounded-full bg-gray-700"></div> : ''
                            }
                        </div>

                        <span class="ml-1 text-gray-700 text-base">detail</span>
                    </label>

                </div>

                <div ref={scrollDiv} class="overflow-y-auto scrollbar-rounded">
                    <For each={indexedMessageGroups()}>
                        {indexedMessageGroup => (
                            <Message indexedMessageGroup={indexedMessageGroup}
                                     viewIndex={props.viewIndex}
                                     setViewIndex={props.setViewIndex}
                                     detail={detail()}
                            ></Message>
                        )}
                    </For>
                </div>
            </div>
        </div>
    </>
}

export default Dialog
