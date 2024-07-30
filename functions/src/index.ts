import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import bodyParser from 'body-parser';
import { get3DS, getAccessToken, getPayments, patchPayment, request3DS, requestPayment } from './service';
import * as functions from 'firebase-functions';


const app = express();

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.post('/token', async (req: Request, res: Response) => {
    const {  terminal_code, password } = req.body

    const accessToken = await getAccessToken(terminal_code, password)

    res.json({ accessToken })
})

app.get('/payments', async (req : Request, res: Response) => {
    const {request_id, merchant_order_id} = req.query
    const {authorization} = req.headers    

    if (request_id && merchant_order_id && authorization && authorization.toString().startsWith('Bearer ')) {

        const accessToken = authorization.toString().substring(7)
        
        const payments = await getPayments(accessToken,request_id.toString(), merchant_order_id.toString())

        res.json(payments)
    }
})

app.post('/payment', async (req : Request, res: Response) => {
    const {authorization} = req.headers    

    if (authorization && authorization.toString().startsWith('Bearer ')) {

        const accessToken = authorization.toString().substring(7)
        
        const paymentResponse = await requestPayment(accessToken, req.body)

        res.json(paymentResponse)
    }
})

app.patch('/payment/:payment_id', async (req : Request, res : Response) => {
    const payment_id = req.params.payment_id
    const {authorization} = req.headers

    if (authorization && authorization.toString().startsWith('Bearer ')) {

        const accessToken = authorization.toString().substring(7)
        
        const paymentRes = await patchPayment(accessToken, payment_id,req.body)

        res.json(paymentRes)
    }
}) 

app.get('/authentication/:auth_id', async (req : Request, res: Response) => {
    const auth_id = req.params.auth_id
    const {authorization} = req.headers    

    if (auth_id && authorization && authorization.toString().startsWith('Bearer ')) {

        const accessToken = authorization.toString().substring(7)
        
        const payments = await get3DS(accessToken, auth_id)

        res.json(payments)
    }
})

app.post("/authentication", async (req: Request, res: Response) => {
    const {authorization} = req.headers    

    if (authorization && authorization.toString().startsWith('Bearer ')) {

        const accessToken = authorization.toString().substring(7)
        
        const threeDSRes = await request3DS(accessToken, req.body)

        res.json(threeDSRes)
    }
})



app.post('/', async (req: Request, res: Response) => {

    const accessToken = await getAccessToken("69911", "a15935712X")

    console.log(accessToken)

    const requestId = uuidv4();

    const mobileTokenRes = await fetch("https://sandbox.cardpay.com/api/mobile/token",
        {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer " + accessToken },
            body: JSON.stringify({
                "request": {
                    "id": requestId,
                    "time": new Date().toISOString()
                }
            })
        })

    const mobileToken = await mobileTokenRes.json()

    console.log(mobileToken)

    res.json({ token: mobileToken["mobile_token"] })
});


app.get("/health" , async (req: Request, res: Response) => {
    res.json({ status: "OKAY" })
})

app.post('/3ds_redirect', (req, res) => {
    const newUrl = `https://unlimt-demo.web.app/callback?cres=${req.body["cres"]}`;
  
    res.redirect(newUrl);
  });


exports.api = functions.https.onRequest(app)
