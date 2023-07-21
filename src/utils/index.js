import { SARISKA_MEET_APP_API_KEY } from "../config"
import { GENERATE_TOKEN_URL } from "../constants";

export const getToken = async() => {
    const payload = {
        method : "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            apiKey: SARISKA_MEET_APP_API_KEY,
            user: {
                id: "234",
                name: 'guru'
            },
            exp: "48 hours"
        })
    };
    try {
        const response = await fetch(GENERATE_TOKEN_URL, payload);
        console.log('respnif', response)
        if(response.ok){
            const json = await response.json();
            console.log('json', json)
            localStorage.setItem("SARISKA_MEET_TOKEN", json.token);
            return json.token;
        }else{
            console.log('response.status', response, response.status);
        }
    } catch (error) {
        console.log('error in fetching token', error);
    }
}