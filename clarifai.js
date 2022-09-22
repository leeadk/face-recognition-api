const cfg = require('./config/config.js');

export default accessFaceRecognition = () => {
    const requestJson = JSON.stringify({
        "user_app_id": {
            "user_id": cfg.CLARIFAI.USER_ID,
            "app_id": cfg.CLARIFAI.APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": this.state.imageUrl
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + cfg.CLARIFAI.PAT
        },
        body: requestJson
    };

    fetch("https://api.clarifai.com/v2/models/" + cfg.CLARIFAI.MODEL_ID + "/versions/" + cfg.CLARIFAI.MODEL_VERSION_ID + "/outputs", requestOptions)
        .then(response => response.text())
        .then(data => {
            return JSON.parse(data);
        })
        .catch(err => console.log('error', err));
};


