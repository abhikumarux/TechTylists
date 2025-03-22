import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
from flask import Flask, request, jsonify
from PIL import Image
import io
import boto3
from botocore.exceptions import NoCredentialsError
import uuid  # For generating unique user IDs
import numpy as np

app = Flask(__name__)

# AWS S3 Setup
s3 = boto3.client('s3')
bucket_name = 'techtylistsimagestorage'  # Replace with your bucket name

# Class names for the output categories
class_names = ['hats', 'hoodies', 'jackets', 'pants', 'shirts', 'skirts']

# Set the device for model computation (CPU in this case)
device = torch.device("cpu")

# Load the model once when the app starts
model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)

# Update the final fully connected layer to match the number of classes (6)
num_features = model.fc.in_features
model.fc = torch.nn.Linear(num_features, 6)

# Load the pre-trained weights
model.load_state_dict(torch.load("clothing_classifier.pth", map_location=device))
model.to(device)
model.eval()

# Define the image transformation steps (resize, normalization)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def upload_image_to_s3(image, user_id, filename):
    """
    Uploads the image to S3 under the user's specific folder.
    """
    try:
        # Convert the image to bytes for uploading
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)

        # Upload to S3 under a folder named by user_id and include the original filename
        object_name = f"{user_id}/{filename}"
        s3.upload_fileobj(img_byte_arr, bucket_name, object_name, ExtraArgs={'ContentType': 'image/jpeg'})
        print(f"Image uploaded to S3 at {object_name}")

        return object_name  # Return the S3 object URL or path if needed

    except NoCredentialsError:
        print("Credentials not available.")
        return None
    except Exception as e:
        print(f"Error uploading image to S3: {str(e)}")
        return None

def create_user_folder(user_id):
    """
    Create a user-specific folder in the S3 bucket.
    """
    try:
        # Create an empty "folder" in the S3 bucket by uploading an empty object
        folder_name = f"{user_id}/"  # User-specific folder
        s3.put_object(Bucket=bucket_name, Key=f"{folder_name}placeholder.txt")
        print(f"Folder created for user {user_id} in S3")
        return True
    except NoCredentialsError:
        print("No credentials available.")
        return False
    except Exception as e:
        print(f"Error creating user folder: {str(e)}")
        return False


def check_username_exists_in_s3(username):
    """
    Check if a folder with the given username already exists in the S3 bucket.
    """
    # Prefix is the username, since it's the beginning of the folder name
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=username + "/", MaxKeys=1)

    # If we get any results, that means the folder (username) already exists
    return "Contents" in response and len(response["Contents"]) > 0

@app.route("/register", methods=["POST"])
def register_user():
    """
    Register a new user and create their folder in S3.
    """
    try:
        # Get user details from the request (e.g., username, password, etc.)
        user_data = request.json
        username = user_data.get("username")  # Extract username from the request
        
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        # Generate a unique user_id (you can use your database-generated ID if applicable)
        user_id = str(uuid.uuid4())  # Generate unique user_id

        # Check if the folder already exists in S3
        if check_username_exists_in_s3(username):
            return jsonify({"error": "Username is already taken"}), 400

        user_data["user_id"] = user_id  # Add the user_id to the registration data

        # Create user-specific folder in S3
        folder_created = create_user_folder(username)

        if folder_created:
            return jsonify({"message": "User registered successfully", "user_id": user_id}), 201
        else:
            return jsonify({"error": "Error creating user folder in S3"}), 500

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400        
        
        file = request.files["file"]
        user_id = request.form.get("user_id", "default_user")  # Get user_id from form data (default to "default_user")

        # Store the filename from the uploaded file
        filename = file.filename

        try:
            # Open the image from the request
            image = Image.open(io.BytesIO(file.read()))
        except Exception as e:
            return jsonify({"error": f"Error processing image: {str(e)}"}), 400
        image2 = image
        image.convert("RGB")
        # Apply transformations to the image
        image = transform(image).unsqueeze(0).to(device)

        # Make prediction without updating gradients (for performance)
        with torch.no_grad():
            output = model(image)
            _, predicted = torch.max(output, 1)

        predicted_class = class_names[predicted.item()]
        print(f"Predicted class: {predicted_class}")

        pil_image = image2

        # Upload the image to the user's folder in the S3 bucket
        uploaded_image_path = upload_image_to_s3(pil_image, user_id, filename)
        if uploaded_image_path:
            return jsonify({"predicted_class": predicted_class, "image_uploaded_to": uploaded_image_path})

        return jsonify({"predicted_class": predicted_class})

    except Exception as e:
        # Catch any unhandled errors
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500

    
@app.route("/get_user_photos", methods=["GET"])
def get_user_photos():
    """
    Fetch the list of photos uploaded by the user.
    """
    try:
        user_id = request.args.get("user_id")  # Get user_id from query parameters
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        # Remove any unwanted characters (like colons) from the user_id
        user_id = user_id.strip(':')  # Strip colon if it's appended

        print(f"User ID received: {user_id}")

        # List objects in the S3 folder for the given user
        folder_name = f"{user_id}/"
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)

        print(f"S3 Response: {response}")

        if "Contents" not in response:
            return jsonify({"message": "No photos found for this user."}), 404

        # Extract the object keys (file paths) from the response
        photos = [content["Key"] for content in response["Contents"] if content["Key"] != f"{folder_name}placeholder.txt"]

        # Construct S3 URLs for the images (optional)
        photo_urls = [f"https://{bucket_name}.s3.amazonaws.com/{photo}" for photo in photos]

        return jsonify({"photos": photo_urls})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
