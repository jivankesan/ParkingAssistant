from flask import Flask, make_response, request, jsonify
import serial
import threading
import cohere
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

co = cohere.Client("w3k6SMLDH0SFtVvCwshQoomZwONOsiM5iahj3ixY")

free_spots = 0
ser = serial.Serial("/dev/cu.usbmodem21101", 9600)


def update_free_spots():
    global free_spots
    while True:
        if ser.in_waiting > 0:
            data = ser.readline().decode("utf-8").strip()
            try:
                free_spots = int(data)
            except ValueError:
                print("Could not convert data to integer.")  # Debug print


# Start the thread
thread = threading.Thread(target=update_free_spots)
thread.start()


@app.route("/")
def index():
    print(f"Sending free_spots = {free_spots}")  # Debugging print statement
    response = make_response(f"Free Spots: {free_spots}")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response


# Define a route for handling POST requests to '/ask_question'
@app.route("/ask_question", methods=["POST"])
def ask_question():
    try:
        # Retrieve the string from the JSON payload in the request
        input_string = request.json.get("input_string")

        # Log the received string (optional)
        print(f"Received input string: {input_string}")

        prompt = f"there are 4 total parking spots and {free_spots} open spots. {input_string} and make your answer funny."
        print(f"{free_spots}")
        response = co.generate(prompt=prompt, max_tokens=200)

        print(f"cohere response: {response.generations[0].text}")

        output = response.generations[0].text

        # Return the same string in JSON format
        return jsonify({"output_string": output})

    except Exception as e:
        # Log the error and return an error message in JSON format
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred while processing the request."})


if __name__ == "__main__":
    app.run(port=5000)
