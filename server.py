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
import io
from google import genai
from google.genai import types
from PIL import Image, ImageEnhance
from io import BytesIO
from rembg import remove
import PIL.Image
from flask import send_file
import os
import base64

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

def upload_image_to_s3(image, user_id, filename, category):
    """
    Uploads the image to S3 under the user's specific folder.
    """
    print("IN S3")
    try:
       
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)


        object_name = f"{user_id}/{filename}"
        extra_args = {'ContentType': 'image/jpeg'}
        if category:
            extra_args['Metadata'] = {'category': category}

        s3.upload_fileobj(img_byte_arr, bucket_name, object_name, ExtraArgs={'ContentType': 'image/jpeg', 'Metadata': {'category': category}})
        print(f"Image uploaded to S3 at {object_name} with category metadata: {category}")

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
    


def upload_post_image_to_s3(image, awsPhotoKey, PostID):
    """
    Uploads the image to S3 under 'posts/awsPhotoKey' based on the provided key.
    """
    try:
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)

        s3.upload_fileobj(
            img_byte_arr,
            bucket_name,
            f"posts/{awsPhotoKey}/all/{PostID}.jpg",
            ExtraArgs={'ContentType': 'image/jpeg'}
        )
        print(f"Image uploaded to S3 at posts/{awsPhotoKey}")

        return f"posts/{awsPhotoKey}"  # Return the S3 path of the uploaded image

    except NoCredentialsError:
        print("S3 credentials not available.")
        return None
    except Exception as e:
        print(f"Error uploading image to S3: {str(e)}")
        return None

@app.route("/uploadImage", methods=["POST"])
def uploadImage():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400        
        
        file = request.files["file"]
        user_id = request.form.get("user_id", "default_user") 

        filename = file.filename

        try:
    
            image = Image.open(io.BytesIO(file.read()))
            # noBackImage = remove(image)
            # noBack = Image.open(io.BytesIO(noBackImage))
            category = predictCategory2(image)
        except Exception as e:
            return jsonify({"error": f"Error processing image: {str(e)}"}), 400
        image2 = image
        pil_image = image2

       
        uploaded_image_path = upload_image_to_s3(pil_image, user_id, filename, category)
        if uploaded_image_path:
            print("Uploaded succesfully")
            return jsonify({"category": category})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500

def predictCategory2(image_input):
    try:
        if isinstance(image_input, Image.Image):
            img_byte_arr = io.BytesIO()
            image_input.save(img_byte_arr, format="JPEG")
            image_bytes = img_byte_arr.getvalue()
        elif isinstance(image_input, bytes):
            image_bytes = image_input
        else:
            raise ValueError("Expected image in bytes or PIL format")

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        image = transform(image).unsqueeze(0).to(device)


        with torch.no_grad():
            output = model(image)
            _, predicted = torch.max(output, 1)

        predicted_class = class_names[predicted.item()]
        print(f"Predicted class: {predicted_class}")

        return predicted_class

    except Exception as e:
        print(f"Error in predictCategory2: {str(e)}")
        return None




@app.route("/predict", methods=["POST"])
def predictCategory():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400        
        
        file = request.files["file"]

        try:
           
            image = Image.open(io.BytesIO(file.read()))
        except Exception as e:
            return jsonify({"error": f"Error processing image: {str(e)}"}), 400
        image.convert("RGB")
        image = transform(image).unsqueeze(0).to(device)


        with torch.no_grad():
            output = model(image)
            _, predicted = torch.max(output, 1)

        predicted_class = class_names[predicted.item()]
        print(f"Predicted class: {predicted_class}")

        return jsonify({"predicted_class": predicted_class})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500

