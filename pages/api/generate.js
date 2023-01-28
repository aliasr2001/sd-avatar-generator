//Adding the ArrayBuffer to Base64 converter function
const bufferToBase64 = (buffer) => {
    let arr = new Uint8Array(buffer);
    const base64 = btoa(
    arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return `data:image/png;base64,${base64}`;
};

const generateAction = async (req, res) => {
    console.log('Recieved request')

    //Go input from the body of the req
    const input = JSON.parse(req.body).input;

    //Sending fetch req to Huggging Face
    const response = await fetch(
        `https://api-inference.huggingface.co/models/aliasr2001/sd-1-5-aliasr`, 
        {
            headers: {
                Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                inputs: input,
            }),
        }
    );

    // Checking for different statuses to send proper Payload
    if(response.ok){
        const buffer = await response.arrayBuffer();
        // Convert the base64
        const base64 = bufferToBase64(buffer);
        // Make sure to change to Base64
        res.status(200).json({ image: base64 });
    } else if (response.status === 503 ){
        const json = await response.json();
        res.status(503).json(json);
    } else {
        const json = await response.json();
        res.status(response.status).json({ error: response.statusText })
    }
};

export default generateAction;