import React, { useState, useRef, FormEvent } from "react";
import { Camera, Save, Trash, X, Check, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import ReactCrop, { centerCrop, Crop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useAuth } from "@/stores/auth-store";

const SettingsPage = () => {
  const [username, setUsername] = useState<string>("admin_user");
  const [email, setEmail] = useState<string>("admin@example.com");
  const [isEditingImage, setIsEditingImage] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    height: 50,
    x: 0,
    y: 0,
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const { user } = useAuth();

  console.log(user);

  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  const handleCropComplete = async (crop: Crop) => {
    if (imgRef.current && crop.width && crop.height) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return; // Add null check for ctx

      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = crop.width * scaleX;
      canvas.height = crop.height * scaleY;

      ctx.drawImage(
        imgRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const base64Image = canvas.toDataURL("image/jpeg", 0.9);

      // Convert base64 to blob
      const res = await fetch(base64Image);
      const blob = await res.blob();
      const file = new File([blob], "profile-image.jpg", {
        type: "image/jpeg",
      });

      // Upload cropped image
      const formData = new FormData();
      formData.append("image", file);
      setImageLoading(true);

      try {
        // await updateAdminDetailsApi(user.userId, formData);
        setIsEditingImage(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setImageLoading(false);
      }
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result as string);
        setIsEditingImage(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleChangePicture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  const deleteImage = async () => {
    try {
      // await deleteProfileAPI(user.userId);
      setIsEditingImage(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error deleting profile picture:", error);
    }
  };

  const updateDetails = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDetailsOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const updatePassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPasswordOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mt-16 mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      {showSuccess && (
        <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            Changes saved successfully
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-40 h-40 relative">
              <Image
                src={
                  user?.image ||
                  "https://res.cloudinary.com/dytx4wqfa/image/upload/v1745391479/default_avatar_qkltme.png"
                }
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <button
              onClick={handleChangePicture}
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow hover:bg-blue-600"
            >
              <Camera size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onSelectFile}
              style={{ display: "none" }}
              accept="image/*"
            />
          </div>

          <div className="mt-4 space-y-2 w-full">
            <Button
              variant="destructive"
              onClick={deleteImage}
              className="w-full"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Image
            </Button>
          </div>
        </div>

        <Dialog open={isEditingImage} onOpenChange={setIsEditingImage}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crop Profile Image</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center py-4">
              <div className="w-full">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  {
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={imgSrc}
                      onLoad={onImageLoad}
                      className="max-w-full"
                    />
                  }
                </ReactCrop>
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  onClick={() => handleCropComplete(crop)}
                  variant="default"
                >
                  {imageLoading ? (
                    <span className="flex items-center gap-2">
                      Saving... <Loader className="h-6 w-6 animate-spin" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingImage(false);
                    setImgSrc("");
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex items-center border rounded-md p-2 bg-gray-50 dark:bg-gray-700">
                <span className="text-gray-700 dark:text-gray-300">
                  {user?.userName || "No username available"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center border rounded-md p-2 bg-gray-50 dark:bg-gray-700">
                <span className="text-gray-700 dark:text-gray-300">
                  {user?.email || "No email available"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">Update Details</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Profile Details</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={updateDetails} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="update-username">Username</Label>
                      <Input
                        id="update-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="update-email">Email</Label>
                      <Input
                        id="update-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDetailsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Change Password</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={updatePassword} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPasswordOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Update Password</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
