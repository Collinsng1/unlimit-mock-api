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

export async function getPayments (accessToken : string, request_id : string, merchant_order_id : string) {
    const query = new URLSearchParams();

    query.append("request_id", request_id)
    query.append("merchant_order_id", merchant_order_id)

    const getPaymentsRes = await fetch(`https://sandbox.cardpay.com/api/payments?${query.toString()}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer " + accessToken },
    })

    return await getPaymentsRes.json()
}

export async function requestPayment (accessToken : string, payload : any) {

    const paymentRequestRes = await fetch("https://sandbox.cardpay.com/api/payments", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' , 'Authorization': "Bearer " + accessToken },
        body: JSON.stringify(payload)
    
    })


    return await paymentRequestRes.json()
}

export async function patchPayment (accessToken : string, payment_id : string, payload : any) {
    const paymentRequestRes = await fetch(`https://sandbox.cardpay.com/api/payments/${payment_id}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' , 'Authorization': "Bearer " + accessToken },
        body: JSON.stringify(payload)
    })

    return await paymentRequestRes.json()

}

export async function request3DS (accessToken : string, payload : any) {
    
    const threeDSRes = await fetch("https://sandbox.cardpay.com/api/authentication", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' , 'Authorization': "Bearer " + accessToken },
        body: JSON.stringify(payload)
    })

    return await threeDSRes.json()
} 

export async function get3DS (accessToken : string, authId : string) {

    const get3DSRes = await fetch(`https://sandbox.cardpay.com/api/authentication/${authId}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer " + accessToken },
    })

    return await get3DSRes.json()
}