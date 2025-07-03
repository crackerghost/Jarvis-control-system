const axios = require("axios");

exports.AccessLed = async (value) => {
  try {
    const endpoint = value
      ? process.env.ESP_BASE_URL + "/led/on"
      : process.env.ESP_BASE_URL + "/led/off";

    // Use GET or POST depending on ESP32 code (usually GET for toggle endpoints)
    const response = await axios.get(endpoint);
    res.send({
      status: "success",
      message: value ? "Light turned on" : "Light turned off",
      esp32_response: response.data,
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: error.message,
    });
  }
};
