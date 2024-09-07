import {For, Match, Show, Switch} from "solid-js";
import buildJson from "../../core/util/buildJson.jsx";
import hasScreen from "../../core/util/hasScreen.jsx";
import buildBrief from "../../core/util/buildBrief.jsx";

function Message(props) {
    const hasError = (message) => {
        if (message.role !== 'tool') {
            return false
        }

        const parsedMessage = JSON.parse(message.content)

        if (!parsedMessage.hasOwnProperty('session_id')) {
            return true
        }

        return parsedMessage.hasOwnProperty('error_info')
    }

    return <>
        <div class={`flex px-6 py-4 ${props.indexedMessageGroup[0].message.role === 'assistant' ? 'bg-gray-100' : ''}`}>
            <div class="flex w-full overflow-hidden">
                <div class="flex-none flex">
                    <Switch>
                        <Match when={props.indexedMessageGroup[0].message.role === "user"}>
                            <div class="border-4 rounded-full w-6 h-6 border-gray-500"/>
                        </Match>
                        <Match when={props.indexedMessageGroup[0].message.role === "assistant"}>
                            <div class="border-4 w-6 h-6 border-gray-500"/>
                        </Match>
                    </Switch>
                </div>

                <div class="flex flex-col overflow-hidden w-full">
                    <For each={props.indexedMessageGroup}>
                        {(imessage, index) =>
                            <div class={index() === 0 ? '' : 'mt-2'}>
                                <div class="flex h-full">
                                    <div class="relative flex-none h-full mx-2 w-2 flex">
                                        <Show when={props.indexedMessageGroup.length > 1}>
                                            <div
                                                class="absolute left-1/2 top-5 flex justify-center -bottom-3 -translate-x-1/2">
                                                <Show when={index() !== props.indexedMessageGroup.length - 1}>
                                                    <div class="w-[1px] bg-gray-300"></div>
                                                </Show>
                                            </div>

                                            <div class="flex-none h-6 flex items-center">
                                                <div class="h-2 w-2 rounded-full bg-gray-300"></div>
                                            </div>
                                        </Show>
                                    </div>

                                    <div class="w-full overflow-hidden">
                                        <Show
                                            when={imessage.message.tool_calls || imessage.message.role === 'tool'}>
                                            <div class="text-xs my-1 font-semibold">
                                                {imessage.message.tool_calls ? 'call' : 'tool'}
                                                {
                                                    hasError(imessage.message) ? ' error!!!' : ''
                                                }
                                            </div>


                                            <div class={`flex
                                                    ${props.detail === true ? "items-center" : "items-start"} overflow-hidden`}>
                                                {/* json or brief */}
                                                <div
                                                    class="flex-1 text-xs text-gray-500 overflow-x-auto scrollbar-rounded overflow-hidden whitespace-pre-wrap">
                                                    {
                                                        props.detail === true ?
                                                            buildJson(imessage.message)
                                                            :
                                                            buildBrief(imessage.message)
                                                    }
                                                </div>


                                                {/* view button */}
                                                <div class="flex-none ml-4 px-10 w-16 flex justify-center">
                                                    <Show when={hasScreen(imessage.message.content)}>
                                                        <div>
                                                            <button
                                                                disabled={props.viewIndex === imessage.index}
                                                                class={`${props.viewIndex === imessage.index ? 'bg-gray-300' : 'hover:bg-gray-200'}  border-gray-400 w-16 border-2 rounded-2xl py-1 text-xs font-semibold text-gray-400`}
                                                                onClick={() => props.setViewIndex(imessage.index)}
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    </Show>
                                                </div>
                                            </div>
                                        </Show>

                                        <Show
                                            when={
                                                imessage.message.role !== 'tool' && imessage.message.content
                                            }>
                                            <div class="text-base whitespace-pre-wrap">
                                                {imessage.message.content}
                                            </div>
                                        </Show>
                                    </div>

                                </div>
                            </div>
                        }
                    </For>
                </div>

            </div>
        </div>
    </>
}

export default Message
