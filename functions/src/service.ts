export async function getAccessToken(terminalCode: string, password: string) {

    const body = new URLSearchParams();

    body.append("grant_type", "password")
    body.append("terminal_code", terminalCode)
    body.append("password", password)

    const accessTokenRes = await fetch("https://sandbox.cardpay.com/api/auth/token", {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    })

    const accessTokenData = await accessTokenRes.json()

    return accessTokenData["access_token"]

}