function hasScreen(contentStr) {
    try {
        if (JSON.parse(contentStr).screen) {
            return true
        }
    } catch (e) {
        return false
    }
    return false
}

export default hasScreen