@app.route("/deleteImage", methods=["GET"])
def deleteImage():
    user_id = request.args.get("user_id")
    image_name = request.args.get("image_name")
    if not user_id or not image_name:
        return jsonify({"error": "User ID and image name are required"}), 400
    
    try:

        image_key = f"{image_name}"    
        path = '/'.join(image_key.split('/')[3:])


        response = s3.delete_object(Bucket=bucket_name, Key=path)

        if response['ResponseMetadata']['HTTPStatusCode'] == 204:
            return jsonify({"message": "Image deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to delete image"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@app.route("/get_user_photos", methods=["GET"])
def get_user_photos():
    """
    Fetch the list of photos uploaded by the user and categorize them by metadata.
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

        categorized_photos = {}

        for content in response["Contents"]:
            if content["Key"] == f"{folder_name}placeholder.txt":
                continue 

            metadata_response = s3.head_object(Bucket=bucket_name, Key=content["Key"])
            category = metadata_response.get("Metadata", {}).get("category", "uncategorized")  # Default to "uncategorized" if no metadata

            photo_url = f"https://{bucket_name}.s3.amazonaws.com/{content['Key']}"

            if category not in categorized_photos:
                categorized_photos[category] = []

            categorized_photos[category].append(photo_url)

        return jsonify({"photos": categorized_photos})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
    

@app.route("/createPost", methods=["POST"])
def createPost():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400        
        
        file = request.files["file"]
        awsPhotoKey = request.form.get("awsPhotoKey")
        PostID = request.form.get("PostID")

        if not awsPhotoKey:
            return jsonify({"error": "awsPhotoKey is required"}), 400

        filename = file.filename

        try:
            image = Image.open(io.BytesIO(file.read()))
        except Exception as e:
            return jsonify({"error": f"Error processing image: {str(e)}"}), 400

        s3_path = upload_post_image_to_s3(image, awsPhotoKey, PostID)

        if(s3_path):
            return jsonify({"message": "Post created successfully"})
        return jsonify({"error": "Error uploading image to S3"}), 500

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500

@app.route("/fetchAllPostsForUser", methods=["GET"])
def fetchAllPostsForUser():
    try:
        awsPhotoKey = request.args.get("awsPhotoKey")
        numPosts = request.args.get("postCount", default=10, type=int) 

        if not awsPhotoKey:
            return jsonify({"error": "awsPhotoKey is required"}), 400

        folder_prefix = f"posts/{awsPhotoKey}/all/"
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_prefix)

        if "Contents" not in response:
            return jsonify({"message": "No posts found for this user."}), 404

        post_urls = []

        for content in response["Contents"]:
            post_url = f"https://{bucket_name}.s3.amazonaws.com/{content['Key']}"
            post_urls.append(post_url)

        return jsonify({"posts": post_urls[:numPosts]}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500



@app.route("/changeCategory", methods=["GET"])
def changeCategory():
    user_id = request.args.get("user_id")
    image_name = request.args.get("image_name")
    new_category = request.args.get("new_category")

    if not user_id or not image_name or not new_category:
        return jsonify({"error": "User ID, image name, and new category are required"}), 400

    try:
        image_key = f"{image_name}"
        path = '/'.join(image_key.split('/')[3:])
        
        response = s3.head_object(Bucket=bucket_name, Key=path)

        new_metadata = response['Metadata']
        new_metadata['category'] = new_category

        s3.copy_object(
            Bucket=bucket_name,
            CopySource={'Bucket': bucket_name, 'Key': path},
            Key=path,
            Metadata=new_metadata,
            MetadataDirective='REPLACE'
        )

        return jsonify({"message": "Category updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def removeBackground(base_image):
  with io.BytesIO() as output:
    base_image.save(output, format="PNG")
    img_bytes = output.getvalue()
    output_bytes = remove(img_bytes)
    output_image = Image.open(io.BytesIO(output_bytes))
    return output_image


@app.route("/generateOutfit", methods=["POST"])
def generateOutfit():


    
    baseFile = request.files["baseFile"]
    topFile = request.files["topFile"]
    bottomFile = request.files["bottomFile"]
    print("base: ", baseFile, "\n top: ", topFile, "\n bottom: ", bottomFile)
      
    base_image = PIL.Image.open(baseFile)
    imageToUse2 = removeBackground(base_image)
    imageToUse2.save('jakeLow.png', quality=10)
    imageToUse2 = PIL.Image.open('jakeLow.png') 
    imageToUse2 = imageToUse2.resize((183, 275))
    imageToUse2.info = {}
    top = PIL.Image.open(topFile)
    bottom = PIL.Image.open(bottomFile)

    client = genai.Client(api_key="AIzaSyDG3tSZ_gxwdsuMxNeO5HIiEaVi03oX4nM")

    text_input = (
        "Create an ultra realistic photo of this digital character "
        "show the full body of the character and put the hoodie on with the arms gently sloping along with their body and put the pants on and put the shoes on the characters feet"
    )

    response = client.models.generate_content(
    model="gemini-2.0-flash-exp-image-generation",
    contents=[text_input, imageToUse2, top, bottom],
    config=types.GenerateContentConfig(
        response_modalities=['Text', 'Image']
        )
    )
    
    if response.candidates and response.candidates[0].content:
        for part in response.candidates[0].content.parts:
            if hasattr(part, 'text') and part.text is not None:
                print(part.text)
            elif hasattr(part, 'inline_data') and part.inline_data is not None:
                result_image = Image.open(BytesIO(part.inline_data.data))
                imageToShow = removeBackground(result_image)
                    
                img_io = BytesIO()
                imageToShow.save(img_io, 'PNG')
                base_64Image = base64.b64encode(img_io.getvalue()).decode('utf-8')
                img_io.seek(0)

                print("SENT THE IMAGE TO THE JS", imageToShow)

                # Return as a JSON response with the base64 image data
                return jsonify({"image": base_64Image})
    else:
        print("No content returned. Likely a safety block or model rejection.")




    # For example, return a dummy URL (you can replace this with actual image processing logic)
    return jsonify({"imageUrl": "https://example.com/generated_outfit.jpg"}), 200



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
