const buildJson = (data, isRoot = true) => {
    if (typeof data !== 'object' || data === null) {
        return <span class="border-x-[2px] border-b-[2px] p-1 break-all">
            {(typeof data === 'string' ? `'${data}'` : JSON.stringify(data))}
        </span>
    }

    const items = Object.entries(data).map(([key, value]) => (
        <div class="contents">
            <span class="border-l-[2px] border-b-[2px] p-1">{key}</span>
            {Array.isArray(value) || typeof value === 'object' ? (
                buildJson(value, false)
            ) : (
                buildJson(value, false)
            )}
        </div>
    ))

    return isRoot ? (
        <div class="grid grid-cols-[max-content_1fr] border-t-[2px] min-w-fit">
            {items}
        </div>
    ) : (
        <div class="grid grid-cols-[max-content_1fr]">
            {items}
        </div>
    )
}

export default buildJson