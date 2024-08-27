import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as functions from 'firebase-functions';
import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path'
import { getAccessToken } from './service';

interface IProxy {
    url : string
    method : "POST" | "GET" | "PATCH",
    contentType? : string
    data : any
 }

const app = express();

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


app.post('/',  async (req: Request, res: Response) => {

    const proxy : IProxy = req.body

    const url = new URL(proxy.url)

    Object.entries(req.query).forEach(([key, value]) => {
        url.searchParams.append(key, value as string)
    })

    const data = await fetch(url, {
        method: proxy.method,
        body:  proxy.contentType === undefined ? JSON.stringify(proxy.data) : proxy.data,
        headers: {Authorization: req.header('Authorization')!, 'Content-Type': proxy.contentType ?? "application/json" }
    })

    res.json(await data.json())

})

app.post('/mobile-token', async (req: Request, res: Response) => {

    const accessToken = await getAccessToken("69911", "a15935712X")

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

    res.json({ token: mobileToken["mobile_token"] })
});

app.get("/health", async (req: Request, res: Response) => {
    res.json({ status: "OKAY" })
})

app.post('/3ds_redirect', (req, res) => {
    const newUrl = `https://unlimt-demo.web.app/callback?cres=${req.body["cres"]}`;

    res.redirect(newUrl);
});

app.post("/applepay-payment-session", async (req: Request, res: Response) => {

    const certPath = path.join(__dirname, '../cert/merchant.com.helloworld', 'certificate_sandbox.pem');
    const keyPath = path.join(__dirname, '../cert/merchant.com.helloworld', 'certificate_sandbox.key');

    const response = await axios.post("https://apple-pay-gateway.apple.com/paymentservices/paymentSession",
        {
            'merchantIdentifier': "merchant.com.helloworld",
            'domainName': 'unlimt-demo.web.app',
            'displayName': 'Collins Ng',
        }
        , {
            headers: {
                'Content-Type': 'application/json',
            },
            httpsAgent: new https.Agent({
                cert: fs.readFileSync(certPath),
                key: fs.readFileSync(keyPath),
            })
        })

    res.json(response.data)

})

app.post("/applepay-payment-session-self-decrypt", async (req: Request, res: Response) => {

    const certPath = path.join(__dirname, '../cert/merchant.com.helloworld.self-descrpt', 'certificate_sandbox.pem');
    const keyPath = path.join(__dirname, '../cert/merchant.com.helloworld.self-descrpt', 'certificate_sandbox.key');

    const response = await axios.post("https://apple-pay-gateway.apple.com/paymentservices/paymentSession",
        {
            'merchantIdentifier': "merchant.com.helloworld.self-descrpt",
            'domainName': 'unlimit-apple-pay.web.app',
            'displayName': 'Collins Ng',
        }
        , {
            headers: {
                'Content-Type': 'application/json',
            },
            httpsAgent: new https.Agent({
                cert: fs.readFileSync(certPath),
                key: fs.readFileSync(keyPath),
            })
        })

    res.json(response.data)

})

exports.api = functions.https.onRequest(app)
