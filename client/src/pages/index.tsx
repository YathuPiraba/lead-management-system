import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth-store";
import { useChangePasswordModal } from "@/hooks/ChangePasswordModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import coverpic from "@/assets/coverpic.jpg";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";

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
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await login(userName, password);
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
    <div className="flex min-h-screen bg-blue-300 px-4 py-1">
      <div className="w-full lg:h-full max-w-4xl bg-white shadow-lg rounded-2xl mx-auto my-auto">
        <div className="flex flex-col lg:flex-row min-h-[500px] max-h-[90vh]">
          {/* Left Section with Image */}
          <div className="hidden lg:flex lg:w-2/5 bg-white items-center justify-center rounded-l-2xl p-4">
            <div className="w-full h-full overflow-hidden rounded-xl shadow-md">
              <Image
                src={coverpic}
                alt="Student with books"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Right Section with Login Form */}
          <div className="w-full lg:w-3/5 flex flex-col h-full">
            <div className="flex flex-col justify-between h-full p-6">
              {/* Logo and Header Section */}
              <div className="flex flex-col justify-center mb-2 mt-3">
                <div className="flex flex-col lg:flex-row items-center gap-5 mb-4">
                  <Image
                    src="https://res.cloudinary.com/dytx4wqfa/image/upload/v1728032282/pnfqgpmqybjcrlctedp0.jpg"
                    alt="Company Logo"
                    width={68}
                    height={68}
                    className="h-auto w-16 rounded-lg"
                  />
                  <h2 className="text-4xl font-poppins tracking-wider font-bold text-gray-900">
                    IMB Connect
                  </h2>
                </div>
                <p className="text-gray-600 text-sm font-roboto mb-2 text-center lg:text-left">
                  Streamline student management and track leads, progress, and
                  insights with IMB Connect.
                </p>
              </div>

              {/* Login Form */}
              <form
                onSubmit={handleLogin}
                className="flex flex-col flex-1 justify-center space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your username"
                    disabled={isLoading}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    disabled={isLoading}
                    required
                    className="h-12"
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
                  type="submit"
                  className="w-full h-12 font-poppins login-btn tracking-widest text-lg bg-blue-500 hover:bg-blue-600 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </div>
                  ) : (
                    "Login"
                  )}
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
