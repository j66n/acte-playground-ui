const buildBrief = (message) => {
    let brief = ''

    if (message.hasOwnProperty('tool_calls')) {
        const tool_call = message.tool_calls[0]

        let argsObj = {}
        try {
            argsObj = JSON.parse(tool_call.function.arguments)
        } catch (e) {
            new Error('parse args')
        }

        const funcName = tool_call.function.name
        brief += `${funcName}`

        if (argsObj.hasOwnProperty('actions')) {
            for (const action of argsObj.actions) {
                brief += `\n · ${action.action_type} ${action.target_id}`
                if (action.hasOwnProperty('value')) {
                    brief += ` ${action.value}`
                }
            }
        }
    } else if (message.role === 'tool') {
        return 'done'
    }

    return brief
}

export default buildBrief