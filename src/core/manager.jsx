import {createSignal} from "solid-js";
import hasScreen from "./util/hasScreen.jsx";


const baseURL = import.meta.env.VITE_BASE_URL

class Manager {
    constructor() {
        const [messages, setMessages] = createSignal([])
        this._messages = messages
        this._setMessages = setMessages

        const [viewIndex, setViewIndex] = createSignal(-1)
        this._viewIndex = viewIndex
        this._setViewIndex = setViewIndex

        const [scrollDownTrigger, setScrollDownTrigger] = createSignal(0)
        this._scrollDownTrigger = scrollDownTrigger
        this._setIsScrollDownTrigger = setScrollDownTrigger

        this._user_call_count = 0
    }

    get messages() {
        return this._messages
    }

    get viewIndex() {
        return this._viewIndex
    }

    get setViewIndex() {
        return this._setViewIndex
    }

    get scrollDownTrigger() {
        return this._scrollDownTrigger
    }

    _setMessagesAndScrollDown(any, force = true) {
        this._setMessages(any)
        this._setIsScrollDownTrigger(prev => {
            if (force) {
                // force: 0~99
                return prev >= 99 ? 0 : prev + 1
            } else {
                // unforce: >=100
                return prev + 100
            }
        })
    }

    async addUserMessage(content) {
        this._setMessagesAndScrollDown(prev => [...prev, {
            role: 'user',
            content: content,
        }])

        await this._predict()

        let times = 0
        while (times < 5) {
            const lastMsg = this._messages()[this._messages().length - 1]

            if (lastMsg.hasOwnProperty('tool_calls')) {
                await this._call()
                await this._predict()
                times += 1
            } else {
                break
            }
        }
    }


    async _predict() {
        const newMessage = {role: 'assistant', content: ''}
        this._setMessagesAndScrollDown(prev => [...prev, newMessage])

        const response = await fetch(`${baseURL}/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream, application/json',
            },
            body: JSON.stringify({"messages": this._messages().slice(0, -1)})
        })

        if (!response.ok) {
            const content = await response.text()
            throw new Error(`HTTP error! status: ${response.status}, ${content}`)
        }

        const contentType = response.headers.get('Content-Type')
        if (contentType === 'application/json') {
            throw new Error(`Server error: ${await response.json()}`)
        } else if (typeof contentType === 'string' && !contentType.includes('text/event-stream')) {
            throw new Error(`Unexpected content type: ${contentType}`)
        }


        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        let buffer = ''
        while (true) {
            const {done, value} = await reader.read()

            if (done) {
                break
            }

            const chunks = decoder.decode(value)
            buffer += chunks

            while (true) {
                const endIndex = buffer.indexOf('\n\n')
                if (endIndex === -1) {
                    break
                }

                const chunk = buffer.slice(0, endIndex)

                buffer = buffer.slice(endIndex + 2)

                const rawData = chunk.slice(6)

                const chunkObj = JSON.parse(rawData)

                const finishReason = chunkObj.choices[0].finish_reason
                if (finishReason != null) {
                    return
                }

                const delta = chunkObj.choices[0].delta

                const content = delta.content
                const tool_calls = delta.tool_calls

                if (content != null) {
                    if (!newMessage.hasOwnProperty('content')) {
                        newMessage.content = ''
                    }

                    newMessage.content += content

                    this._setMessagesAndScrollDown(prev => {
                        const lastMsg = prev[prev.length - 1]

                        if (!lastMsg.hasOwnProperty('content')) {
                            lastMsg.content = ''
                        }

                        lastMsg.content = newMessage.content
                        return [...prev]
                    }, false)
                } else if (tool_calls != null) {

                    const tool_call = tool_calls[0]

                    const index = tool_call.index
                    const tool_call_id = tool_call.id
                    const funcName = tool_call.function.name
                    const args = tool_call.function.arguments
                    const type = tool_call.type

                    this._setMessagesAndScrollDown(prev => {
                        const lastMsg = prev[prev.length - 1]

                        if (!lastMsg.hasOwnProperty('tool_calls')) {
                            lastMsg.tool_calls = [{}]
                        }

                        if (index != null) {
                            lastMsg.tool_calls[0].index = index
                        }

                        if (tool_call_id != null) {
                            lastMsg.tool_calls[0].id = tool_call_id
                        }

                        if (funcName != null) {
                            lastMsg.tool_calls[0].function = {name: funcName}
                        }

                        if (args != null) {
                            if (!lastMsg.tool_calls[0].function.hasOwnProperty('arguments')) {
                                lastMsg.tool_calls[0].function.arguments = ''
                            }

                            lastMsg.tool_calls[0].function.arguments += args
                        }

                        if (type != null) {
                            lastMsg.tool_calls[0].type = type
                        }

                        return [...prev]
                    }, false)

                } else {
                    console.error('Unknown delta: ', delta)
                }
            }

        }

    }

    async addUserNewSessionMessage() {
        const userCallId = this._getUserCallId()

        this._setMessagesAndScrollDown(prev => [...prev, {
            role: 'user',
            tool_calls: [
                {
                    index: '0',
                    id: userCallId,
                    function: {
                        name: "new_session",
                        arguments: '{}',
                    },
                    type: "function"
                }
            ]
        }])

        await this._call()
    }

    async addUserDisplayMessage(sessionId) {
        const userCallId = this._getUserCallId()

        this._setMessagesAndScrollDown(prev => [...prev, {
            role: 'user',
            tool_calls: [
                {
                    index: '0',
                    id: userCallId,
                    function: {
                        name: "display",
                        arguments: JSON.stringify({
                            session_id: sessionId
                        }),
                    },
                    type: "function"
                }
            ]
        }])

        await this._call()
    }

    async addUserExecuteMessage(session_id, actions) {
        const userCallId = this._getUserCallId()
        this._setMessagesAndScrollDown(prev => [...prev, {
            role: 'user',
            tool_calls: [
                {
                    id: userCallId,
                    function: {
                        name: "execute",
                        arguments: JSON.stringify({
                            session_id: session_id,
                            actions: actions
                        }),
                    },
                    type: "function"
                }
            ]
        }])

        await this._call()
    }

    _getUserCallId() {
        return `user_call_${this._user_call_count++}`
    }

    async _call() {
        const lastMessage = this._messages()[this._messages().length - 1]

        if (!lastMessage.hasOwnProperty('tool_calls')) {
            return
        }

        const tool_call_id = lastMessage.tool_calls[0].id
        const funcName = lastMessage.tool_calls[0].function.name
        const args = lastMessage.tool_calls[0].function.arguments

        let url = ''
        switch (funcName) {
            case "new_session":
                url = `${baseURL}/session`
                break
            case "display":
                url = `${baseURL}/display`
                break
            case "execute":
                url = `${baseURL}/execute`
                break
            default:
                console.error("Unknown function name: ", funcName)
                return
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: args
        })

        let data = await response.text()


        this._setMessagesAndScrollDown(prev => [...prev, {
            role: 'tool',
            content: data,
            tool_call_id: tool_call_id,
        }])

        if (hasScreen(data) === true) {
            this.setViewIndex(this.messages().length - 1)
        }
    }

}

export default Manager