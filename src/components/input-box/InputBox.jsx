function InputBox(props) {
    let inputDiv

    const send = () => {
        const inputValue = inputDiv.textContent
        if (inputValue.trim() === '') {
            return
        }

        inputDiv.textContent = ''

        props.send(inputValue)
    }

    return <>
        <div class="px-4 pb-4 w-full text-left">
            <div class="flex pl-6 pr-2 border-2 border-black rounded-3xl overflow-y-hidden">

                <div class="flex-1 min-h-10 max-h-32 overflow-y-auto scrollbar-rounded">
                    <div
                        ref={inputDiv}
                        class=" my-2 resize-none outline-none text-base text-gray-800"
                        contenteditable="plaintext-only"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                send()
                            }
                        }}
                    >
                    </div>
                </div>
                <div class="flex-none flex justify-center items-end">
                    <button
                        class="group ml-4 mb-1 flex items-center justify-center w-8 h-8 border-4 border-gray-950 rounded-full py-1 text-xs font-semibold text-gray-400 hover:border-gray-600"
                        onClick={send}
                    >
                        <div class="w-4 h-4 bg-gray-950 rounded-full group-hover:bg-gray-600"></div>
                    </button>
                </div>

            </div>
        </div>


        {/*<div class="h-full pb-4 p-4 flex justify-center">*/}
        {/*    <div class="m-4 p-4 flex items-center justify-center w-8/12 border-2 border-black overflow-y-hidden rounded-3x ">*/}
        {/*        <div class="flex-1 flex items-center scrollbar-rounded mx-8 max-h-40 overflow-y-auto">*/}
        {/*            <div class="w-full m-4">*/}
        {/*                <div*/}
        {/*                    class="w-full border-b-2 resize-none outline-none text-base text-gray-800 focus:border-gray-500"*/}
        {/*                    contenteditable>*/}
        {/*                </div>*/}
        {/*            </div>*/}
        {/*        </div>*/}

        {/*    </div>*/}
        {/*</div>*/}
    </>
}

export default InputBox
