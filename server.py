import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
from flask import Flask, request, jsonify
from PIL import Image
import io
import boto3
from botocore.exceptions import NoCredentialsError
import uuid  
import numpy as np

app = Flask(__name__)


s3 = boto3.client('s3')
bucket_name = 'techtylistsimagestorage'


class_names = ['hats', 'hoodies', 'jackets', 'pants', 'shirts', 'skirts']


device = torch.device("cpu")


model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)


num_features = model.fc.in_features
model.fc = torch.nn.Linear(num_features, 6)

model.load_state_dict(torch.load("clothing_classifier.pth", map_location=device))
model.to(device)
model.eval()


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
       
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)


        object_name = f"{user_id}/{filename}"
        s3.upload_fileobj(img_byte_arr, bucket_name, object_name, ExtraArgs={'ContentType': 'image/jpeg'})
        print(f"Image uploaded to S3 at {object_name}")

        return object_name 

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

        folder_name = f"{user_id}/"  
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

    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=username + "/", MaxKeys=1)


    return "Contents" in response and len(response["Contents"]) > 0

@app.route("/register", methods=["POST"])
def register_user():
    """
    Register a new user and create their folder in S3.
    """
    try:
        user_data = request.json
        username = user_data.get("username") 
        
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        user_id = str(uuid.uuid4())  

        if check_username_exists_in_s3(username):
            return jsonify({"error": "Username is already taken"}), 400

        user_data["user_id"] = user_id 

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
        user_id = request.form.get("user_id", "default_user") 

        filename = file.filename

        try:
           
            image = Image.open(io.BytesIO(file.read()))
        except Exception as e:
            return jsonify({"error": f"Error processing image: {str(e)}"}), 400
        image2 = image
        image.convert("RGB")
        image = transform(image).unsqueeze(0).to(device)


        with torch.no_grad():
            output = model(image)
            _, predicted = torch.max(output, 1)

        predicted_class = class_names[predicted.item()]
        print(f"Predicted class: {predicted_class}")

        pil_image = image2

       
        uploaded_image_path = upload_image_to_s3(pil_image, user_id, filename)
        if uploaded_image_path:
            return jsonify({"predicted_class": predicted_class, "image_uploaded_to": uploaded_image_path})

        return jsonify({"predicted_class": predicted_class})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500

    
@app.route("/get_user_photos", methods=["GET"])
def get_user_photos():
    """
    Fetch the list of photos uploaded by the user.
    """
    try:
        user_id = request.args.get("user_id") 
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        user_id = user_id.strip(':') 

        print(f"User ID received: {user_id}")

        folder_name = f"{user_id}/"
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)

        print(f"S3 Response: {response}")

        if "Contents" not in response:
            return jsonify({"message": "No photos found for this user."}), 404

       
        photos = [content["Key"] for content in response["Contents"] if content["Key"] != f"{folder_name}placeholder.txt"]

        photo_urls = [f"https://{bucket_name}.s3.amazonaws.com/{photo}" for photo in photos]

        return jsonify({"photos": photo_urls})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
