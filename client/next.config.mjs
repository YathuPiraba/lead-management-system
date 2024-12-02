/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['rc-util', 'antd', '@ant-design', 'rc-pagination', 'rc-picker'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dytx4wqfa/**",
      },
    ],
  },
};

export default nextConfig;
