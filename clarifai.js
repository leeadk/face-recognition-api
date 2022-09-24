const { json } = require('express');
const cfg = require('./config/config.js');


const faceRecognition = async (img) => {
    const requestJson = JSON.stringify({
        "user_app_id": {
            "user_id": cfg.CLARIFAI.USER_ID,
            "app_id": cfg.CLARIFAI.APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": img
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
    console.log('Checking img ', img);
    return await fetch("https://api.clarifai.com/v2/models/" + cfg.CLARIFAI.MODEL_ID + "/versions/" + cfg.CLARIFAI.MODEL_VERSION_ID + "/outputs", requestOptions)
        .then(response => response.text())
        .then(text => JSON.parse(text))
        .then(data => processRegions(data.outputs[0].data.regions))
        //.then(data => data.outputs[0].data.regions[0].region_info.bounding_box)
        .catch(err => console.log('ERROR:', err));
}

const processRegions = (regions) => {
    console.log(regions);
    let res = [];
    regions.forEach(region => {
        res.push(region.region_info.bounding_box);
    })

    console.log(res);
    return res;
}



module.exports = faceRecognition;


