function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return (true)
    }
    return (false)
}     
function ValidateLetters(val) {
    if (/^[A-Za-z]+$/.test(val)) {
        return (true)
    }
    return (false)
}     