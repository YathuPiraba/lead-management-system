import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth-store";
import { useChangePasswordModal } from "@/hooks/ChangePasswordModal";
import { Button } from "antd";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import coverpic from "@/assets/coverpic.jpg";
import Image from "next/image";
import { toast } from "react-hot-toast";
import "@/styles/app.css"

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { showModal, ChangePasswordModal } = useChangePasswordModal();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await login(userName, password);
      console.log(response, "jj");

      if (response.isFirstLogin) {
        toast.success(response.message);
        showModal();
      } else {
        toast.success(response.message);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Invalid credentials or something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-blue-300 items-center justify-center">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl overflow-hidden h-[90vh]">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Section with Image */}
          <div className="hidden sm:flex lg:w-2/5 bg-white items-center justify-center rounded-l-2xl h-full">
            <div className="w-[85.666667%] h-[94.333333%] overflow-hidden rounded-xl shadow-md">
              <Image
                src={coverpic}
                alt="Student with books"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Right Section with Login Form */}
          <div className="w-full lg:w-3/5 flex justify-center items-center h-full">
            <div className="w-full max-w-md py-6 px-4 rounded-lg">
              {/* Logo */}
              <div className="flex justify-start items-center gap-5 mb-6">
                <Image
                  src="https://res.cloudinary.com/dytx4wqfa/image/upload/v1728032282/pnfqgpmqybjcrlctedp0.jpg"
                  alt="Company Logo"
                  width={68}
                  height={68}
                  className="h-auto w-16 rounded-lg"
                />
                <h2 className="text-4xl mt-4 font-poppins tracking-wider font-bold text-gray-900 mb-2">
                  IMB Connect
                </h2>
              </div>

              {/* Header */}
              <div className="text-justify mb-4">
                <p className="text-gray-600 text-sm font-roboto">
                  Streamline student management and track leads, progress, and
                  insights with IMB Connect.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your username"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex items-center justify-end font-roboto">
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Forgot Password?
                  </a>
                </div>

                {errorMessage && (
                  <p className="text-red-600 text-sm text-center">
                    {errorMessage}
                  </p>
                )}

                <Button
                  htmlType="submit"
                  className="w-full font-poppins login-btn tracking-widest text-lg bg-blue-500 hover:bg-blue-600"
                  loading={isLoading}
                >
                  {isLoading ?  "Logging in...":     "Login"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ChangePasswordModal />
    </div>
  );
};

export default LoginPage;
